import type { MessageHandler, MessageHandlerInboundMessage } from '@credo-ts/core'

import { PushNotificationsFcmProblemReportMessage } from '../messages'
import { PushNotificationsFcmService } from '../services'

/**
 * Handler for incoming push notification problem report messages
 */
export class PushNotificationsFcmProblemReportHandler implements MessageHandler {
  private pushNotificationsFcmService: PushNotificationsFcmService
  public supportedMessages = [PushNotificationsFcmProblemReportMessage]

  public constructor(pushNotificationsFcmService: PushNotificationsFcmService) {
    this.pushNotificationsFcmService = pushNotificationsFcmService
  }

  /**
  /* We don't really need to do anything with this at the moment
  /* The result can be hooked into through the generic message processed event
   */
  public async handle(inboundMessage: MessageHandlerInboundMessage<PushNotificationsFcmProblemReportHandler>) {
    inboundMessage.assertReadyConnection()
  }
}
