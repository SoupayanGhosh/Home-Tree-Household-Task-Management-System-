import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import FamilyModel from "@/model/family";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import connectToDB from "@/lib/dbConnect";
import { Types } from "mongoose";
import User from "@/model/User";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const session = await getServerSession(authOptions);
    const { invitationCode } = await req.json();
    
    if (!session?.user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find family by invitation code
    const family = await FamilyModel.findOne({ invitationCode });

    if (!family) {
      return NextResponse.json(
        { error: "Invalid invitation code" },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const isMember = family.members.some(
      (member: { userId: Types.ObjectId }) => member.userId.toString() === session.user._id!.toString()
    );

    if (isMember) {
      return NextResponse.json(
        { error: "You are already a member of this family" },
        { status: 400 }
      );
    }

    // Add user to family
    family.members.push({
      userId: new Types.ObjectId(session.user._id),
      joinedAt: new Date()
    });

    await family.save();

    return NextResponse.json(
      { message: "Successfully joined the family" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to join family" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDB();
    const session = await getServerSession(authOptions);
    const { memberId } = await req.json();
    
    if (!session?.user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If the user is removing themselves (leaving family)
    if (memberId === session.user._id) {
      // Find the family where the user is a member
      const family = await FamilyModel.findOne({ "members.userId": memberId });
      if (!family) {
        return NextResponse.json({ error: "No family found" }, { status: 404 });
      }
      // Remove the user from the members array
      family.members = family.members.filter(
        (member: { userId: Types.ObjectId }) => member.userId.toString() !== memberId
      );
      await family.save();
      // Set user's family_ID to null
      await User.findByIdAndUpdate(memberId, { $set: { family_ID: null } });
      return NextResponse.json({ message: "Left family successfully" }, { status: 200 });
    }

    // Creator removing another member
    const family = await FamilyModel.findOne({
      createdBy: new Types.ObjectId(session.user._id as string)
    }).populate("members.userId", "username email");

    if (!family) {
      return NextResponse.json(
        { error: "No family found or you're not the creator" },
        { status: 404 }
      );
    }

    // Check if trying to remove creator
    if (new Types.ObjectId(memberId).equals(new Types.ObjectId(session.user._id as string))) {
      return NextResponse.json(
        { error: "Cannot remove family creator" },
        { status: 400 }
      );
    }

    // Remove member
    family.members = family.members.filter(
      (member: { userId: Types.ObjectId }) => !member.userId.equals(new Types.ObjectId(memberId))
    );
    await family.save();
    // Set user's family_ID to null
    await User.findByIdAndUpdate(memberId, { $set: { family_ID: null } });

    return NextResponse.json(
      { message: "Member removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}