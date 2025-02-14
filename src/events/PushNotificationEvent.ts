import { Logger } from '../logger'
import { firebase } from '../push-notifications/fcm/firebase'
import { PushNotificationsFcmRecord } from '../push-notifications/fcm/repository'

export const sendFCMPushNotification = async (
  pushNotificationFcmRecord: PushNotificationsFcmRecord,
  logger: Logger
) => {
  try {
    if (!pushNotificationFcmRecord?.deviceToken) {
      logger.info(`No device token found for connectionId ${pushNotificationFcmRecord.connectionId}`)
      return
    }
    const response = await firebase.messaging().send({
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
