import { logActivity } from '@/lib/logger';
import dbConnect from '@/lib/mongodb';
import { ActivityAction } from '@/models/ActivityLog';
import PaymentMethod from '@/models/PaymentMethod';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const method = await PaymentMethod.findById(id);
    if (!method) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
    }
    return NextResponse.json(method);
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
    const method = await PaymentMethod.findByIdAndUpdate(id, body, {
      new: true,
    });
    if (!method) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
    }

    await logActivity(ActivityAction.UPDATE, 'PaymentMethod', `Updated payment method ${method.name}`);

    return NextResponse.json(method);
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

    // Role check removed

    const method = await PaymentMethod.findByIdAndDelete(id);
    if (!method) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
    }

    await logActivity(ActivityAction.DELETE, 'PaymentMethod', `Deleted payment method ${method.name}`);

    return NextResponse.json({ message: 'Payment method deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
