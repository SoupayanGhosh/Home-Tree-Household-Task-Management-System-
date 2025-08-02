import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/option';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { createNotificationWithBrowserAlert } from '@/lib/notificationHelper';

// GET - Fetch user's medicines
export async function GET() {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserModel.findById(session.user._id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate current stock for each medicine
    const medicines = (user.medicines || []).map(medicine => {
      const daysPassed = Math.floor((new Date().getTime() - new Date(medicine.DateAdded).getTime()) / (1000 * 60 * 60 * 24));
      const quantityLeft = Math.max(0, medicine.quantity - (medicine.UsePerDay * daysPassed));
      const stockPercentage = (quantityLeft / medicine.quantity) * 100;
      return {
        id: medicine._id,
        name: medicine.name,
        quantity: medicine.quantity,
        UsePerDay: medicine.UsePerDay,
        DateAdded: medicine.DateAdded,
        quantityLeft,
        stockPercentage,
        isLowStock: stockPercentage <= 10,
        time: medicine.time
      };
    });

    return NextResponse.json({ medicines });

  } catch (error) {
    console.error('Get medicines error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add new medicine
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, quantity, UsePerDay, time } = await request.json();
    
    if (!name || !quantity || !UsePerDay || !time) {
      return NextResponse.json({ error: 'Name, quantity, use per day, and time are required' }, { status: 400 });
    }

    const newMedicine = {
      name,
      quantity: Number(quantity),
      UsePerDay: Number(UsePerDay),
      DateAdded: new Date(),
      quantityLeft: Number(quantity),
      time
    };

    await UserModel.findByIdAndUpdate(
      session.user._id,
      { $push: { medicines: newMedicine } }
    );

    return NextResponse.json({ 
      success: true, 
      medicine: newMedicine 
    });

  } catch (error) {
    console.error('Add medicine error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update medicine
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { medicineId, updates } = await request.json();
    console.log('Medicine update request:', { medicineId, updates });
    
    if (!medicineId) {
      return NextResponse.json({ error: 'Medicine ID is required' }, { status: 400 });
    }

    console.log('Looking for medicine with ID:', medicineId);
    
    // Use findByIdAndUpdate with array update operator
    const updateData: any = {};
    
    if (updates.name) {
      updateData['medicines.$[elem].name'] = updates.name;
    }
    if (updates.quantity) {
      updateData['medicines.$[elem].quantity'] = updates.quantity;
      updateData['medicines.$[elem].quantityLeft'] = updates.quantity;
      updateData['medicines.$[elem].DateAdded'] = new Date(); // Reset date when quantity changes
    }
    if (updates.UsePerDay) {
      updateData['medicines.$[elem].UsePerDay'] = updates.UsePerDay;
    }
    if (updates.time) {
      updateData['medicines.$[elem].time'] = updates.time;
    }
    
    console.log('Update data:', updateData);
    
    // Try to find the medicine first to get the correct _id
    const user = await UserModel.findById(session.user._id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const medicine = user.medicines.find((med: any) => 
      med._id.toString() === medicineId || med.id === medicineId
    );
    
    if (!medicine) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
    }
    
    const actualMedicineId = (medicine._id as any).toString();
    console.log('Found medicine with actual ID:', actualMedicineId);
    
    const updateResult = await UserModel.findByIdAndUpdate(
      session.user._id,
      { $set: updateData },
      {
        arrayFilters: [{ "elem._id": actualMedicineId }],
        new: true
      }
    );
    
    if (!updateResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log('Update result:', updateResult);
    
    // Find the updated medicine
    const updatedMedicine = updateResult.medicines.find((med: any) => (med._id as any).toString() === actualMedicineId);
    if (!updatedMedicine) {
      return NextResponse.json({ error: 'Medicine not found after update' }, { status: 404 });
    }
    
    console.log('Updated medicine:', updatedMedicine);

    // Check if stock is low after update
    const daysPassed = Math.floor((new Date().getTime() - new Date(updatedMedicine.DateAdded).getTime()) / (1000 * 60 * 60 * 24));
    const quantityLeft = Math.max(0, updatedMedicine.quantity - (updatedMedicine.UsePerDay * daysPassed));
    const stockPercentage = (quantityLeft / updatedMedicine.quantity) * 100;

    if (stockPercentage <= 10) {
      await createNotificationWithBrowserAlert({
        userId: session.user._id,
        type: 'medicine',
        title: 'Low Medicine Stock',
        message: `${updatedMedicine.name} is running low (${Math.floor(quantityLeft)} remaining)`,
        priority: 'high',
        relatedId: medicineId
      });
    }

    return NextResponse.json({ 
      success: true, 
      medicine: {
        ...updatedMedicine,
        quantityLeft,
        stockPercentage
      }
    });

  } catch (error) {
    console.error('Update medicine error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove medicine
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const medicineId = searchParams.get('medicineId');
    
    if (!medicineId) {
      return NextResponse.json({ error: 'Medicine ID is required' }, { status: 400 });
    }

    await UserModel.findByIdAndUpdate(
      session.user._id,
      { $pull: { medicines: { _id: medicineId } } }
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete medicine error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}