import { MediatorAgent } from '../agent'
import { AgentEventTypes } from '@credo-ts/core'
import { sendNotificationEvent } from './PushNotificationEvent'

// Adds event listener for message received events...
export const routingEvents = async (agent: MediatorAgent, admin: any) => {
    agent.events.on(AgentEventTypes.AgentMessageReceived, async (event: any) => {

        agent.config.logger.info(`AL: IS MY ENV BEING USED: ${process.env.FIREBASE_PROJECT_ID}`)
        // ok so in here I need to be able to detect a proof request event
        // then for the connection, find the device
        // find the token, then fire that off to firebase
        // sounds simple enough...


        // is my device being stored properly?
        // is 
        agent.config.logger.info('AL: Message Received event!!')
        const record: any = event.payload.connectionRecord
        agent.config.logger.info(`AL: ${event.type}`)
        agent.config.logger.info(`AL: ${JSON.stringify(event.metadata)}`)
        agent.config.logger.info(`AL: ___________________________`)
        // agent.config.logger.info(`AL: ${JSON.stringify(event.payload["message"] as any)}`) encrypted garbage I think...
        // agent.config.logger.info(`AL: ${(event.payload["session"] as any)["type"]}`) http
        agent.config.logger.info(`AL: ${(event.payload["session"] as any)["id"]}`)
        // agent.config.logger.info(`AL: ${(event.payload["session"] as any)["res"]}`)
        // agent.config.logger.info(`AL: ${(event.payload["session"] as any)["req"]}`)
        // agent.config.logger.info(`AL: ${Object.keys((event.payload["session"] as any)["req"] as any)}`)
        // agent.config.logger.info(`AL: ${((event.payload["session"] as any)["req"] as any)["body"] as any}`)
        // agent.config.logger.info(`AL: ${Object.keys(((event.payload["session"] as any)["req"] as any)["params"] as any)}`)


        agent.config.logger.info(`AL: ___________________________`)
        agent.config.logger.info(`AL: ___________________________`)
        agent.config.logger.info(`AL: ___________________________`)

        const devices = await agent.modules.pushNotificationsFcm.getAllDeviceInfo()
        agent.config.logger.info(`AL: Number of devices found: ${devices.length}`)
        // Get device info from PushNotificationsFcmRecord
        // const fcmDeviceInfoRecord = await agent.modules.pushNotificationsFcm.getDeviceInfoByConnectionId((event.payload["session"] as any)["id"] as string)

        // Send notification to device
        await sendNotificationEvent({} as any, agent.config.logger as any, admin)
    })
}