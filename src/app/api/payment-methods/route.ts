import dbConnect from '@/lib/mongodb';
import PaymentMethod from '@/models/PaymentMethod';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    const methods = await PaymentMethod.find({ isActive: true });
    return NextResponse.json(methods);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
