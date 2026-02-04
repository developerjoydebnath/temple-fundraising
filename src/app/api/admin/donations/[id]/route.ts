import { getUserFromToken } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import dbConnect from '@/lib/mongodb';
import { ActivityAction } from '@/models/ActivityLog';
import Donation from '@/models/Donation';
import Donor from '@/models/Donor';
import { UserRole } from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const donation = await Donation.findById(id).populate('donorId paymentMethodId');
    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }
    return NextResponse.json(donation);
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
    const oldDonation = await Donation.findById(id);
    if (!oldDonation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    const { amount, donorId, date } = body;

    // If amount changed or donor changed, adjust donor stats
    if (oldDonation.amount !== amount || oldDonation.donorId.toString() !== donorId) {
      // Revert old donor
      await Donor.findByIdAndUpdate(oldDonation.donorId, {
        $inc: { totalDonation: -oldDonation.amount },
      });
      // Update new donor
      await Donor.findByIdAndUpdate(donorId, {
        $inc: { totalDonation: amount },
        $set: { lastDonationDate: date || new Date() },
      });
    }

    const updatedDonation = await Donation.findByIdAndUpdate(id, body, {
      new: true,
    });

    await logActivity(ActivityAction.UPDATE, 'Donation', `Updated donation ${id}`);

    return NextResponse.json(updatedDonation);
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
    const donation = await Donation.findById(id);
    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    // Revert donor stats
    await Donor.findByIdAndUpdate(donation.donorId, {
      $inc: { totalDonation: -donation.amount },
    });

    // RBAC: Only Super Admin and Admin can delete
    const user = await getUserFromToken();
    if (user?.role !== UserRole.SUPER_ADMIN && user?.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Permission denied. Only Admins can delete donations.' }, { status: 403 });
    }

    await Donation.findByIdAndDelete(id);

    await logActivity(ActivityAction.DELETE, 'Donation', `Deleted donation ${id}`);

    return NextResponse.json({ message: 'Donation deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
