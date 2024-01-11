import type { FcmDeviceInfo } from './models'

import {
  OutboundMessageContext,
  AgentContext,
  ConnectionService,
  injectable,
  MessageSender,
} from '@aries-framework/core'

import { PushNotificationsFcmService } from './services/PushNotificationsFcmService'
import {
  PushNotificationsFcmDeviceInfoHandler,
  PushNotificationsFcmProblemReportHandler,
  PushNotificationsFcmSetDeviceInfoHandler,
} from './handlers'

@injectable()
export class PushNotificationsFcmApi {
  private messageSender: MessageSender
  private pushNotificationsService: PushNotificationsFcmService
  private connectionService: ConnectionService
  private agentContext: AgentContext

  public constructor(
    messageSender: MessageSender,
    pushNotificationsService: PushNotificationsFcmService,
    connectionService: ConnectionService,
    agentContext: AgentContext
  ) {
    this.messageSender = messageSender
    this.pushNotificationsService = pushNotificationsService
    this.connectionService = connectionService
    this.agentContext = agentContext

    this.agentContext.dependencyManager.registerMessageHandlers([
      new PushNotificationsFcmSetDeviceInfoHandler(this.pushNotificationsService),
      new PushNotificationsFcmDeviceInfoHandler(),
      new PushNotificationsFcmProblemReportHandler(this.pushNotificationsService),
    ])
  }

  /**
   * Sends the requested fcm device info (token) to another agent via a `connectionId`
   * Response for `push-notifications-fcm/get-device-info`
   *
   * @param connectionId The connection ID string
   * @param threadId get-device-info message ID
   * @param deviceInfo The FCM device info
   * @returns Promise<void>
   */
  public async deviceInfo(options: { connectionId: string; threadId: string; deviceInfo: FcmDeviceInfo }) {
    const { connectionId, threadId, deviceInfo } = options
    const connection = await this.connectionService.getById(this.agentContext, connectionId)
    connection.assertReady()

    const message = this.pushNotificationsService.createDeviceInfo({ threadId, deviceInfo })

    const outbound = new OutboundMessageContext(message, {
      agentContext: this.agentContext,
      connection: connection,
    })
    await this.messageSender.sendMessage(outbound)
  }

  /**
   * Send push notification to device
   *
   * @param connectionId The connection ID string
   * @returns Promise<void>
   */
  public async sendNotification(connectionId: string, messageType: string) {
    return this.pushNotificationsService.sendNotification(this.agentContext, connectionId, messageType)
  }
}
