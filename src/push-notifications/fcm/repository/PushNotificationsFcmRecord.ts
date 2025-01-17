import type { TagsBase } from '@credo-ts/core'

import { utils, BaseRecord } from '@credo-ts/core'

export type DefaultPushNotificationsFcmTags = {
  connectionId: string
}

export type CustomPushNotificationsFcmTags = TagsBase

export interface PushNotificationsFcmStorageProps {
  id?: string
  deviceToken: string | null
  devicePlatform: string | null
  clientCode: string | null
  connectionId: string
  tags?: CustomPushNotificationsFcmTags
}

export class PushNotificationsFcmRecord extends BaseRecord<
  DefaultPushNotificationsFcmTags,
  CustomPushNotificationsFcmTags
> {
  public deviceToken!: string | null
  public devicePlatform!: string | null
  public connectionId!: string
  public clientCode!: string | null

  public static readonly type = 'PushNotificationsFcmRecord'
  public readonly type = PushNotificationsFcmRecord.type

  public constructor(props: PushNotificationsFcmStorageProps) {
    super()

    if (props) {
      this.id = props.id ?? utils.uuid()
      this.devicePlatform = props.devicePlatform
      this.deviceToken = props.deviceToken
      this.connectionId = props.connectionId
      this._tags = props.tags ?? {}
      this.clientCode = props.clientCode
    }
  }

  public getTags() {
    return {
      ...this._tags,
      connectionId: this.connectionId,
    }
  }
}
