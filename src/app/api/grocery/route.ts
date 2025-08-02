import { NextRequest, NextResponse } from 'next/server';
import GroceryListModel from '@/model/grocery';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/option';
import dbConnect from '@/lib/dbConnect';

export async function GET(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user._id;
  // Find a list where the user is creator or a recipient (only active)
  const list = await GroceryListModel.findOne({
    $or: [
      { creator: userId, status: 'active' },
      { recipients: userId, status: 'active' }
    ]
  }).lean();
  return NextResponse.json(list || null);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user._id;
  // Delete any existing active list before creating a new one
  await GroceryListModel.deleteOne({ creator: userId, status: 'active' });
  const newList = await GroceryListModel.create({ creator: userId, items: [], status: 'active' });
  return NextResponse.json(newList, { status: 201 });
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user._id;
  const body = await req.json();
  const { action, item, itemId, recipientId } = body;
  
  // Find a list where the user is creator or a recipient
  const userList = await GroceryListModel.findOne({
    $or: [
      { creator: userId, status: 'active' },
      { recipients: userId, status: 'active' }
    ]
  });
  if (!userList) {
    return NextResponse.json({ message: 'No active list found' }, { status: 404 });
  }
  
  switch (action) {
    case 'add':
      userList.items.push(item);
      break;
    case 'remove':
      userList.items = userList.items.filter(i => i.id !== itemId);
      break;
    case 'toggle':
      userList.items = userList.items.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i);
      break;
    case 'share':
      // Add a recipient if not already present
      if (recipientId && !userList.recipients.some(r => r.toString() === recipientId)) {
        userList.recipients.push(recipientId);
        
        // Create notification for the recipient
        const { createNotificationWithBrowserAlert } = await import('@/lib/notificationHelper');
        await createNotificationWithBrowserAlert({
          userId: recipientId,
          type: 'grocery',
          title: 'Grocery List Shared',
          message: 'A grocery list has been shared with you',
          priority: 'medium',
          relatedId: (userList._id as any).toString()
        });
      }
      break;
    case 'complete':
      // Only the creator can complete the list
      if (userList.creator.toString() !== userId) {
        return NextResponse.json({ message: 'Only the creator can complete the list' }, { status: 403 });
      }
      userList.status = 'completed';
      userList.completedAt = new Date();
      break;
    default:
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  }
  await userList.save();
  return NextResponse.json(userList);
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user._id;
  await GroceryListModel.deleteOne({ creator: userId, status: 'active' });
  return new NextResponse(null, { status: 204 });
}