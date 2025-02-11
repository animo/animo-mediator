import { app } from 'firebase-admin'
import { Logger } from '../logger'
import { PushNotificationsFcmRecord } from '../push-notifications/fcm/repository'

export const sendNotificationEvent = async (
  pushNotificationFcmRecord: PushNotificationsFcmRecord,
  logger: Logger,
  admin: app.App
) => {
  try {
    if (!pushNotificationFcmRecord?.deviceToken) {
      logger.info(`No device token found for connectionId ${pushNotificationFcmRecord.connectionId}`)
      return
    }
    const response = await admin.messaging().send({
      token: pushNotificationFcmRecord.deviceToken,
      notification: {
        title: process.env.PUSH_NOTIFICATION_TITLE ?? 'title',
        body: process.env.PUSH_NOTIFICATION_BODY ?? 'body',
      },
    })

    return response
  } catch (error) {
    logger.error('Error sending notification', {
      cause: error,
    })
  }
}
