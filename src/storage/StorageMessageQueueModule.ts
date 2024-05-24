import { InjectionSymbols, type DependencyManager, type Module } from '@credo-ts/core'

import { StorageServiceMessageQueue } from './StorageMessageQueue'

export class StorageMessageQueueModule implements Module {
  public register(dependencyManager: DependencyManager) {
    dependencyManager.registerSingleton(InjectionSymbols.MessagePickupRepository, StorageServiceMessageQueue)
  }
}
