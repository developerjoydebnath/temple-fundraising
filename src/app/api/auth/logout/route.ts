import { getUserFromToken, removeAuthCookie } from '@/lib/auth';
import ActivityLog, { ActivityAction } from '@/models/ActivityLog';
import { NextResponse } from 'next/server';

export async function POST() {
  const user = await getUserFromToken();
  if (user) {
    await ActivityLog.create({
      adminId: user.id,
      adminName: user.name,
      action: ActivityAction.LOGOUT,
      target: 'Auth',
      details: `Admin ${user.name} logged out`,
    });
  }
  await removeAuthCookie();
  return NextResponse.json({ message: 'Logged out successfully' });
}
