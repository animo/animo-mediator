import { Agent, AgentContext, DidCommMimeType, EncryptedMessage, TransportSession } from '@credo-ts/core'
import type { Response } from 'express'
import { CredoError } from '@credo-ts/core'

import { agentDependencies } from '@credo-ts/node'

const supportedContentTypes: string[] = [DidCommMimeType.V0, DidCommMimeType.V1]

export class WebSocketTransportSession implements TransportSession {
  public id: string
  public readonly type = 'socketdock'
  public res: Response
  public sendUrl: any
  public requestMimeType: any

  public constructor(id: string, res: Response, sendUrl: any, requestMimeType: any) {
    this.id = id
    this.res = res
    this.sendUrl = sendUrl
    this.requestMimeType = requestMimeType
  }

  public async close() {}

  public async send(agentContext: AgentContext, encryptedMessage: EncryptedMessage): Promise<void> {
    if (this.res.headersSent) {
      throw new CredoError(`${this.type} transport session has been closed.`)
    }

    // By default we take the agent config's default DIDComm content-type
    let responseMimeType = agentContext.config.didCommMimeType as string

    if (this.requestMimeType && supportedContentTypes.includes(this.requestMimeType)) {
      responseMimeType = this.requestMimeType
    }

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': responseMimeType,
      },
      body: JSON.stringify(encryptedMessage),
    }
    await agentDependencies.fetch(this.sendUrl, requestOptions)
  }
}
