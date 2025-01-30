import * as admin from 'firebase-admin'
import { PushNotificationsFcmRecord } from '../push-notifications/fcm/repository'
import { Logger } from '../logger'

export const sendNotificationEvent = async (pushNotificationFcmRecord: PushNotificationsFcmRecord, logger: Logger) => {
  try {
    if (!pushNotificationFcmRecord?.deviceToken) {
      logger.info(`No device token found for connectionId ${pushNotificationFcmRecord.connectionId}`)
      return
    }
    const message = {
      notification: {
        title: process.env.FIREBASE_NOTIFICATION_TITLE,
        body: process.env.FIREBASE_NOTIFICATION_BODY,
      },
      token: pushNotificationFcmRecord.deviceToken,
    }
    const response = await admin.messaging().send(message)
    logger.info(`Notification sent successfully to ${pushNotificationFcmRecord.connectionId}`)
    return response
  } catch (error) {
    logger.error(`Error sending notification`, {
      cause: error,
    })
  }
}