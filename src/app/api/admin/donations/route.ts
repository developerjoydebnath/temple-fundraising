import { getUserFromToken } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import dbConnect from '@/lib/mongodb';
import { ActivityAction } from '@/models/ActivityLog';
import Donation from '@/models/Donation';
import Donor from '@/models/Donor';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const donations = await Donation.find()
      .populate('donorId', 'name phone')
      .populate('paymentMethodId', 'name')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Donation.countDocuments();

    return NextResponse.json({
      donations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { donorId, amount, paymentMethodId, date, note, transactionId } = body;

    const donation = await Donation.create({
      donorId,
      amount,
      paymentMethodId,
      date,
      note,
      transactionId,
      addedBy: user.id,
    });

    // Update donor stats
    await Donor.findByIdAndUpdate(donorId, {
      $inc: { totalDonation: amount },
      $set: { lastDonationDate: date || new Date() },
    });

    await logActivity(ActivityAction.CREATE, 'Donation', `Added donation of ${amount} for ${donorId}`);

    return NextResponse.json(donation, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
