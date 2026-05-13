import crypto from 'node:crypto'
import InviteCode from '#models/invite_code'
import type { HttpContext } from '@adonisjs/core/http'

export default class SettingsController {
  async index({ view }: HttpContext) {
    const inviteCodes = await InviteCode.query().orderBy('createdAt', 'desc')
    return view.render('pages/settings', { inviteCodes })
  }

  async generateInviteCode({ response, session }: HttpContext) {
    let code = ''
    let exists = true

    while (exists) {
      code = crypto.randomBytes(5).toString('hex').toUpperCase()
      const existing = await InviteCode.findBy('code', code)
      exists = !!existing
    }

    await InviteCode.create({ code })

    session.flash('success', 'Código de invitación generado: ' + code)
    response.redirect().back()
  }
}
