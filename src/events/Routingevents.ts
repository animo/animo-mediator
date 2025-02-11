import admin from 'firebase-admin'
import type { ForwardMessageEvent } from '@credo-ts/core'
import { Logger } from 'src/logger'
import { MediatorAgent } from '../agent'
import { RoutingEventTypes } from '@credo-ts/core'
import { sendNotificationEvent } from './PushNotificationEvent'

// Adds event listener for message received events...
export const routingEvents = async (agent: MediatorAgent, admin: admin.app.App) => {

    agent.events.on(RoutingEventTypes.ForwardMessageEvent, async (event: ForwardMessageEvent) => {
        const connectionId = event.payload.connectionRecord.id

        // Get device info from PushNotificationsFcmRecord
        try {
            // Connection ID is available once the websocket connection is established
            const deviceRecord = await agent.modules.pushNotificationsFcm.getDeviceInfoByConnectionId(connectionId)
            // Send notification to device
            await sendNotificationEvent(deviceRecord, agent.config.logger as Logger, admin)
        } catch (e) {
            agent.config.logger.error('Error sending push notification')
        }
    })
}