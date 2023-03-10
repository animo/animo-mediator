import type { DependencyManager, Module } from "@aries-framework/core";

import { MessageRepository } from "./MessageRepository";
import { StorageServiceMessageQueueApi } from "./StorageMessageQueueApi";

export class StorageMessageQueueModule implements Module {
  public readonly api = StorageServiceMessageQueueApi;

  public register(dependencyManager: DependencyManager) {
    dependencyManager.registerContextScoped(StorageServiceMessageQueueApi);
    dependencyManager.registerSingleton(MessageRepository);
  }
}
