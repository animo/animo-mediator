import type { FcmDeviceInfo } from '../models/FcmDeviceInfo'
import type { AgentContext, InboundMessageContext, Logger } from '@aries-framework/core'

import { AriesFrameworkError, inject, InjectionSymbols, injectable, RecordDuplicateError } from '@aries-framework/core'

import { PushNotificationsFcmProblemReportError, PushNotificationsFcmProblemReportReason } from '../errors'
import { PushNotificationsFcmSetDeviceInfoMessage, PushNotificationsFcmDeviceInfoMessage } from '../messages'
import { PushNotificationsFcmRecord, PushNotificationsFcmRepository } from '../repository'

import * as admin from 'firebase-admin'
import { FIREBASE_NOTIFICATION_BODY, FIREBASE_NOTIFICATION_TITLE } from '../../../constants'

@injectable()
export class PushNotificationsFcmService {
  private pushNotificationsFcmRepository: PushNotificationsFcmRepository
  private logger: Logger

  public constructor(
    pushNotificationsFcmRepository: PushNotificationsFcmRepository,
    @inject(InjectionSymbols.Logger) logger: Logger
  ) {
    this.pushNotificationsFcmRepository = pushNotificationsFcmRepository
    this.logger = logger
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
    const { message, agentContext } = messageContext
    if (
      (message.deviceToken === null && message.devicePlatform !== null) ||
      (message.deviceToken !== null && message.devicePlatform === null)
    ) {
      throw new PushNotificationsFcmProblemReportError('Both or none of deviceToken and devicePlatform must be null', {
        problemCode: PushNotificationsFcmProblemReportReason.MissingValue,
      })
    }

    const connection = messageContext.assertReadyConnection()

    let pushNotificationsFcmRecord = await this.pushNotificationsFcmRepository.findSingleByQuery(agentContext, {
      connectionId: connection.id,
    })

    if (pushNotificationsFcmRecord) {
      if (pushNotificationsFcmRecord.deviceToken === message.deviceToken) {
        this.logger.debug(`Device token is same for connection ${connection.id}. So skipping update`)
        return
      }

      // Update the record with new device token
      pushNotificationsFcmRecord.deviceToken = message.deviceToken

      this.logger.debug(`Device token changed for connection ${connection.id}. Updating record`)
      await this.pushNotificationsFcmRepository.update(agentContext, pushNotificationsFcmRecord)
    } else {
      this.logger.debug(`No device info found for connection ${connection.id}. So creating new record`)

      pushNotificationsFcmRecord = new PushNotificationsFcmRecord({
        connectionId: connection.id,
        deviceToken: message.deviceToken,
        devicePlatform: message.devicePlatform,
      })

      await this.pushNotificationsFcmRepository.save(agentContext, pushNotificationsFcmRecord)
    }
  }

  public async sendNotification(agentContext: AgentContext, connectionId: string) {
    try {
      // Get the device token for the connection
      const pushNotificationFcmRecord = await this.pushNotificationsFcmRepository.findSingleByQuery(agentContext, {
        connectionId,
      })

      if (!pushNotificationFcmRecord?.deviceToken) {
        this.logger.info(`No device token found for connectionId so skip sending notification`)
        return
      }

      // Prepare a message to be sent to the device
      const message = {
        notification: {
          title: FIREBASE_NOTIFICATION_TITLE,
          body: FIREBASE_NOTIFICATION_BODY,
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
        token: pushNotificationFcmRecord.deviceToken,
      }

      this.logger.info(`Sending notification to ${pushNotificationFcmRecord?.connectionId}`)
      await admin.messaging().send(message)
      this.logger.info(`Notification sent successfully to ${pushNotificationFcmRecord.connectionId}`)
    } catch (error) {
      if (error instanceof RecordDuplicateError) {
        this.logger.error(`Multiple device info found for connectionId ${connectionId}`)
      } else {
        this.logger.error(`Error sending notification`, {
          cause: error,
        })
      }
    }
  }
}
