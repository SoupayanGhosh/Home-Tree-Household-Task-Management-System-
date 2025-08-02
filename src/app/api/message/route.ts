import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/option';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import FamilyModel from '@/model/family';
import mongoose, { Types } from 'mongoose';

// GET - Fetch messages for the current user
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

    if (!user.family_ID) {
      return NextResponse.json({ messages: [], familyMembers: [] });
    }

    // Get all family members including the creator
    const family = await FamilyModel.findById(user.family_ID).populate('members.userId');
    if (!family) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }

    // Get all users in the family (including creator)
    const familyMemberIds = [
      family.createdBy,
      ...family.members.map(member => member.userId)
    ];
    const familyMembers = await UserModel.find({ _id: { $in: familyMemberIds } })
      .select('username email');

    // Get messages for the current user (messages sent to them)
    const currentUser = await UserModel.findById(userId);
    const userMessages = currentUser?.messages || [];

    // Get sender information for received messages
    const senderIds = [...new Set(userMessages.map(msg => msg.sender))];
    const senders = await UserModel.find({ _id: { $in: senderIds } }).select('username');
    const senderMap = new Map(senders.map(sender => [(sender._id as any).toString(), sender.username]));

    // Get messages sent by the current user (we need to check all family members)
    const sentMessages = await UserModel.aggregate([
      { $match: { _id: { $in: familyMemberIds } } },
      { $unwind: '$messages' },
      {
        $match: {
          'messages.sender': new Types.ObjectId(userId)
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'messages.sendto',
          foreignField: '_id',
          as: 'recipientInfo'
        }
      },
      {
        $project: {
          _id: '$messages._id',
          content: '$messages.content',
          createdAt: '$messages.createdAt',
          status: '$messages.status',
          sender: currentUser?.username || 'Unknown',
          senderId: '$messages.sender',
          recipient: { $arrayElemAt: ['$recipientInfo.username', 0] },
          recipientId: '$messages.sendto'
        }
      }
    ]);

    // Combine received and sent messages
    const receivedMessages = userMessages.map(msg => ({
      _id: msg._id,
      content: msg.content,
      createdAt: msg.createdAt,
      status: msg.status,
      sender: senderMap.get(msg.sender.toString()) || 'Unknown',
      senderId: msg.sender,
      recipient: currentUser?.username || 'Unknown',
      recipientId: userId
    }));

    const messages = [...receivedMessages, ...sentMessages].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      messages,
      familyMembers,
      familyName: family.name
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Send a new message
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, recipientId } = await request.json();
    
    if (!content || !recipientId) {
      return NextResponse.json({ error: 'Content and recipient are required' }, { status: 400 });
    }

    const senderId = session.user._id;

    // Verify both users are in the same family
    const sender = await UserModel.findById(senderId);
    const recipient = await UserModel.findById(recipientId);

    if (!sender || !recipient) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!sender.family_ID || !recipient.family_ID) {
      return NextResponse.json({ error: 'Users must be in a family' }, { status: 400 });
    }

    if (sender.family_ID.toString() !== recipient.family_ID.toString()) {
      return NextResponse.json({ error: 'Users must be in the same family' }, { status: 403 });
    }

    // Create the message
    const newMessage = {
      sender: senderId,
      content,
      sendto: recipientId,
      status: 'Sent' as const,
      createdAt: new Date()
    };

    // Add message to recipient's messages array
    await UserModel.findByIdAndUpdate(
      recipientId,
      { $push: { messages: newMessage } }
    );

    // Create notification for the recipient
    const { createNotificationWithBrowserAlert } = await import('@/lib/notificationHelper');
    await createNotificationWithBrowserAlert({
      userId: recipientId,
      type: 'message',
      title: 'New Message',
      message: `You have a new message from ${sender.username}`,
      priority: 'medium',
      relatedId: senderId
    });

    return NextResponse.json({ 
      message: 'Message sent successfully',
      messageData: newMessage
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Mark message as read
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId } = await request.json();
    
    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const userId = session.user._id;

    // Update message status to 'Read'
    const result = await UserModel.updateOne(
      { 
        _id: userId,
        'messages._id': messageId 
      },
      { 
        $set: { 'messages.$.status': 'Read' } 
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Message marked as read' });

  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a message
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId } = await request.json();
    
    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const userId = session.user._id;

    // Delete message from user's messages array
    const result = await UserModel.updateOne(
      { 
        _id: userId,
        'messages._id': messageId 
      },
      { 
        $pull: { messages: { _id: messageId } } 
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Message deleted successfully' });

  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
