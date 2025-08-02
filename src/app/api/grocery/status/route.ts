import { NextRequest, NextResponse } from 'next/server';
import GroceryListModel from '@/model/grocery';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/option';
import dbConnect from '@/lib/dbConnect';

function isOlderThanOneDay(date: Date) {
  return Date.now() - new Date(date).getTime() > 24 * 60 * 60 * 1000;
}

export async function PUT(request: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user._id;
  const body = await request.json();
  const { status } = body;

  try {
    // Find the active list
    const activeList = await GroceryListModel.findOne({ creator: userId, status: 'active' });
    if (!activeList) {
      return NextResponse.json({ message: 'No active list found' }, { status: 404 });
    }

    // If marking as completed, set completedAt
    if (status === 'completed') {
      activeList.status = 'completed';
      activeList.completedAt = new Date();
      await activeList.save();
      return NextResponse.json(activeList, { status: 200 });
    }

    // If updating status to something else, just update
    activeList.status = status;
    await activeList.save();
    return NextResponse.json(activeList, { status: 200 });
  } catch (error) {
    console.error('Error updating list status:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user._id;
  // Find completed lists
  const completedLists = await GroceryListModel.find({ creator: userId, status: 'completed' });
  // Delete lists older than 1 day
  const now = new Date();
  for (const list of completedLists) {
    if (list.completedAt && isOlderThanOneDay(list.completedAt)) {
      await GroceryListModel.deleteOne({ _id: list._id });
    }
  }
  // Return remaining completed lists
  const freshLists = await GroceryListModel.find({ creator: userId, status: 'completed' });
  return NextResponse.json(freshLists, { status: 200 });
} 