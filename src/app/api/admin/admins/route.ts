import { getUserFromToken } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import dbConnect from '@/lib/mongodb';
import { ActivityAction } from '@/models/ActivityLog';
import User, { UserRole } from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const query: any = {
      role: { $ne: UserRole.SUPER_ADMIN }
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const admins = await User.find(query, '-password').sort({ createdAt: -1 });
    return NextResponse.json(admins);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const currentUser = await getUserFromToken();
    if (currentUser?.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Only Super Admin can add admins' }, { status: 403 });
    }

    const { name, email, password, role } = await request.json();
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const adminObj = admin.toObject();
    delete adminObj.password;
    const adminWithoutPassword = adminObj;
    
    await logActivity(ActivityAction.CREATE, 'Admin', `Created staff account for ${name} with role ${role}`);

    return NextResponse.json(adminWithoutPassword, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Admin with this email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
