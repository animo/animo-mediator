import type { ForwardMessageEvent } from '@aries-framework/core'

import { RecordDuplicateError, RoutingEventTypes } from '@aries-framework/core'
import { sendNotificationEvent } from './PushNotificationEvent'
import { MediatorAgent } from '../agent'

export const routingEvents = async (agent: MediatorAgent) => {
  agent.events.on(RoutingEventTypes.ForwardMessageEvent, async (event: ForwardMessageEvent) => {
    try {
      const record = event.payload.connectionRecord

      // Get device info from PushNotificationsFcmRecord
      const fcmDeviceInfoRecord = await agent.modules.pushNotificationsFcm.getDeviceInfoByConnectionId(record.id)

      if (fcmDeviceInfoRecord?.deviceToken) {
        agent.config.logger.info(`Sending notification to ${fcmDeviceInfoRecord.connectionId}`)
        // Send notification to device
        await sendNotificationEvent(fcmDeviceInfoRecord, agent.config.logger)
      } else {
        agent.config.logger.info(`No device token found for connectionId so skipping send notification event`)
      }
    } catch (error) {
      if (error instanceof RecordDuplicateError) {
        agent.config.logger.error(`Multiple device info found for connectionId ${event.payload.connectionRecord.id}`)
      } else {
        agent.config.logger.error(`Error sending notification`, {
          cause: error,
        })
      }
    }
  })
}
