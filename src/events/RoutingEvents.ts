import type { Agent, ForwardMessageEvent } from '@aries-framework/core'

import { RoutingEventTypes } from '@aries-framework/core'
import { sendNotificationEvent } from './PushNotificationEvent'
import { MediatorAgent } from '../agent'

export const routingEvents = async (agent: MediatorAgent) => {
  agent.events.on(RoutingEventTypes.ForwardMessageEvent, async (event: ForwardMessageEvent) => {
    const record = event.payload.connectionRecord

    // Get device info from PushNotificationsFcmRecord
    const fcmDeviceInfoRecord = await agent.modules.pushNotificationsFcm.getDeviceInfoByConnectionId(record.id)

    // Send notification to device
    await sendNotificationEvent(fcmDeviceInfoRecord, agent.config.logger)
  })
}
