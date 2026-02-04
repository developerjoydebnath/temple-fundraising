import { logActivity } from '@/lib/logger';
import dbConnect from '@/lib/mongodb';
import { ActivityAction } from '@/models/ActivityLog';
import PaymentMethod from '@/models/PaymentMethod';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();

    // Role check removed

    const methods = await PaymentMethod.find().sort({ createdAt: -1 });
    return NextResponse.json(methods);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    // Role check removed

    const body = await request.json();
    const method = await PaymentMethod.create(body);

    await logActivity(ActivityAction.CREATE, 'PaymentMethod', `Added payment method ${method.name}`);

    return NextResponse.json(method, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
