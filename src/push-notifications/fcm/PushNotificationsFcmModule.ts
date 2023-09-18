import type { DependencyManager, FeatureRegistry, Module } from '@aries-framework/core'

import { Protocol } from '@aries-framework/core'

import { PushNotificationsFcmApi } from './PushNotificationsFcmApi'
import { PushNotificationsFcmService } from './services/PushNotificationsFcmService'
import {
  PushNotificationsFcmDeviceInfoHandler,
  PushNotificationsFcmProblemReportHandler,
  PushNotificationsFcmSetDeviceInfoHandler,
} from './handlers'
import { PushNotificationsFcmRole } from './models'
import { PushNotificationsFcmRepository } from './repository'

/**
 * Module that exposes push notification get and set functionality
 */
export class PushNotificationsFcmModule implements Module {
  public readonly api = PushNotificationsFcmApi

  public register(dependencyManager: DependencyManager, featureRegistry: FeatureRegistry): void {
    // Api
    dependencyManager.registerContextScoped(PushNotificationsFcmApi)

    // Services
    dependencyManager.registerSingleton(PushNotificationsFcmService)

    // Repository
    dependencyManager.registerSingleton(PushNotificationsFcmRepository)

    featureRegistry.register(
      new Protocol({
        id: 'https://didcomm.org/push-notifications-fcm/1.0',
        roles: [PushNotificationsFcmRole.Sender, PushNotificationsFcmRole.Receiver],
      })
    )
  }
}
