import Account from '#models/account'
import Transaction from '#models/transaction'
import { createTransactionValidator } from '#validators/transaction'
import AuditLogService from '#services/audit_log_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class TransactionsController {
  async store({ params, request, response, session, auth }: HttpContext) {
    const account = await Account.findOrFail(params.accountId)
    const payload = await request.validateUsing(createTransactionValidator)

    const amount = payload.type === 'in' ? payload.amount : -payload.amount
    account.balance += amount

    const transaction = await Transaction.create({
      accountId: account.id,
      type: payload.type,
      amount: payload.amount,
      description: payload.description,
      userId: auth.user!.id,
    })

    await account.save()

    await AuditLogService.log({
      userId: auth.user?.id ?? null,
      action: 'create',
      entityType: 'transaction',
      entityId: transaction.id,
      after: {
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        accountId: account.id,
      },
      ipAddress: request.ip(),
      userAgent: request.header('user-agent'),
    })

    session.flash(
      'success',
      `Transacción registrada (${payload.type === 'in' ? '+' : '-'}$${payload.amount})`
    )
    response.redirect().toRoute('accounts.show', { id: account.id })
  }

  async destroy({ params, response, session, auth, request }: HttpContext) {
    const transaction = await Transaction.findOrFail(params.id)
    const account = await Account.findOrFail(transaction.accountId)
    const snapshot = {
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      accountId: transaction.accountId,
    }

    const reversal = transaction.type === 'in' ? -transaction.amount : transaction.amount
    account.balance += reversal

    await transaction.delete()
    await account.save()

    await AuditLogService.log({
      userId: auth.user?.id ?? null,
      action: 'delete',
      entityType: 'transaction',
      entityId: transaction.id,
      before: snapshot,
      ipAddress: request.ip(),
      userAgent: request.header('user-agent'),
    })

    session.flash('success', 'Transacción eliminada y saldo revertido')
    response.redirect().toRoute('accounts.show', { id: account.id })
  }
}
