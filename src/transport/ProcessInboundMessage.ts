import { Agent } from '@credo-ts/core'

import type { Request, Response } from 'express'
import { WebSocketTransportSession } from './SocketDockTransportSession'

export async function processInboundMessage(req: Request, res: Response, agent: Agent, socketId: string) {
  const sendUrl = req.body.meta.send
  const requestMimeType = req.headers['content-type']
  const session = new WebSocketTransportSession(socketId, res, sendUrl, requestMimeType)

  try {
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
}
