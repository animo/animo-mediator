import { PushNotificationsFcmRecord } from '../push-notifications/fcm/repository'
import { Logger } from '../logger'

export const sendNotificationEvent = async (pushNotificationFcmRecord: PushNotificationsFcmRecord, logger: Logger, admin: any) => {
  console.log(`AL: Send Notification Event`)
  try {
    // if (!pushNotificationFcmRecord?.deviceToken) {
    //   logger.info(`No device token found for connectionId ${pushNotificationFcmRecord.connectionId}`)
    //   return
    // }
    const response = await admin.messaging().send({
      token: 'eBxX_Q0yTg6pO20fB2-4XG:APA91bGk2CLw5QNH09Sif5Jbk9ylXmx2pHxg_KbzpGTsgUzq6WQBMyIoCCEeFoB7Z15-IbX7UUz_70o08sKNUwidmBw1Ebg6oCQZW_1JvDnRLCWEXsxgMfc',
      notification: {
        title: "from PNE file",
        body: "from PNE file body"
      }
    })
    logger.info(`PN: Response: ${response}`)
    logger.info(`________________`)
    logger.info(`________________`)
    logger.info(`________________`)
    // logger.info(`Notification sent successfully to ${pushNotificationFcmRecord.connectionId}`)
    // 
    return null
  } catch (error) {
    logger.error(`Error sending notification`, {
      cause: error,
    })
  }
}