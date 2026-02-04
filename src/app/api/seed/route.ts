import dbConnect from '@/lib/mongodb';
import User, { UserRole } from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();

    const adminExists = await User.findOne({ role: UserRole.SUPER_ADMIN });
    if (adminExists) {
      return NextResponse.json({ message: 'Super Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@temple.com',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
    });

    return NextResponse.json({
      message: 'Super Admin created successfully',
      user: {
        email: superAdmin.email,
        password: 'admin123 (Please change this immediately)',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
