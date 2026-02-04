import ActivityLog, { ActivityAction } from '@/models/ActivityLog';
import { getUserFromToken } from './auth';

export async function logActivity(
  action: ActivityAction,
  target: string,
  details: string
) {
  try {
    const user = await getUserFromToken();
    if (!user) return;

    await ActivityLog.create({
      adminId: user.id,
      adminName: user.name,
      action,
      target,
      details,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
