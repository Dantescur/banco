# koiledger — Domain Context

## Purpose

A shared multi-user ledger. Multiple people sign in and record income/expense entries against a set of global accounts. Every authenticated user sees and operates on the same data — there is no per-user data isolation.

## Glossary

### Account

A named bucket that holds a balance in a single currency. Examples: "Checking (USD)", "Savings (CUP)". Accounts are **global** — no single user owns them. Any authenticated user can create, rename, or close an account.

- `name` — human-readable label
- `currency` — denomination; one of `USD` or `CUP`
- `balance` — running total, updated automatically when transactions are added or removed

### Transaction

A single entry that moves money into or out of an account. Transactions are **immutable** once created — they cannot be edited, only deleted (which reverses the balance change).

- `type` — `in` (income, adds to balance) or `out` (expense, subtracts from balance)
- `amount` — positive number
- `description` — optional memo
- `user` — who recorded the entry (audit only, not ownership)

Transactions always belong to exactly one account. Deleting an account cascades to its transactions.

### User

A person who can authenticate and interact with the ledger. Users do not own data — they are authenticated participants with equal access to all accounts, transactions, and audit logs.

- `name` — display name
- `email` — login identifier
- `password` — authentication credential

### Audit Log

An immutable record of every action performed in the system. Each entry captures:

- who performed the action
- what action was taken
- which entity was affected
- before/after snapshots (as JSON)
- request metadata (IP, user-agent)

## Rules

1. **Balance integrity** — an account's balance is always the sum of its transactions. Balance is never set directly; it is derived.
2. **No data isolation** — every authenticated user sees every account and every transaction.
3. **Transactions are immutable** — once created, a transaction's type and amount cannot change. The only allowed mutation is deletion, which atomically reverses the balance impact.
4. **Delete reverses** — deleting a `type: in` transaction subtracts its amount from the balance; deleting a `type: out` transaction adds it back.
5. **Cascade** — deleting an account deletes all its transactions and audit log entries referencing it.

## Non-goals

- Per-user private accounts or wallets
- Roles or permissions (admin, viewer, etc.)
- Budgeting, forecasting, or categorization
- Bank reconciliation or import
- Multi-currency conversion or exchange rates
