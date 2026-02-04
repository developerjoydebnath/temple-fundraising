import dbConnect from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const query = search
      ? {
          $or: [
            { action: { $regex: search, $options: 'i' } },
            { target: { $regex: search, $options: 'i' } },
            { details: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const logs = await ActivityLog.find(query)
      .populate('adminId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ActivityLog.countDocuments(query);

    return NextResponse.json({
      logs,
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
