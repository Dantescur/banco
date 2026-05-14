import { AccountSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Transaction from '#models/transaction'
import User from '#models/user'

export default class Account extends AccountSchema {
  @hasMany(() => Transaction)
  declare transactions: HasMany<typeof Transaction>

  @belongsTo(() => User)
  declare owner: BelongsTo<typeof User>

  get isPrivate(): boolean {
    return this.visibility === 'private'
  }

  get isShared(): boolean {
    return this.visibility === 'shared'
  }
}
