import type { FcmDeviceInfo } from '../models/FcmDeviceInfo'
import type { AgentContext, InboundMessageContext } from '@aries-framework/core'

import { AriesFrameworkError } from '@aries-framework/core'
import { Lifecycle, scoped } from 'tsyringe'

import { PushNotificationsFcmProblemReportError, PushNotificationsFcmProblemReportReason } from '../errors'
import { PushNotificationsFcmSetDeviceInfoMessage, PushNotificationsFcmDeviceInfoMessage } from '../messages'
import { PushNotificationsFcmRecord, PushNotificationsFcmRepository } from '../repository'
import fetch from 'node-fetch'
import { BASE_URL, ENDPOINT_PREFIX, ENDPOINT_SUFFIX } from '../constants'
import { FIREBASE_NOTIFICATION_BODY, FIREBASE_NOTIFICATION_TITLE, FIREBASE_PROJECT_ID } from 'src/constants'

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

  public async sendNotification(agentContext: AgentContext, connectionId: string) {
    const record = await this.pushNotificationsFcmRepository.getById(agentContext, connectionId)

    if (!record.deviceToken) {
      return
    }

    const response = await this.sendFcmNotification(record.deviceToken)
    console.log('first response', response)
  }

  private async sendFcmNotification(deviceToken: string) {
    const headers = {
      Authorization: 'Bearer ',
      'Content-Type': 'application/json; UTF-8',
    }

    const PROJECT_ID = FIREBASE_PROJECT_ID
    const FCM_ENDPOINT = ENDPOINT_PREFIX + PROJECT_ID + ENDPOINT_SUFFIX
    const FCM_URL = BASE_URL + '/' + FCM_ENDPOINT

    const body = {
      message: {
        token: deviceToken,
        notification: {
          title: FIREBASE_NOTIFICATION_TITLE,
          body: FIREBASE_NOTIFICATION_BODY,
        },
      },
    }
    try {
      return fetch(FCM_URL, {
        method: 'POST',
        body: JSON.stringify(body),
        headers,
      })
    } catch (error) {
      throw error
    }
  }
}
