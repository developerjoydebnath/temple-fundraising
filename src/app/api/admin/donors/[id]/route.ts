import { getUserFromToken } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import dbConnect from '@/lib/mongodb';
import { ActivityAction } from '@/models/ActivityLog';
import Donor from '@/models/Donor';
import { UserRole } from '@/models/User';
import { isValidObjectId } from 'mongoose';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid Donor ID format' }, { status: 400 });
    }

    const donor = await Donor.findById(id);
    if (!donor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
    }
    return NextResponse.json(donor);
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
    const body = await request.json();
    const donor = await Donor.findByIdAndUpdate(id, body, {
      new: true,
    });
    if (!donor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
    }

    await logActivity(ActivityAction.UPDATE, 'Donor', `Updated donor ${donor.name}`);

    return NextResponse.json(donor);
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
    
    // RBAC: Only Super Admin and Admin can delete
    const user = await getUserFromToken();
    if (user?.role !== UserRole.SUPER_ADMIN && user?.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Permission denied. Only Admins can delete donors.' }, { status: 403 });
    }

    const donor = await Donor.findByIdAndDelete(id);
    if (!donor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
    }

    await logActivity(ActivityAction.DELETE, 'Donor', `Deleted donor ${donor.name}`);

    return NextResponse.json({ message: 'Donor deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
