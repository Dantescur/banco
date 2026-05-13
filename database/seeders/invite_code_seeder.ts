import { BaseSeeder } from '@adonisjs/lucid/seeders'
import InviteCode from '#models/invite_code'

export default class extends BaseSeeder {
  async run() {
    await InviteCode.createMany([
      { code: 'KOIL2025' },
      { code: 'BIENVENIDO' },
      { code: 'LEDGER25' },
    ])
  }
}
