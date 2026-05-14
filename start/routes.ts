import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'
import Account from '#models/account'
import Transaction from '#models/transaction'

router
  .get('/', async ({ view, auth }) => {
    if (!auth.user) {
      return view.render('pages/home')
    }

    const accounts = await Account.query()
      .where((query) => {
        query.where('visibility', 'shared')
        query.orWhere('user_id', auth.user!.id)
      })
      .orderBy('name')

    const recentTransactions = await Transaction.query()
      .whereIn(
        'account_id',
        accounts.map((a) => a.id)
      )
      .preload('account')
      .preload('user')
      .orderBy('createdAt', 'desc')
      .limit(10)

    const usdAccounts = accounts.filter((a) => a.currency === 'USD')
    const cupAccounts = accounts.filter((a) => a.currency === 'CUP')
    const totalUsd = usdAccounts.reduce((sum, a) => sum + a.balance, 0)
    const totalCup = cupAccounts.reduce((sum, a) => sum + a.balance, 0)

    return view.render('pages/home', { accounts, recentTransactions, totalUsd, totalCup })
  })
  .as('home')

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy'])

    router.get('settings', [controllers.Settings, 'index']).as('settings.index')
    router
      .post('settings/generate-code', [controllers.Settings, 'generateInviteCode'])
      .as('settings.generate')
  })
  .use(middleware.auth())

router
  .group(() => {
    router.get('accounts', [controllers.Accounts, 'index']).as('accounts.index')
    router.get('accounts/create', [controllers.Accounts, 'create']).as('accounts.create')
    router.post('accounts', [controllers.Accounts, 'store']).as('accounts.store')
    router.get('accounts/:id', [controllers.Accounts, 'show']).as('accounts.show')
    router.get('accounts/:id/edit', [controllers.Accounts, 'edit']).as('accounts.edit')
    router.put('accounts/:id', [controllers.Accounts, 'update']).as('accounts.update')
    router.delete('accounts/:id', [controllers.Accounts, 'destroy']).as('accounts.destroy')

    router
      .post('accounts/:accountId/transactions', [controllers.Transactions, 'store'])
      .as('transactions.store')
    router
      .delete('transactions/:id', [controllers.Transactions, 'destroy'])
      .as('transactions.destroy')
  })
  .use(middleware.auth())
