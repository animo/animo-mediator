import { PushNotificationsFcmRecord } from '../push-notifications/fcm/repository'
import { Logger } from '../logger'

export const sendNotificationEvent = async (pushNotificationFcmRecord: PushNotificationsFcmRecord, logger: Logger, admin: any) => {
  console.log(`PN: Send Notification Event`)
  try {
    if (!pushNotificationFcmRecord?.deviceToken) {
      logger.info(`No device token found for connectionId ${pushNotificationFcmRecord.connectionId}`)
      return
    }
    const response = await admin.messaging().send({
      token: pushNotificationFcmRecord.deviceToken,
      notification: {
        title: "from PNE file",
        body: "from PNE file body"
      }
    })

    return response
  } catch (error) {
    logger.error(`Error sending notification`, {
      cause: error,
    })
  }
}