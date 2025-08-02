import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/option';
import dbConnect from '@/lib/dbConnect';
import BillModel from '@/model/Bills';
import UserModel from '@/model/User';

// GET - Fetch bills for the current user's family
export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user._id;
    
    // Get user with family information
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.family_ID) {
      return NextResponse.json({ bills: null });
    }

    // Get bills for the family
    const bills = await BillModel.findOne({ family_id: user.family_ID });
    console.log('GET - Found bills:', bills);
    
    return NextResponse.json({ bills });
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create or update bills for the family
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user._id;
    const requestData = await req.json();
    console.log('POST request data:', requestData);
    
    // Get user with family information
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.family_ID) {
      return NextResponse.json({ error: 'User must be part of a family' }, { status: 400 });
    }

    console.log('User family_ID:', user.family_ID);

    // Check if bills already exist for this family
    let bills = await BillModel.findOne({ family_id: user.family_ID });
    console.log('Existing bills:', bills);
    
    // Determine which bill type to add/update
    let billType = null;
    let billData = null;
    
    if (requestData.electricity !== undefined) {
      billType = 'electricity';
      billData = requestData.electricity;
    } else if (requestData.cable !== undefined) {
      billType = 'cable';
      billData = requestData.cable;
    } else if (requestData.wifi !== undefined) {
      billType = 'wifi';
      billData = requestData.wifi;
    } else if (requestData.tax !== undefined) {
      billType = 'tax';
      billData = requestData.tax;
    }
    
    if (!billType || !billData) {
      return NextResponse.json({ error: 'No valid bill type provided' }, { status: 400 });
    }
    
    console.log('Adding/updating bill type:', billType, 'with data:', billData);
    
    if (bills) {
      // Update existing bills document
      const updateData: any = {};
      updateData[billType] = {
        amount: billData.amount || 0,
        dueDate: billData.dueDate ? new Date(billData.dueDate) : new Date(),
        isPaid: billData.isPaid || false,
        paidDate: billData.paidDate ? new Date(billData.paidDate) : undefined,
        status: billData.status || 'pending'
      };

      console.log('Update data:', updateData);

      bills = await BillModel.findByIdAndUpdate(
        bills._id,
        updateData,
        { new: true }
      );
    } else {
      // Create new bills document with all fields initialized
      const newBillsData: any = {
        family_id: user.family_ID,
        electricity: {
          amount: 0,
          dueDate: new Date(),
          isPaid: false,
          status: 'pending'
        },
        cable: {
          amount: 0,
          dueDate: new Date(),
          isPaid: false,
          status: 'pending'
        },
        wifi: {
          amount: 0,
          dueDate: new Date(),
          isPaid: false,
          status: 'pending'
        },
        tax: {
          amount: 0,
          dueDate: new Date(),
          isPaid: false,
          status: 'pending'
        }
      };
      
      // Update the specific bill type with the provided data
      newBillsData[billType] = {
        amount: billData.amount || 0,
        dueDate: billData.dueDate ? new Date(billData.dueDate) : new Date(),
        isPaid: billData.isPaid || false,
        status: billData.status || 'pending'
      };
      
      console.log('New bills data:', newBillsData);
      
      try {
        bills = new BillModel(newBillsData);
        await bills.save();
        console.log('Bill saved successfully');
      } catch (saveError) {
        console.error('Save error:', saveError);
        return NextResponse.json({ 
          error: 'Failed to save bill', 
          details: saveError instanceof Error ? saveError.message : 'Unknown save error'
        }, { status: 500 });
      }
    }

    console.log('Final bills result:', bills);

    return NextResponse.json({ 
      message: 'Bill added successfully',
      bills 
    });
  } catch (error) {
    console.error('Error adding bill:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update a specific bill
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user._id;
    const { billType, updates } = await req.json();
    
    // Get user with family information
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.family_ID) {
      return NextResponse.json({ error: 'User must be part of a family' }, { status: 400 });
    }

    // Validate bill type
    const validTypes = ['electricity', 'cable', 'wifi', 'tax'];
    if (!validTypes.includes(billType)) {
      return NextResponse.json({ error: 'Invalid bill type' }, { status: 400 });
    }

    // Find and update the specific bill
    const updateData: any = {};
    updateData[billType] = {
      amount: updates.amount || 0,
      dueDate: updates.dueDate ? new Date(updates.dueDate) : new Date(),
      isPaid: updates.isPaid || false,
      paidDate: updates.paidDate ? new Date(updates.paidDate) : undefined,
      status: updates.status || 'pending'
    };

    const bills = await BillModel.findOneAndUpdate(
      { family_id: user.family_ID },
      updateData,
      { new: true }
    );

    if (!bills) {
      return NextResponse.json({ error: 'Bills not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Bill updated successfully',
      bills 
    });
  } catch (error) {
    console.error('Error updating bill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
