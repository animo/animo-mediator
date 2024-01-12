import type { FcmDeviceInfo } from '../models/FcmDeviceInfo'
import type { AgentContext, InboundMessageContext, Logger } from '@aries-framework/core'

import {
  AriesFrameworkError,
  inject,
  InjectionSymbols,
  injectable,
  RecordDuplicateError,
  TransportService,
} from '@aries-framework/core'

import { PushNotificationsFcmProblemReportError, PushNotificationsFcmProblemReportReason } from '../errors'
import { PushNotificationsFcmSetDeviceInfoMessage, PushNotificationsFcmDeviceInfoMessage } from '../messages'
import { PushNotificationsFcmRecord, PushNotificationsFcmRepository } from '../repository'
import { NOTIFICATION_WEBHOOK_URL } from '../../../constants'
import fetch from 'node-fetch'

interface NotificationMessage {
  messageType: string;
  token: string;
  clientCode: string;
}

@injectable()
export class PushNotificationsFcmService {
  private pushNotificationsFcmRepository: PushNotificationsFcmRepository
  private logger: Logger
  private transportService: TransportService

  public constructor(
    pushNotificationsFcmRepository: PushNotificationsFcmRepository,
    transportService: TransportService,
    @inject(InjectionSymbols.Logger) logger: Logger
  ) {
    this.pushNotificationsFcmRepository = pushNotificationsFcmRepository
    this.logger = logger
    this.transportService = transportService
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
      clientCode: deviceInfo.clientCode
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
        clientCode: message.clientCode
      })

      await this.pushNotificationsFcmRepository.save(agentContext, pushNotificationsFcmRecord)
    }
  }

  public async sendNotification(agentContext: AgentContext, connectionId: string, messageType: string) {
    try {
      // Get the session for the connection
      // const session = await this.transportService.findSessionByConnectionId(connectionId)

      // if (session) {
      //   this.logger.info(`Connection ${connectionId} is active. So skip sending notification`)
      //   return
      // }

      // Get the device token for the connection
      const pushNotificationFcmRecord = await this.pushNotificationsFcmRepository.findSingleByQuery(agentContext, {
        connectionId,
      })

      if (!pushNotificationFcmRecord?.deviceToken) {
        this.logger.info(`No device token found for connectionId so skip sending notification`)
        return
      }


      // Prepare a message to be sent to the device
      const message: NotificationMessage = {
        messageType,
        token: pushNotificationFcmRecord?.deviceToken || '',
        clientCode: pushNotificationFcmRecord?.clientCode || ''
      }

      this.logger.info(`Sending notification to ${pushNotificationFcmRecord?.connectionId}`)
      await this.processNotification(message);
      // await admin.messaging().send(message)
      this.logger.info(`Notification sent successfully to ${connectionId}`)
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

  public async processNotification(message: NotificationMessage) {
    try {
      const body = {
        fcmToken: message.token || 'abc',
        messageType: message.messageType,
        clientCode: message.clientCode || '5b4d6bc6-362e-4f53-bdad-ee2742bc0de3'
      }
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      };

      await fetch(NOTIFICATION_WEBHOOK_URL, requestOptions)

    } catch (error) {
      this.logger.error(`Error sending notification`, {
        cause: error,
      })
    }
  }
}


