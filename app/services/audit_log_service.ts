import AuditLog from '#models/audit_log'

export default class AuditLogService {
  static async log(params: {
    userId: number | null
    action: string
    entityType: string
    entityId?: number | null
    before?: Record<string, unknown> | null
    after?: Record<string, unknown> | null
    ipAddress?: string | null
    userAgent?: string | null
  }) {
    await AuditLog.create({
      userId: params.userId ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      before: params.before ?? null,
      after: params.after ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    })
  }
}
