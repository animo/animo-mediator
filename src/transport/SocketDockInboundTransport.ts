import { Express } from 'express'
import { Logger } from '../logger'
import { Agent, InboundTransport } from '@credo-ts/core'
import { WebSocketTransportSession } from './SocketDockTransportSession'

export class SocketDockInboundTransport implements InboundTransport {
  private app: Express
  private logger: Logger
  private activeConnections: Record<string, string> = {}

  constructor(app: Express, logger: Logger) {
    this.app = app
    this.logger = logger
  }

  public async start(agent: Agent<any>) {
    this.app.post('/connect', async (req, res) => {
      this.logger.info('SocketDockInboundTransport.connect')
      const connectionId = req.body.meta.connection_id
      if (!connectionId) {
        throw new Error('ConnectionId is not sent from socketDock server')
      }

      const socketId = this.activeConnections[connectionId] as string
      if (!socketId) {
        this.activeConnections[socketId] = socketId
        this.logger.debug(`Saving new socketId : ${connectionId}`)
      }

      try {
        res.status(200).send(`connection with socketId : ${connectionId} added successfully`)
      } catch (error) {
        res.status(500).send('Error sending response to send URL')
      }
    })

    this.app.post('/message', async (req, res) => {
      this.logger.info('SocketDockInboundTransport.message')

      const connectionId = req.body.meta.connection_id
      if (!connectionId) {
        throw new Error('ConnectionId is not sent from socketDock server')
      }

      try {
        const socketId = this.activeConnections[connectionId]
        const sendUrl = req.body.meta.send
        const requestMimeType = req.headers['content-type']
        const session = new WebSocketTransportSession(socketId, res, sendUrl, requestMimeType)
        const message = req.body.message
        const encryptedMessage = JSON.parse(message)
        await agent.receiveMessage(encryptedMessage, session)
        if (!res.headersSent) {
          res.status(200).end()
        }
      } catch (error) {
        if (!res.headersSent) {
          res.status(500).send('Error processing message')
        }
      }
    })

    this.app.post('/disconnect', async (req, res) => {
      this.logger.info('SocketDockInboundTransport.disconnect')
      const { connection_id } = req.body
      if (!connection_id) {
        throw new Error('ConnectionId is not sent from socketDock server')
      }

      delete this.activeConnections[connection_id]
      this.logger.debug(`removed connection with socketId : ${connection_id}`)
      res.status(200).send(`connection with socketId : ${connection_id} removed successfully`)
    })
  }

  stop(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
