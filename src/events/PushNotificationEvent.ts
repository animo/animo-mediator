import { PushNotificationsFcmRecord } from '../push-notifications/fcm/repository'
import { Logger } from '../logger'

export const sendNotificationEvent = async (pushNotificationFcmRecord: PushNotificationsFcmRecord, logger: Logger, admin: any) => {
  try {
    if (!pushNotificationFcmRecord?.deviceToken) {
      logger.info(`No device token found for connectionId ${pushNotificationFcmRecord.connectionId}`)
      return
    }
    const response = await admin.messaging().send({
      token: pushNotificationFcmRecord.deviceToken,
      notification: {
        title: process.env.PUSH_NOTIFICATION_TITLE ?? 'title',
        body: process.env.PUSH_NOTIFICATION_BODY ?? 'body'
      }
    })

    return response
  } catch (error) {
    logger.error(`Error sending notification`, {
      cause: error,
    })
  }
}