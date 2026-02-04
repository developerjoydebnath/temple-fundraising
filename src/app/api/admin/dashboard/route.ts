import dbConnect from '@/lib/mongodb';
import Donation from '@/models/Donation';
import Donor from '@/models/Donor';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();

    // Total funds collected
    const totalFundsResult = await Donation.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalFunds = totalFundsResult[0]?.total || 0;

    // Total donors
    const totalDonors = await Donor.countDocuments();

    // Best donor
    const bestDonor = await Donor.findOne().sort({ totalDonation: -1 });

    // This month collection
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const thisMonthResult = await Donation.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const thisMonthCollection = thisMonthResult[0]?.total || 0;

    // Recent donations
    const recentDonations = await Donation.find()
      .populate('donorId', 'name')
      .sort({ date: -1 })
      .limit(5);

    // Monthly donation line chart data (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyStats = await Donation.aggregate([
      {
        $match: {
          date: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    const chartData = monthlyStats.map((stat) => {
      const monthName = new Date(stat._id.year, stat._id.month - 1).toLocaleString('default', { month: 'short' });
      return {
        name: `${monthName} ${stat._id.year}`,
        total: stat.total,
      };
    });

    return NextResponse.json({
      stats: {
        totalFunds,
        totalDonors,
        bestDonor,
        thisMonthCollection,
      },
      recentDonations,
      chartData,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
