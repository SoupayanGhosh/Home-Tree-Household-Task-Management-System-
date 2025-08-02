import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Family from '@/model/family';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/option';
import User from '@/model/User';
import mongoose from 'mongoose';

export async function POST(req: Request) {
    try {
      // 1. Connect to DB
      await dbConnect();
      console.log('Connected to DB');
      
      // 2. Verify authentication
      const session = await getServerSession(authOptions);
      console.log('Session:', session);
      if (!session?.user?._id) {
        console.log('No user id in session');
        return NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 401 }
        );
      }
  
      // 3. Validate input
      const { name } = await req.json();
      console.log('Family name:', name);
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        console.log('Invalid family name');
        return NextResponse.json(
          { success: false, message: 'Valid family name is required' },
          { status: 400 }
        );
      }
  
      // 4. Create family with proper ObjectId conversion
      const family = new Family({
        name: name.trim(),
        createdBy: new mongoose.Types.ObjectId(session.user._id),
        invitationCode: Math.random().toString(36).slice(2, 10).toUpperCase() // TEMP: set manually for debug
      });
      console.log('Family instance:', family);
  
      // 5. Save with explicit error handling
      let savedFamily;
      try {
        savedFamily = await family.save();
        console.log('Saved family:', savedFamily);
        // Update the creator's user document to reference the new family
        await User.findByIdAndUpdate(
          session.user._id,
          { $set: { family_ID: savedFamily._id } }
        );
      } catch (saveError) {
        console.error('Error saving family:', saveError);
        return NextResponse.json(
          { success: false, message: 'Error saving family', error: saveError },
          { status: 500 }
        );
      }
      
      // 6. Return complete response
      return NextResponse.json({
        success: true,
        data: {
          _id: savedFamily._id,
          name: savedFamily.name,
          invitationCode: savedFamily.invitationCode,
          createdAt: savedFamily.createdAt
        }
      });
  
    } catch (error) {
      console.error('Family creation error:', error);
      return NextResponse.json(
        { success: false, message: 'Internal server error', error: error?.toString?.() || error },
        { status: 500 }
      );
    }
  }

export async function GET(req: Request) {
    try {
      await dbConnect();
      const session = await getServerSession(authOptions);
      const { searchParams } = new URL(req.url);
      const code = searchParams.get('code');
  
      if (!session?.user?._id) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
  
      if (code) {
        // Verify code and get family details
        const family = await Family.findOne({ invitationCode: code })
          .populate('createdBy', 'username', User)
          .populate('members.userId', 'username', User);
  
        if (!family) {
          return new NextResponse('Invalid invitation code', { status: 404 });
        }
  
        return NextResponse.json(family);
      } else {
        return new NextResponse('Code is required', { status: 400 });
      }
    } catch (error) {
      return new NextResponse('Internal Error', { status: 500 });
    }
  }
  
  export async function PATCH(req: Request) {
    try {
      await dbConnect();
      const session = await getServerSession(authOptions);
      if (!session?.user?._id) {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      const { code } = await req.json();
      const userId = session.user._id;

      // Check if user is already a member
      const family = await Family.findOne({ invitationCode: code });
      if (!family) {
        return new NextResponse('Invalid invitation code', { status: 404 });
      }
      const alreadyMember = family.members.some(
        (member: any) => member.userId.toString() === userId.toString()
      );
      if (alreadyMember) {
        // Also update user's family_ID if not set
        await User.findByIdAndUpdate(userId, { $set: { family_ID: family._id } });
        return NextResponse.json(family);
      }

      // Add user to members with joinedAt
      family.members.push({ userId: new mongoose.Types.ObjectId(userId), joinedAt: new Date() });
      await family.save();
      // Update user's family_ID
      await User.findByIdAndUpdate(userId, { $set: { family_ID: family._id } });

      return NextResponse.json(family);
    } catch (error) {
      return new NextResponse('Internal Error', { status: 500 });
    }
  }