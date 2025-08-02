import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/option';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import FamilyModel from '@/model/family';
import BillModel from '@/model/Bills';
import GroceryListModel from '@/model/grocery';
import NotificationModel from '@/model/Notification';
import { createNotificationWithBrowserAlert } from '@/lib/notificationHelper';
import { Types } from 'mongoose';

// GET - Fetch dashboard data
export async function GET() {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user._id;
    
    // Get user with family information
    const user = await UserModel.findById(userId).populate('family_ID');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get notifications
    const notifications = await NotificationModel.find({ 
      userId: new Types.ObjectId(userId),
      isRead: false 
    })
    .sort({ createdAt: -1 })
    .limit(10);

    // Get messages
    const messages = user.messages || [];
    const senderIds = [...new Set(messages.map(msg => msg.sender))];
    const senders = await UserModel.find({ _id: { $in: senderIds } }).select('username');
    const senderMap = new Map(senders.map(sender => [(sender._id as any).toString(), sender.username]));

    const formattedMessages = messages.slice(0, 5).map(msg => ({
      id: msg._id,
      sender: senderMap.get(msg.sender.toString()) || 'Unknown',
      message: msg.content,
      time: formatTimeAgo(msg.createdAt),
      avatar: senderMap.get(msg.sender.toString())?.charAt(0) || 'U'
    }));

    // Get todo list
    const todos = (user.ToDoList || []).map((todo: any) => {
      return {
        ...todo,
        id: todo.id || (todo._id ? todo._id.toString() : Date.now().toString()),
        text: todo.text || todo.content || '',
        completed: todo.completed || false,
        priority: todo.priority || 'medium'
      };
    });

    // Get bills if user has family
    let bills: any[] = [];
    if (user.family_ID) {
      const familyBills = await BillModel.findOne({ family_id: user.family_ID });
      if (familyBills) {
        const billTypes = ['electricity', 'cable', 'wifi', 'tax'];
        bills = billTypes.map(type => {
          const bill = (familyBills as any)[type];
          if (bill && bill.amount > 0) {
            const dueDate = new Date(bill.dueDate);
            const today = new Date();
            const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            let status = 'pending';
            if (bill.isPaid) {
              status = 'paid';
            } else if (daysUntilDue < 0) {
              status = 'overdue';
            } else if (daysUntilDue <= 3) {
              status = 'due-soon';
            }

            return {
              id: `${type}-${(familyBills._id as any)}`,
              type,
              name: type.charAt(0).toUpperCase() + type.slice(1),
              amount: bill.amount,
              dueDate: bill.dueDate,
              status,
              daysUntilDue,
              familyBillId: familyBills._id // Add this to the bill object
            };
          }
          return null;
        }).filter(Boolean);
      }
    }

    // Get medicine stock with automatic calculation
    const medicines = (user.medicines || []).map(medicine => {
      const daysPassed = Math.floor((new Date().getTime() - new Date(medicine.DateAdded).getTime()) / (1000 * 60 * 60 * 24));
      const totalConsumed = medicine.UsePerDay * daysPassed;
      const stockLeft = Math.max(0, medicine.quantity - totalConsumed);
      const stockPercentage = medicine.quantity > 0 ? (stockLeft / medicine.quantity) * 100 : 0;
      
      return {
        id: medicine._id,
        name: medicine.name,
        dosage: `${medicine.UsePerDay} per day`,
        quantityLeft: stockLeft,
        quantity: medicine.quantity,
        stockPercentage,
        time: medicine.time || '08:00',
        isLowStock: stockPercentage <= 20
      };
    });

    // Get family tasks if user has family
    let tasks: any[] = [];
    if (user.family_ID) {
      const family = await FamilyModel.findById(user.family_ID).populate('tasks.createdBy', 'username');
      if (family && family.tasks) {
        tasks = family.tasks.slice(0, 5).map((task: any) => ({
          id: task._id.toString(),
          title: task.title,
          assignee: task.createdBy?.username || 'Unknown User',
          priority: task.priority,
          tobecompletedBy: task.tobecompletedBy,
          dueDate: formatDueDate(task.tobecompletedBy, task.dueDate)
        }));
      }
    }

    // Get grocery lists
    const groceryLists = await GroceryListModel.find({
      $or: [
        { creator: new Types.ObjectId(userId) },
        { recipients: new Types.ObjectId(userId) }
      ],
      status: 'active'
    }).populate('creator', 'username').limit(3);

    // Calculate quick stats
    const totalExpenses = bills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    const pendingBills = bills.filter(bill => bill.status === 'pending' || bill.status === 'due-soon').length;
    const completedTasks = todos.filter(todo => todo.completed).length;
    const totalTasks = todos.length;
    let familyMembers = 1;
    if (user.family_ID) {
      const family = await FamilyModel.findById(user.family_ID);
      familyMembers = family && family.members ? family.members.length + 1 : 1;
    }

    // Check for low stock medicines and create notifications
    for (const medicine of medicines) {
      if (medicine.isLowStock) {
        await createNotificationWithBrowserAlert({
          userId,
          type: 'medicine',
          title: 'Low Medicine Stock',
          message: `${medicine.name} is running low (${medicine.quantityLeft} remaining)`,
          priority: 'high',
          relatedId: medicine.id as string
        });
      }
    }

    // Check for bills due soon and create notifications
    for (const bill of bills) {
      if (bill.daysUntilDue <= 3 && bill.daysUntilDue >= 0 && bill.status !== 'paid') {
        // Prevent duplicate notifications: only create if no notification (read or unread) exists for this bill type, due date, and user, or if deletedAt > 1 day ago
        const existing = await NotificationModel.findOne({
          userId,
          type: 'bill',
          billType: bill.type,
          dueDate: bill.dueDate,
          relatedId: bill.familyBillId || bill._id
        }).sort({ createdAt: -1 });
        let shouldCreate = false;
        if (!existing) {
          shouldCreate = true;
        } else if (existing.deletedAt) {
          const deletedAt = new Date(existing.deletedAt);
          const now = new Date();
          const diff = now.getTime() - deletedAt.getTime();
          if (diff > 24 * 60 * 60 * 1000) {
            shouldCreate = true;
          }
        }
        if (shouldCreate) {
          await createNotificationWithBrowserAlert({
            userId,
            type: 'bill',
            billType: bill.type,
            title: 'Bill Due Soon',
            message: `${bill.name} bill of $${bill.amount} is due in ${bill.daysUntilDue} days`,
            priority: bill.daysUntilDue === 0 ? 'high' : 'medium',
            relatedId: bill.familyBillId || bill._id,
            dueDate: bill.dueDate
          });
        }
      }
    }

    return NextResponse.json({
      notifications: notifications.map(notif => ({
        id: notif._id,
        type: notif.type,
        message: notif.message,
        time: formatTimeAgo(notif.createdAt),
        priority: notif.priority
      })),
      messages: formattedMessages,
      todos: todos,
      bills,
      medicines,
      tasks,
      groceryLists: groceryLists.map(list => ({
        id: list._id,
        title: list.title || 'Grocery List',
        creator: (list.creator as any)?.username || 'Unknown',
        itemCount: list.items.length,
        completedCount: list.items.filter(item => item.completed).length
      })),
      stats: {
        totalExpenses,
        pendingBills,
        completedTasks,
        totalTasks,
        familyMembers
      }
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new todo item
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, priority = 'medium', dueDate } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Todo text is required' }, { status: 400 });
    }

    const todoItem = {
      id: Date.now().toString(),
      text,
      completed: false,
      priority,
      createdAt: new Date(),
      dueDate: dueDate ? new Date(dueDate) : undefined
    };

    await UserModel.findByIdAndUpdate(
      session.user._id,
      { $push: { ToDoList: todoItem } }
    );

    return NextResponse.json({ 
      success: true, 
      todo: todoItem 
    });

  } catch (error) {
    console.error('Create todo error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update todo item or family task
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { todoId, taskId, updates } = await request.json();
    
    // Handle todo updates
    if (todoId) {
      if (!updates) {
        return NextResponse.json({ error: 'Updates are required' }, { status: 400 });
      }

      const updateResult = await UserModel.findByIdAndUpdate(
        session.user._id,
        {
          $set: {
            [`ToDoList.$[elem].completed`]: updates.completed
          }
        },
        {
          arrayFilters: [{ "elem.id": todoId }],
          new: true
        }
      );
      
      if (!updateResult) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      const updatedTodo = updateResult.ToDoList.find((todo: any) => todo.id === todoId);
      if (!updatedTodo) {
        return NextResponse.json({ error: 'Todo not found after update' }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        todo: updatedTodo 
      });
    }
    // Handle family task updates
    else if (taskId) {
      if (!updates) {
        return NextResponse.json({ error: 'Updates are required' }, { status: 400 });
      }

      // Get user's family
      const user = await UserModel.findById(session.user._id);
      if (!user?.family_ID) {
        return NextResponse.json({ error: 'User not in a family' }, { status: 400 });
      }

      // Update the task in the family
      const family = await FamilyModel.findById(user.family_ID);
      if (!family) {
        return NextResponse.json({ error: 'Family not found' }, { status: 404 });
      }

      const taskIndex = family.tasks.findIndex((t: any) => 
        t._id.toString() === taskId
      );

      if (taskIndex === -1) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }

      // Update task fields
      if (updates.title) family.tasks[taskIndex].title = updates.title;
      if (updates.priority) family.tasks[taskIndex].priority = updates.priority;
      if (updates.tobecompletedBy) family.tasks[taskIndex].tobecompletedBy = updates.tobecompletedBy;
      if (updates.dueDate) family.tasks[taskIndex].dueDate = new Date(updates.dueDate);

      await family.save();

      return NextResponse.json({ 
        success: true, 
        task: family.tasks[taskIndex] 
      });
    }
    else {
      return NextResponse.json({ error: 'Either todoId or taskId is required' }, { status: 400 });
    }

  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete todo item
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const todoId = searchParams.get('todoId');
    const taskId = searchParams.get('taskId');
    
    // Handle todo deletion
    if (todoId) {
      const user = await UserModel.findById(session.user._id);
      if (user) {
        user.ToDoList = user.ToDoList.filter((todo: any) => 
          todo.id !== todoId && todo._id?.toString() !== todoId
        );
        await user.save();
      }

      return NextResponse.json({ success: true });
    }
    // Handle family task deletion
    else if (taskId) {
      const user = await UserModel.findById(session.user._id);
      if (!user?.family_ID) {
        return NextResponse.json({ error: 'User not in a family' }, { status: 400 });
      }

      const family = await FamilyModel.findById(user.family_ID);
      if (!family) {
        return NextResponse.json({ error: 'Family not found' }, { status: 404 });
      }

      family.tasks = family.tasks.filter((task: any) => 
        task._id.toString() !== taskId
      );

      await family.save();
      return NextResponse.json({ success: true });
    }
    else {
      return NextResponse.json({ error: 'Either todoId or taskId is required' }, { status: 400 });
    }

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  return new Date(date).toLocaleDateString();
}

function formatDueDate(dueType: string, dueDate?: Date): string {
  if (dueDate) {
    const now = new Date();
    const taskDate = new Date(dueDate);
    
    // If due date is today
    if (taskDate.toDateString() === now.toDateString()) {
      return 'Today';
    }
    
    // If due date is tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (taskDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    // Otherwise return formatted date
    return taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Fallback to the dueType if no specific date
  switch (dueType) {
    case 'Today': return 'Today';
    case 'Tomorrow': return 'Tomorrow';
    case 'This Week': return 'This Week';
    case 'This Month': return 'This Month';
    default: return dueType;
  }
}