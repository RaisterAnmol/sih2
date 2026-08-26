import { AuditLog } from '../models/AuditLog.js';
import { AuthUser } from '../middleware/auth.js';

export class AuditService {
  static async logAction(
    user: AuthUser | { email: string; name: string; role: string },
    action: string,
    resource: string,
    details: string,
    meta?: {
      resourceId?: string;
      ipAddress?: string;
      previousValue?: Record<string, any>;
      newValue?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      await AuditLog.create({
        userEmail: user.email,
        userName: user.name,
        userRole: user.role,
        action,
        resource,
        resourceId: meta?.resourceId,
        details,
        ipAddress: meta?.ipAddress,
        previousValue: meta?.previousValue,
        newValue: meta?.newValue,
      });
    } catch (err: any) {
      console.error('[AuditService] Failed to record audit log:', err.message);
    }
  }
}
