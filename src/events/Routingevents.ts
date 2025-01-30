import { sendNotificationEvent } from './PushNotificationEvent'
import { MediatorAgent } from '../agent'
import { AgentEventTypes } from '@credo-ts/core'
import { Logger } from 'src/logger'

// Adds event listener for message received events...
export const routingEvents = async (agent: MediatorAgent) => {
    agent.events.on(AgentEventTypes.AgentMessageReceived, async (event) => {
        const record: any = event.payload.connectionRecord

        // Get device info from PushNotificationsFcmRecord
        const fcmDeviceInfoRecord = await agent.modules.pushNotificationsFcm.getDeviceInfoByConnectionId(record.id)

        // Send notification to device
        await sendNotificationEvent(fcmDeviceInfoRecord, agent.config.logger as Logger)
    })
}