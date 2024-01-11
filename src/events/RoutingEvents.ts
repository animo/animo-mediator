import type { ForwardMessageEvent } from '@aries-framework/core'

import { RoutingEventTypes } from '@aries-framework/core'
import { MediatorAgent } from '../agent'

export const routingEvents = async (agent: MediatorAgent) => {
  agent.events.on(RoutingEventTypes.ForwardMessageEvent, async (event: ForwardMessageEvent) => {
    try {
      const connectionRecord = event.payload?.connectionRecord;
      const messageType = event.payload?.messageType;
      await agent.modules.pushNotificationsFcm.sendNotification(connectionRecord.id, messageType);

    } catch (error) {
      agent.config.logger.error(`Error sending notification`, {
        cause: error,
      })
    }
  })
}
