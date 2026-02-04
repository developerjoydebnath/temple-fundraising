import { setAuthCookie, signToken } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import ActivityLog, { ActivityAction } from '@/models/ActivityLog';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    await setAuthCookie(token);

    // Log the login
    await ActivityLog.create({
      adminId: user._id,
      adminName: user.name,
      action: ActivityAction.LOGIN,
      target: 'Auth',
      details: `Admin ${user.name} logged in`,
    });

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
