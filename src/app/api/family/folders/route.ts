import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import FamilyModel from "@/model/family";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { folderType, folderUrl } = await req.json();
    
    // Validate folder type
    const validTypes = ['docsFolder', 'videosFolder', 'photosFolder'];
    if (!validTypes.includes(folderType)) {
      return NextResponse.json({ error: "Invalid folder type" }, { status: 400 });
    }

    // Validate Google Drive URL format
    if (folderUrl && !/^https:\/\/drive\.google\.com\/drive\/folders\/[a-zA-Z0-9_-]+/.test(folderUrl)) {
      return NextResponse.json({ error: "Invalid Google Drive folder URL" }, { status: 400 });
    }

    // Find family where user is a member or creator
    const family = await FamilyModel.findOne({
      $or: [
        { "members.userId": session.user._id },
        { createdBy: session.user._id }
      ]
    });

    if (!family) {
      return NextResponse.json({ error: "No family found" }, { status: 404 });
    }

    // Update the specific folder field
    const updateData: any = {};
    updateData[folderType] = folderUrl || null;
    updateData.updatedAt = new Date();

    await FamilyModel.findByIdAndUpdate(family._id, updateData);

    return NextResponse.json({ 
      message: "Folder link updated successfully",
      folderType,
      folderUrl 
    });
  } catch (error) {
    console.error("Error updating folder link:", error);
    return NextResponse.json(
      { error: "Failed to update folder link" },
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

    const { folderType } = await req.json();
    
    // Validate folder type
    const validTypes = ['docsFolder', 'videosFolder', 'photosFolder'];
    if (!validTypes.includes(folderType)) {
      return NextResponse.json({ error: "Invalid folder type" }, { status: 400 });
    }

    // Find family where user is a member or creator
    const family = await FamilyModel.findOne({
      $or: [
        { "members.userId": session.user._id },
        { createdBy: session.user._id }
      ]
    });

    if (!family) {
      return NextResponse.json({ error: "No family found" }, { status: 404 });
    }

    // Remove the specific folder field
    const updateData: any = {};
    updateData[folderType] = null;
    updateData.updatedAt = new Date();

    await FamilyModel.findByIdAndUpdate(family._id, updateData);

    return NextResponse.json({ 
      message: "Folder link removed successfully",
      folderType
    });
  } catch (error) {
    console.error("Error removing folder link:", error);
    return NextResponse.json(
      { error: "Failed to remove folder link" },
      { status: 500 }
    );
  }
} 