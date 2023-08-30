import { OutOfBandRepository, OutOfBandRole, OutOfBandState } from '@aries-framework/core'

import { createAgent } from './agent'
import { INVITATION_URL } from './constants'

void createAgent().then(async (agent) => {
  agent.config.logger.info('Agent started')

  // Try to find existing out of band record
  const oobRepo = agent.dependencyManager.resolve(OutOfBandRepository)
  const outOfBandRecords = await oobRepo.findByQuery(agent.context, {
    state: OutOfBandState.AwaitResponse,
    role: OutOfBandRole.Sender,
  })

  let outOfBandRecord = outOfBandRecords.find((oobRecord) => oobRecord.reusable)

  // If it does't exist, we create a new one
  if (!outOfBandRecord) {
    outOfBandRecord = await agent.oob.createInvitation({
      multiUseInvitation: true,
    })
  }

  const httpEndpoint = agent.config.endpoints.find((e) => e.startsWith('http')) as string
  const invitationEndpoint = INVITATION_URL ?? `${httpEndpoint}/invite`
  const mediatorInvitationUrlLong = outOfBandRecord.outOfBandInvitation.toUrl({
    domain: invitationEndpoint,
  })

  agent.config.logger.info(`Out of band invitation url: \n\n\t${mediatorInvitationUrlLong}`)
  agent.config.logger.info(`Did Web Url '${httpEndpoint}/.well-known/did.json'`)
})
