import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/option';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import FamilyModel from '@/model/family';
import { createNotificationWithBrowserAlert } from '@/lib/notificationHelper';
import { Types } from 'mongoose';

// GET - Fetch family tasks
export async function GET() {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserModel.findById(session.user._id);
    if (!user || !user.family_ID) {
      return NextResponse.json({ error: 'User not in a family' }, { status: 404 });
    }

    const family = await FamilyModel.findById(user.family_ID);
    if (!family) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }

    const tasks = family.tasks || [];

    return NextResponse.json({ tasks });

  } catch (error) {
    console.error('Get family tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new family task
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, tobecompletedBy, priority } = await request.json();
    
    if (!title || !tobecompletedBy || !priority) {
      return NextResponse.json({ error: 'Title, completion time, and priority are required' }, { status: 400 });
    }

    const user = await UserModel.findById(session.user._id);
    if (!user || !user.family_ID) {
      return NextResponse.json({ error: 'User not in a family' }, { status: 404 });
    }

    // Calculate due date based on tobecompletedBy
    const dueDate = calculateDueDate(tobecompletedBy);

    const newTask = {
      title,
      createdBy: new Types.ObjectId(session.user._id),
      tobecompletedBy,
      priority,
      dueDate
    };

    await FamilyModel.findByIdAndUpdate(
      user.family_ID,
      { $push: { tasks: newTask } }
    );

    // Notify family members about new task
    const family = await FamilyModel.findById(user.family_ID).populate('members.userId');
    if (family) {
      const familyMemberIds = [
        family.createdBy,
        ...family.members.map(member => member.userId)
      ].filter(id => id.toString() !== session.user._id);

      for (const memberId of familyMemberIds) {
        await createNotificationWithBrowserAlert({
          userId: memberId.toString(),
          type: 'task',
          title: 'New Family Task',
          message: `${user.username} added a new task: ${title}`,
          priority: priority === 'High' ? 'high' : priority === 'Medium' ? 'medium' : 'low'
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      task: newTask 
    });

  } catch (error) {
    console.error('Create family task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update family task
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId, updates } = await request.json();
    
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const user = await UserModel.findById(session.user._id);
    if (!user || !user.family_ID) {
      return NextResponse.json({ error: 'User not in a family' }, { status: 404 });
    }

    const family = await FamilyModel.findById(user.family_ID);
    if (!family) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }

    const taskIndex = family.tasks.findIndex((task: any) => task._id.toString() === taskId);
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Update the task
    family.tasks[taskIndex] = { ...family.tasks[taskIndex], ...updates };
    
    // Recalculate due date if tobecompletedBy is updated
    if (updates.tobecompletedBy) {
      family.tasks[taskIndex].dueDate = calculateDueDate(updates.tobecompletedBy);
    }
    
    await family.save();

    return NextResponse.json({ 
      success: true, 
      task: family.tasks[taskIndex] 
    });

  } catch (error) {
    console.error('Update family task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove family task
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const user = await UserModel.findById(session.user._id);
    if (!user || !user.family_ID) {
      return NextResponse.json({ error: 'User not in a family' }, { status: 404 });
    }

    await FamilyModel.findByIdAndUpdate(
      user.family_ID,
      { $pull: { tasks: { _id: taskId } } }
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete family task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to calculate due date
function calculateDueDate(tobecompletedBy: string): Date {
  const today = new Date();
  
  switch (tobecompletedBy) {
    case 'Today':
      return today;
    case 'Tomorrow':
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    case 'This Week':
      const thisWeek = new Date(today);
      thisWeek.setDate(thisWeek.getDate() + 7);
      return thisWeek;
    case 'This Month':
      const thisMonth = new Date(today);
      thisMonth.setMonth(thisMonth.getMonth() + 1);
      return thisMonth;
    default:
      return today;
  }
} 