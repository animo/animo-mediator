import type { ForwardMessageEvent } from '@aries-framework/core'

import { RoutingEventTypes } from '@aries-framework/core'
import { MediatorAgent } from '../agent'

export const routingEvents = async (agent: MediatorAgent) => {
  agent.events.on(RoutingEventTypes.ForwardMessageEvent, async (event: ForwardMessageEvent) => {
    try {
      const record = event.payload.connectionRecord

      await agent.modules.pushNotificationsFcm.sendNotification(record.id)
    } catch (error) {
      agent.config.logger.error(`Error sending notification`, {
        cause: error,
      })
    }
  })
}
