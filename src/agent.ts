import { AskarModule, AskarMultiWalletDatabaseScheme } from '@aries-framework/askar'
import {
  Agent,
  CacheModule,
  ConnectionEventTypes,
  ConnectionState,
  ConnectionStateChangedEvent,
  ConnectionsModule,
  DidCommMimeType,
  DidCommV1Service,
  DidDocument,
  DidExchangeState,
  HttpOutboundTransport,
  InMemoryLruCache,
  KeyDerivationMethod,
  KeyType,
  MediatorModule,
  OutOfBandRole,
  OutOfBandState,
  TypedArrayEncoder,
  WalletConfig,
  WsOutboundTransport,
  getEd25519VerificationKey2018,
} from '@aries-framework/core'
import { HttpInboundTransport, WsInboundTransport, agentDependencies } from '@aries-framework/node'
import { ariesAskar } from '@hyperledger/aries-askar-nodejs'
import type { Socket } from 'net'

import express from 'express'
import { Server } from 'ws'

import {
  AGENT_ENDPOINTS,
  AGENT_NAME,
  AGENT_PORT,
  DID_WEB_SEED,
  LOG_LEVEL,
  POSTGRES_HOST,
  WALLET_KEY,
  WALLET_NAME,
} from './constants'
import { askarPostgresConfig } from './database'
import { Logger } from './logger'
import { StorageMessageQueueModule } from './storage/StorageMessageQueueModule'

function createModules() {
  const modules = {
    StorageModule: new StorageMessageQueueModule(),
    cache: new CacheModule({
      cache: new InMemoryLruCache({ limit: 500 }),
    }),
    connections: new ConnectionsModule({
      autoAcceptConnections: true,
    }),
    mediator: new MediatorModule({
      autoAcceptMediationRequests: true,
    }),
    askar: new AskarModule({
      ariesAskar,
      multiWalletDatabaseScheme: AskarMultiWalletDatabaseScheme.ProfilePerWallet,
    }),
  }

  return modules
}

async function createAndImportDid(agent: MediatorAgent) {
  const httpEndpoint = agent.config.endpoints.find((e) => e.startsWith('http')) as string
  const domain = httpEndpoint.replace(/^https?:\/\//, '')
  const did = `did:web:${domain}`

  const createdDids = await agent.dids.getCreatedDids({ did })
  if (createdDids.length > 0) {
    const { did, didDocument } = createdDids[0]
    return { did, didDocument }
  }

  // TODO: if there is a did:web in the wallet and the did was not found previously
  // the url on which the did:web is hosted has probably changed.
  const didWebs = await agent.dids.getCreatedDids({ method: 'web' })
  if (didWebs.length > 0) {
    // TODO: remake
    await agent.wallet.delete()
    await agent.shutdown()
    await agent.initialize()
  }

  const privateKey = TypedArrayEncoder.fromString(DID_WEB_SEED)
  const key = await agent.wallet.createKey({ keyType: KeyType.Ed25519, privateKey })

  const verificationMethod = getEd25519VerificationKey2018({ id: `${did}#${key.fingerprint}`, key, controller: did })

  const didDocument = new DidDocument({
    id: did,
    context: ['https://w3id.org/did/v1', 'https://w3id.org/security/suites/ed25519-2018/v1'],
    verificationMethod: [verificationMethod],
    keyAgreement: [verificationMethod.id],
    service: [
      new DidCommV1Service({
        id: `did:web:${domain}#animo-mediator`,
        serviceEndpoint: httpEndpoint,
        recipientKeys: [verificationMethod.id],
      }),
    ],
  })

  await agent.dids.import({
    did,
    didDocument,
    overwrite: true,
    privateKeys: [{ keyType: KeyType.Ed25519, privateKey }],
  })

  return { did, didDocument }
}

export async function createAgent() {
  // We create our own instance of express here. This is not required
  // but allows use to use the same server (and port) for both WebSockets and HTTP
  const app = express()
  const socketServer = new Server({ noServer: true })

  const logger = new Logger(LOG_LEVEL)

  // Only load postgres database in production
  const storageConfig = POSTGRES_HOST ? askarPostgresConfig : undefined

  const walletConfig: WalletConfig = {
    id: WALLET_NAME,
    key: WALLET_KEY,
    storage: storageConfig,
    keyDerivationMethod: KeyDerivationMethod.Raw,
  }

  if (storageConfig) {
    logger.info('Using postgres storage', {
      walletId: walletConfig.id,
      host: storageConfig.config.host,
    })
  } else {
    logger.info('Using SQlite storage', {
      walletId: walletConfig.id,
    })
  }

  const agent = new Agent({
    config: {
      label: AGENT_NAME,
      endpoints: AGENT_ENDPOINTS,
      walletConfig: walletConfig,
      useDidSovPrefixWhereAllowed: true,
      logger: logger,
      // FIXME: We should probably remove this at some point, but it will require custom logic
      // Also, doesn't work with multi-tenancy yet
      autoUpdateStorageOnStartup: true,
      didCommMimeType: DidCommMimeType.V0,
    },
    dependencies: agentDependencies,
    modules: {
      ...createModules(),
    },
  })

  // Create all transports
  const httpInboundTransport = new HttpInboundTransport({ app, port: AGENT_PORT })
  const httpOutboundTransport = new HttpOutboundTransport()
  const wsInboundTransport = new WsInboundTransport({ server: socketServer })
  const wsOutboundTransport = new WsOutboundTransport()

  // Register all Transports
  agent.registerInboundTransport(httpInboundTransport)
  agent.registerOutboundTransport(httpOutboundTransport)
  agent.registerInboundTransport(wsInboundTransport)
  agent.registerOutboundTransport(wsOutboundTransport)

  await agent.initialize()

  agent.events.on<ConnectionStateChangedEvent>(ConnectionEventTypes.ConnectionStateChanged, async (event) => {
    const { connectionRecord } = event.payload
    if (connectionRecord.state !== DidExchangeState.RequestReceived) return

    agent.config.logger.info(
      `Accepting connection request for connection '${connectionRecord.id}' for '${connectionRecord.theirLabel}'`
    )
    await agent.connections.acceptRequest(connectionRecord.id)
  })

  const { didDocument } = await createAndImportDid(agent)

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  httpInboundTransport.app.get('/invite', async (req, res) => {
    if (!req.query._oobid || typeof req.query._oobid !== 'string') {
      return res.status(400).send('Missing or invalid _oobid')
    }

    const outOfBandRecord = await agent.oob.findById(req.query._oobid)

    if (
      !outOfBandRecord ||
      outOfBandRecord.role !== OutOfBandRole.Sender ||
      outOfBandRecord.state !== OutOfBandState.AwaitResponse
    ) {
      return res.status(400).send(`No invitation found for _oobid ${req.query._oobid}`)
    }
    return res.send(outOfBandRecord.outOfBandInvitation.toJSON())
  })

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  httpInboundTransport.app.get('/.well-known/did.json', async (_req, res) => {
    return res.send(didDocument)
  })

  // When an 'upgrade' to WS is made on our http server, we forward the
  // request to the WS server
  httpInboundTransport.server?.on('upgrade', (request, socket, head) => {
    socketServer.handleUpgrade(request, socket as Socket, head, (socket) => {
      socketServer.emit('connection', socket, request)
    })
  })

  return agent
}

export type MediatorAgent = Awaited<ReturnType<typeof createAgent>>
