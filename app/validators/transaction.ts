import vine from '@vinejs/vine'

export const createTransactionValidator = vine.create({
  type: vine.enum(['in', 'out']),
  amount: vine.number().positive(),
  description: vine.string().trim().maxLength(255).nullable(),
})
