import { EventEmitter, inject, injectable, InjectionSymbols, Repository, StorageService } from '@credo-ts/core'

import { PushNotificationsFcmRecord } from './PushNotificationsFcmRecord'

@injectable()
export class PushNotificationsFcmRepository extends Repository<PushNotificationsFcmRecord> {
  public constructor(
    @inject(InjectionSymbols.StorageService) storageService: StorageService<PushNotificationsFcmRecord>,
    eventEmitter: EventEmitter
  ) {
    super(PushNotificationsFcmRecord, storageService, eventEmitter)
  }
}
