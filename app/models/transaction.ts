import { TransactionSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Account from '#models/account'
import User from '#models/user'

export default class Transaction extends TransactionSchema {
  @belongsTo(() => Account)
  declare account: BelongsTo<typeof Account>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
