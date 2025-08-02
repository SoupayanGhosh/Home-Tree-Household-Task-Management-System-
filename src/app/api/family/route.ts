import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import FamilyModel from "@/model/family";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all families where the user is a member or the creator
    const families = await FamilyModel.find({
      $or: [
        { "members.userId": session.user._id },
        { createdBy: session.user._id }
      ]
    })
      .populate("createdBy", "username email")
      .populate("members.userId", "username email");

    if (!families || families.length === 0) {
      return NextResponse.json({ error: "No family found" }, { status: 404 });
    }

    const family = families[0];

    // Ensure createdBy is properly populated
    const creatorUsername = family.createdBy && typeof family.createdBy === 'object' 
      ? (family.createdBy as any).username 
      : null;

    // Prepare members data with proper typing
    let members = family.members.map(member => {
      const memberUser = member.userId && typeof member.userId === 'object' 
        ? member.userId as unknown as { _id: any, username: string }
        : null;

      const memberId = memberUser?._id?.toString() ?? member.userId?.toString();
      const creatorId = family.createdBy && typeof family.createdBy === 'object'
        ? (family.createdBy as any)._id?.toString()
        : (family.createdBy as string | undefined)?.toString();

      return {
        id: memberId,
        name: memberUser?.username ?? 'Unknown',
        joinedAt: member.joinedAt,
        isCreator: memberId === creatorId
      };
    });

    // Ensure creator is always in the members list
    const creatorId = family.createdBy && typeof family.createdBy === 'object'
      ? (family.createdBy as any)._id?.toString()
      : (family.createdBy as string | undefined)?.toString();
    const creatorName = family.createdBy && typeof family.createdBy === 'object'
      ? (family.createdBy as any).username
      : 'Unknown';
    if (creatorId && !members.some(m => m.id === creatorId)) {
      members.unshift({
        id: creatorId,
        name: creatorName,
        joinedAt: family.createdAt,
        isCreator: true
      });
    }

    return NextResponse.json({
      name: family.name,
      createdAt: family.createdAt,
      creator: creatorUsername ?? 'Unknown',
      inviteCode: family.invitationCode,
      members,
      // Include Google Drive folder links
      docsFolder: family.docsFolder,
      videosFolder: family.videosFolder,
      photosFolder: family.photosFolder
    });
  } catch (error) {
    console.error("Error fetching family data:", error);
    return NextResponse.json(
      { error: "Failed to fetch family data" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const { name } = await req.json();
    
    if (!session?.user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has a family
    const existingFamily = await FamilyModel.findOne({
      "members.userId": session.user._id
    });

    if (existingFamily) {
      return NextResponse.json(
        { error: "You already belong to a family" },
        { status: 400 }
      );
    }

    // Create new family
    const newFamily = new FamilyModel({
      name,
      createdBy: session.user._id,
      members: [{ userId: session.user._id }]
    });

    await newFamily.save();

    return NextResponse.json(
      { message: "Family created successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create family" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find family where user is the creator
    const family = await FamilyModel.findOne({
      createdBy: session.user._id
    });

    if (!family) {
      return NextResponse.json(
        { error: "No family found or you're not the creator" },
        { status: 404 }
      );
    }

    // Set family_ID to null for all members
    const memberIds = family.members.map((m: any) => m.userId);
    await User.updateMany({ _id: { $in: memberIds } }, { $set: { family_ID: null } });

    await FamilyModel.deleteOne({ _id: family._id });

    return NextResponse.json(
      { message: "Family deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete family" },
      { status: 500 }
    );
  }
}