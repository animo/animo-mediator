import { Logger } from '../../../logger'
import { firebase } from '../firebase'

export const sendFcmPushNotification = async (
  deviceToken: string,
  logger: Logger
) => {
  try {
    const response = await firebase.messaging().send({
      token: deviceToken,
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
