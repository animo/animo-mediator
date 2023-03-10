import {
  InitConfig,
  OutOfBandRole,
  OutOfBandState,
} from "@aries-framework/core";
import type { Socket } from "net";
import {
  HttpOutboundTransport,
  Agent,
  WsOutboundTransport,
} from "@aries-framework/core";

import {
  HttpInboundTransport,
  agentDependencies,
  WsInboundTransport,
  IndySdkPostgresWalletScheme,
  loadIndySdkPostgresPlugin,
} from "@aries-framework/node";

import indySdk, { setDefaultLogger } from "indy-sdk";

import express from "express";
import { writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { Server } from "ws";

import {
  AGENT_ENDPOINTS,
  AGENT_NAME,
  AGENT_PORT,
  DEBUG_INDY,
  IS_DEV,
  LOG_LEVEL,
  POSTGRES_ADMIN_PASSWORD,
  POSTGRES_ADMIN_USER,
  POSTGRES_DATABASE_URL,
  POSTGRES_PASSWORD,
  POSTGRES_TLS_CA,
  POSTGRES_TLS_CA_FILE,
  POSTGRES_USER,
  WALLET_KEY,
  WALLET_NAME,
} from "./constants";
import { Logger } from "./logger";
import { StorageMessageQueueModule } from "./storage/StorageMessageQueueModule";
import { IndySdkModule } from "@aries-framework/indy-sdk";

if (DEBUG_INDY) {
  setDefaultLogger("trace");
}

export async function createAgent() {
  // We create our own instance of express here. This is not required
  // but allows use to use the same server (and port) for both WebSockets and HTTP
  const app = express();
  const socketServer = new Server({ noServer: true });

  const logger = new Logger(LOG_LEVEL);

  // Only load postgres database in production
  const storageConfig = IS_DEV ? undefined : loadPostgres();

  if (storageConfig) {
    logger.info("Using postgres storage");
  }

  const agentConfig: InitConfig = {
    endpoints: AGENT_ENDPOINTS,
    label: AGENT_NAME,
    walletConfig: {
      id: WALLET_NAME,
      key: WALLET_KEY,
      storage: storageConfig,
    },
    autoAcceptConnections: true,
    autoAcceptMediationRequests: true,
    logger,
  };

  // Set up agent
  const agent = new Agent({
    config: agentConfig,
    dependencies: agentDependencies,
    modules: {
      StorageModule: new StorageMessageQueueModule(),
      indySdk: new IndySdkModule({
        indySdk,
      }),
    },
  });

  // Create all transports
  const httpInboundTransport = new HttpInboundTransport({
    app,
    port: AGENT_PORT,
  });
  const httpOutboundTransport = new HttpOutboundTransport();
  const wsInboundTransport = new WsInboundTransport({ server: socketServer });
  const wsOutboundTransport = new WsOutboundTransport();

  // Register all Transports
  agent.registerInboundTransport(httpInboundTransport);
  agent.registerOutboundTransport(httpOutboundTransport);
  agent.registerInboundTransport(wsInboundTransport);
  agent.registerOutboundTransport(wsOutboundTransport);

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  httpInboundTransport.app.get("/invite", async (req, res) => {
    if (!req.query._oobid || typeof req.query._oobid !== "string") {
      return res.status(400).send("Missing or invalid _oobid");
    }

    const outOfBandRecord = await agent.oob.findById(req.query._oobid);

    if (
      !outOfBandRecord ||
      outOfBandRecord.role !== OutOfBandRole.Sender ||
      outOfBandRecord.state !== OutOfBandState.AwaitResponse
    ) {
      return res
        .status(400)
        .send(`No invitation found for _oobid ${req.query._oobid}`);
    }
    return res.send(outOfBandRecord.outOfBandInvitation.toJSON());
  });

  await agent.initialize();

  // When an 'upgrade' to WS is made on our http server, we forward the
  // request to the WS server
  httpInboundTransport.server?.on("upgrade", (request, socket, head) => {
    socketServer.handleUpgrade(request, socket as Socket, head, (socket) => {
      socketServer.emit("connection", socket, request);
    });
  });

  return agent;
}

function loadPostgres() {
  if (
    !POSTGRES_DATABASE_URL ||
    !POSTGRES_USER ||
    !POSTGRES_PASSWORD ||
    !POSTGRES_ADMIN_USER ||
    !POSTGRES_ADMIN_PASSWORD
  ) {
    throw new Error("Missing required postgres environment variables");
  }

  let postgresTlsFile = POSTGRES_TLS_CA_FILE;
  if (!postgresTlsFile && POSTGRES_TLS_CA) {
    postgresTlsFile = path.join(tmpdir(), "postgres-tls.crt");
    writeFileSync(postgresTlsFile, POSTGRES_TLS_CA);
  }

  if (!postgresTlsFile) {
    throw new Error(
      "Missing required POSTGRES_TLS_CA_FILE or POSTGRES_TLS_CA environment variable"
    );
  }

  const storageConfig = {
    type: "postgres_storage",
    config: {
      url: POSTGRES_DATABASE_URL,
      wallet_scheme: IndySdkPostgresWalletScheme.DatabasePerWallet,
      tls_ca: postgresTlsFile,
      tls: "Require",
    },
    credentials: {
      account: POSTGRES_USER,
      password: POSTGRES_PASSWORD,
      admin_account: POSTGRES_ADMIN_USER,
      admin_password: POSTGRES_ADMIN_PASSWORD,
    },
  };

  loadIndySdkPostgresPlugin(storageConfig.config, storageConfig.credentials);

  return storageConfig;
}
