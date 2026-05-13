import { AccountSchema } from '#database/schema'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Transaction from '#models/transaction'

export default class Account extends AccountSchema {
  @hasMany(() => Transaction)
  declare transactions: HasMany<typeof Transaction>
}
