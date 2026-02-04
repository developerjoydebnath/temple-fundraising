import dbConnect from '@/lib/mongodb';
import Donor from '@/models/Donor';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch all donors, but only return necessary fields for a dropdown to keep it light
    const donors = await Donor.find({}, 'name phone email')
      .sort({ name: 1 });

    return NextResponse.json(donors);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
