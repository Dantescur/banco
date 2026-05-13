import Account from '#models/account'
import Transaction from '#models/transaction'
import { createAccountValidator, updateAccountValidator } from '#validators/account'
import AuditLogService from '#services/audit_log_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class AccountsController {
  async index({ view }: HttpContext) {
    const accounts = await Account.query().orderBy('name')
    return view.render('pages/accounts/index', { accounts })
  }

  async create({ view }: HttpContext) {
    return view.render('pages/accounts/create')
  }

  async store({ request, response, session, auth }: HttpContext) {
    const payload = await request.validateUsing(createAccountValidator)
    const account = await Account.create({
      name: payload.name,
      currency: payload.currency,
      balance: 0,
    })

    await AuditLogService.log({
      userId: auth.user?.id ?? null,
      action: 'create',
      entityType: 'account',
      entityId: account.id,
      after: { name: account.name, currency: account.currency },
      ipAddress: request.ip(),
      userAgent: request.header('user-agent'),
    })

    session.flash('success', `Cuenta "${account.name}" creada`)
    response.redirect().toRoute('accounts.index')
  }

  async show({ params, request, view }: HttpContext) {
    const account = await Account.findOrFail(params.id)
    const page = request.input('page', 1)

    const transactions = await Transaction.query()
      .where('accountId', account.id)
      .orderBy('createdAt', 'desc')
      .preload('user')
      .paginate(page, 20)

    const rows = transactions.all()
    const map: Record<string, typeof rows> = {}
    for (const tx of rows) {
      const key = tx.createdAt.toISODate() || 'unknown'
      if (!map[key]) map[key] = []
      map[key].push(tx)
    }
    const groups = Object.entries(map).map(([date, txs]) => ({ date, txs }))

    return view.render('pages/accounts/show', { account, transactions, groups })
  }

  async edit({ params, view }: HttpContext) {
    const account = await Account.findOrFail(params.id)
    return view.render('pages/accounts/edit', { account })
  }

  async update({ params, request, response, session, auth }: HttpContext) {
    const account = await Account.findOrFail(params.id)
    const before = { name: account.name }
    const payload = await request.validateUsing(updateAccountValidator)

    account.name = payload.name
    await account.save()

    await AuditLogService.log({
      userId: auth.user?.id ?? null,
      action: 'update',
      entityType: 'account',
      entityId: account.id,
      before,
      after: { name: account.name },
      ipAddress: request.ip(),
      userAgent: request.header('user-agent'),
    })

    session.flash('success', `Cuenta renombrada a "${account.name}"`)
    response.redirect().toRoute('accounts.show', { id: account.id })
  }

  async destroy({ params, response, session, auth, request }: HttpContext) {
    const account = await Account.findOrFail(params.id)
    const snapshot = { name: account.name, currency: account.currency, balance: account.balance }

    await account.delete()

    await AuditLogService.log({
      userId: auth.user?.id ?? null,
      action: 'delete',
      entityType: 'account',
      entityId: account.id,
      before: snapshot,
      ipAddress: request.ip(),
      userAgent: request.header('user-agent'),
    })

    session.flash('success', `Cuenta "${snapshot.name}" eliminada`)
    response.redirect().toRoute('accounts.index')
  }
}
