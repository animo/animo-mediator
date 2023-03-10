import {
  AgentContext,
  EventEmitter,
  inject,
  injectable,
  InjectionSymbols,
  Repository,
  StorageService,
} from '@aries-framework/core'

import { MessageRecord } from './MessageRecord'

@injectable()
export class MessageRepository extends Repository<MessageRecord> {
  public constructor(
    @inject(InjectionSymbols.StorageService)
    storageService: StorageService<MessageRecord>,
    eventEmitter: EventEmitter
  ) {
    super(MessageRecord, storageService, eventEmitter)
  }

  public findByConnectionId(agentContext: AgentContext, connectionId: string) {
    return this.findByQuery(agentContext, { connectionId })
  }
}
