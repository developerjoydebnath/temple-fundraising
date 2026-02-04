import dbConnect from '@/lib/mongodb';
import Donation from '@/models/Donation';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();

    const donations = await Donation.find()
      .populate('donorId', 'name')
      .sort({ date: -1 })
      .limit(10);

    const maskedDonations = donations.map((donation: any) => {
      const donorName = donation.donorId?.name || 'Anonymous';
      let maskedName = donorName;
      
      if (donorName !== 'Anonymous' && donorName.length > 2) {
        maskedName = donorName.substring(0, 2) + '****' + donorName.slice(-1);
      } else if (donorName.length <= 2) {
        maskedName = donorName[0] + '****';
      }

      return {
        _id: donation._id,
        donorName: maskedName,
        amount: donation.amount,
        date: donation.date,
      };
    });

    return NextResponse.json(maskedDonations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
