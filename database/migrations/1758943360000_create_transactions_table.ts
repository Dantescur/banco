import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('account_id').unsigned().references('id').inTable('accounts').onDelete('CASCADE')
      table.enu('type', ['in', 'out']).notNullable()
      table.decimal('amount', 12, 2).notNullable()
      table.string('description').nullable()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')

      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
