import { DateTime } from 'luxon'
import InviteCode from '#models/invite_code'
import User from '#models/user'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * NewAccountController handles user registration.
 * It provides methods for displaying the signup page and creating
 * new user accounts.
 */
export default class NewAccountController {
  /**
   * Display the signup page
   */
  async create({ view }: HttpContext) {
    return view.render('pages/auth/signup')
  }

  /**
   * Create a new user account and authenticate the user
   */
  async store({ request, response, auth, session }: HttpContext) {
    const payload = await request.validateUsing(signupValidator)

    const inviteCode = await InviteCode.query()
      .where('code', payload.inviteCode)
      .where('used', false)
      .first()

    if (!inviteCode) {
      session.flash('errorsBag', { inviteCode: 'Código de invitación inválido o ya usado' })
      response.redirect().back()
      return
    }

    const user = await User.create({
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
    })

    inviteCode.used = true
    inviteCode.usedBy = user.id
    inviteCode.usedAt = DateTime.local()
    await inviteCode.save()

    await auth.use('web').login(user)
    response.redirect().toRoute('home')
  }
}
