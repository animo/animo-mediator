import type { FcmDeviceInfo } from '../models/FcmDeviceInfo'
import type { AgentContext, InboundMessageContext } from '@aries-framework/core'

import { AriesFrameworkError } from '@aries-framework/core'
import { Lifecycle, scoped } from 'tsyringe'

import { PushNotificationsFcmProblemReportError, PushNotificationsFcmProblemReportReason } from '../errors'
import { PushNotificationsFcmSetDeviceInfoMessage, PushNotificationsFcmDeviceInfoMessage } from '../messages'
import { PushNotificationsFcmRecord, PushNotificationsFcmRepository } from '../repository'

@scoped(Lifecycle.ContainerScoped)
export class PushNotificationsFcmService {
  private pushNotificationsFcmRepository: PushNotificationsFcmRepository

  public constructor(pushNotificationsFcmRepository: PushNotificationsFcmRepository) {
    this.pushNotificationsFcmRepository = pushNotificationsFcmRepository
  }

  public async setDeviceInfo(agentContext: AgentContext, connectionId: string, deviceInfo: FcmDeviceInfo) {
    if (
      (deviceInfo.deviceToken === null && deviceInfo.devicePlatform !== null) ||
      (deviceInfo.deviceToken !== null && deviceInfo.devicePlatform === null)
    )
      throw new AriesFrameworkError('Both or none of deviceToken and devicePlatform must be null')

    const pushNotificationsFcmSetDeviceInfoRecord = new PushNotificationsFcmRecord({
      connectionId,
      deviceToken: deviceInfo.deviceToken,
      devicePlatform: deviceInfo.devicePlatform,
    })

    await this.pushNotificationsFcmRepository.save(agentContext, pushNotificationsFcmSetDeviceInfoRecord)

    return pushNotificationsFcmSetDeviceInfoRecord
  }

  public createDeviceInfo(options: { threadId: string; deviceInfo: FcmDeviceInfo }) {
    const { threadId, deviceInfo } = options
    if (
      (deviceInfo.deviceToken === null && deviceInfo.devicePlatform !== null) ||
      (deviceInfo.deviceToken !== null && deviceInfo.devicePlatform === null)
    )
      throw new AriesFrameworkError('Both or none of deviceToken and devicePlatform must be null')

    return new PushNotificationsFcmDeviceInfoMessage({
      threadId,
      deviceToken: deviceInfo.deviceToken,
      devicePlatform: deviceInfo.devicePlatform,
    })
  }

  public async processSetDeviceInfo(messageContext: InboundMessageContext<PushNotificationsFcmSetDeviceInfoMessage>) {
    const { message } = messageContext
    if (
      (message.deviceToken === null && message.devicePlatform !== null) ||
      (message.deviceToken !== null && message.devicePlatform === null)
    ) {
      throw new PushNotificationsFcmProblemReportError('Both or none of deviceToken and devicePlatform must be null', {
        problemCode: PushNotificationsFcmProblemReportReason.MissingValue,
      })
    }

    const connection = messageContext.assertReadyConnection()

    const pushNotificationsFcmRecord = new PushNotificationsFcmRecord({
      connectionId: connection.id,
      deviceToken: message.deviceToken,
      devicePlatform: message.devicePlatform,
    })

    await this.pushNotificationsFcmRepository.save(messageContext.agentContext, pushNotificationsFcmRecord)

    return pushNotificationsFcmRecord
  }

  public async getDeviceInfo(agentContext: AgentContext, connectionId: string) {
    const pushNotificationsFcmRecord = await this.pushNotificationsFcmRepository.getSingleByQuery(agentContext, {
      connectionId,
    })

    if (!pushNotificationsFcmRecord) {
      console.error(`No device info found for connection ${connectionId}`)
    }

    return pushNotificationsFcmRecord
  }
}
