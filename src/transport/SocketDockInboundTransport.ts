import { Express } from 'express'
import { Logger } from '../logger'
import { Agent, InboundTransport } from '@credo-ts/core'
import { WebSocketTransportSession } from './SocketDockTransportSession'

export class SocketDockInboundTransport implements InboundTransport {
  private app: Express
  private logger: Logger
  private active_connections: Record<string, string> = {}

  constructor(app: Express, logger: Logger) {
    this.app = app
    this.logger = logger
  }

  public async start(agent: Agent<any>) {
    this.app.post('/connect', async (req, res) => {
      this.logger.info('SocketDockInboundTransport.connect')
      const sendUrl = req.body.meta.send
      const connectionId = req.body.meta.connection_id

      const socketId = this.active_connections[connectionId] as string
      if (!socketId) {
        this.active_connections[socketId] = socketId
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

      try {
        const socketId = this.active_connections[connectionId] as string
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

      delete this.active_connections[connection_id]
      this.logger.debug(`removed connection with socketId : ${connection_id}`)
      res.status(200).send(`connection with socketId : ${connection_id} removed successfully`)
    })
  }

  stop(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
