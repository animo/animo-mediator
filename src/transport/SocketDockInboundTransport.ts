import { Express } from 'express'
import { SocketIdsManager } from './SocketIdManager'
import { processInboundMessage } from './ProcessInboundMessage'
import { Logger } from '../logger'
import { Agent } from '@credo-ts/core'

export function registerSocketDockRoutes(
  app: Express,
  logger: Logger,
  socketIdManager: SocketIdsManager,
  agent: Agent
) {
  app.post('/connect', async (req, res) => {
    logger.info('httpInboundTransport.connect')
    const sendUrl = req.body.meta.send
    const connectionId = req.body.meta.connection_id

    const socketId = socketIdManager.getConnectionBySocketId(connectionId)
    if (!socketId) {
      socketIdManager.addSocketId(connectionId)
      logger.debug(`Saving new socketId : ${connectionId}`)
    }

    if (!sendUrl) {
      logger.error('Missing "send" URL in request body')
      return res.status(400).send('Missing "send" URL')
    }

    try {
      res.status(200).send(`connection with socketId : ${connectionId} added successfully`)
    } catch (error) {
      res.status(500).send('Error sending response to send URL')
    }
  })

  app.post('/message', async (req, res) => {
    logger.info('httpInboundTransport.message')

    const connectionId = req.body.meta.connection_id

    try {
      const socketId = socketIdManager.getConnectionBySocketId(connectionId)
      await processInboundMessage(req, res, agent, socketId)
    } catch (error) {
      res.status(500).send('Error sending response to send URL')
    }
  })

  app.post('/disconnect', async (req, res) => {
    logger.info('httpInboundTransport.disconnect')
    const { connection_id } = req.body
    socketIdManager.removeSocketId(connection_id)
    logger.debug(`removed connection with socketId : ${connection_id}`)
    res.status(200).send(`connection with socketId : ${connection_id} removed successfully`)
  })
}
