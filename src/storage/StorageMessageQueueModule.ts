import type { DependencyManager, Module } from '@aries-framework/core'

import { MessageRepository } from './MessageRepository'
import { StorageServiceMessageQueue } from './StorageMessageQueue'

export class StorageMessageQueueModule implements Module {
  public register(dependencyManager: DependencyManager) {
    dependencyManager.registerContextScoped(StorageServiceMessageQueue)
    dependencyManager.registerSingleton(MessageRepository)
  }
}
