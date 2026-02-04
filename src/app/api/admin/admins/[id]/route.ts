import { getUserFromToken } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import dbConnect from '@/lib/mongodb';
import { ActivityAction } from '@/models/ActivityLog';
import User, { UserRole } from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const admin = await User.findById(id).select('-password');
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }
    return NextResponse.json(admin);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const currentUser = await getUserFromToken();
    if (currentUser?.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Only Super Admin can edit admins' }, { status: 403 });
    }

    const { name, email, password, role } = await request.json();
    const updateData: any = { name, email, role };
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const admin = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select('-password');

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    await logActivity(ActivityAction.UPDATE, 'Admin', `Updated staff account ${admin.name}`);

    return NextResponse.json(admin);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const currentUser = await getUserFromToken();
    if (currentUser?.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Only Super Admin can delete admins' }, { status: 403 });
    }

    const targetAdmin = await User.findById(id);
    if (targetAdmin?.role === UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Super Admin account cannot be deleted' }, { status: 403 });
    }

    const admin = await User.findByIdAndDelete(id);
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    await logActivity(ActivityAction.DELETE, 'Admin', `Deleted staff account ${admin.name}`);

    return NextResponse.json({ message: 'Admin deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
