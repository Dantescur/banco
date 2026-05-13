import vine from '@vinejs/vine'

export const createAccountValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(255),
  currency: vine.enum(['USD', 'CUP']),
})

export const updateAccountValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(255),
})
