"use client"
import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Trash2, Copy, Check, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface FamilyMember {
  id: string;
  name: string;
  joinedAt: string;
  isCreator: boolean;
}

interface FamilyData {
  name: string;
  createdAt: string;
  creator: string;
  inviteCode: string;
  members: FamilyMember[];
}

const FamilyView = () => {
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [familyData, setFamilyData] = useState<FamilyData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchFamilyData = async () => {
      try {
        const response = await fetch("/api/family");
        if (!response.ok) {
          throw new Error("Failed to fetch family data");
        }
        const data = await response.json();
        setFamilyData(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load family data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyData();
  }, [toast]);

  const handleCopyInviteCode = async () => {
    if (!familyData) return;
    
    try {
      await navigator.clipboard.writeText(familyData.inviteCode);
      setCopiedInvite(true);
      toast({
        title: "Invite code copied!",
        description: "Share this code with family members to invite them.",
      });
      setTimeout(() => setCopiedInvite(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the code manually.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const confirmed = window.confirm("Are you sure want to remove this member?");
    if (!confirmed) return;
    try {
      const response = await fetch("/api/family/members", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove member");
      }

      // Refresh family data
      const updatedResponse = await fetch("/api/family");
      const updatedData = await updatedResponse.json();
      setFamilyData(updatedData);

      toast({
        title: "Member removed",
        description: "Member has been removed from the family.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  // Handler for a member to leave the family
  const handleLeaveFamily = async () => {
    if (!familyData) return;
    const confirmed = window.confirm("Are you sure you want to leave the family?");
    if (!confirmed) return;
    try {
      const response = await fetch("/api/family/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: session?.user?._id }),
      });
      if (!response.ok) throw new Error("Failed to leave family");
      toast({ title: "Left family", description: "You have left the family." });
      setFamilyData(null);
      // Optionally reload or redirect
      router.push("/family/familycreate");
    } catch (error) {
      toast({ title: "Error", description: "Failed to leave family", variant: "destructive" });
    }
  };

  // Handler for the creator to delete the family
  const handleDeleteFamily = async () => {
    if (!familyData) return;
    const confirmed = window.confirm("Are you sure you want to delete the family? This will remove all members and cannot be undone.");
    if (!confirmed) return;
    try {
      const response = await fetch("/api/family", { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete family");
      toast({ title: "Family deleted", description: "The family has been deleted." });
      setFamilyData(null);
      router.push("/family/familycreate");
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete family", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">Loading...</div>
      </div>
    );
  }

  if (!familyData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-foreground">Manage Family</h1>
          <Card className="w-full">
            <CardContent className="p-6 text-center">
              <p>No family found. Would you like to create one?</p>
              <Button className="mt-4" onClick={() => router.push("/family/familycreate")}>Create Family</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isCreator = session?.user?.username === familyData.creator;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Manage Family</h1>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{familyData.name}</h2>
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span>Created: {new Date(familyData.createdAt).toLocaleDateString()}</span>
                  <span>Creator: {familyData.creator}</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Members Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Family Members</h3>
              <div className="space-y-3">
                {familyData.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.name}</span>
                          {member.isCreator && (
                            <Badge variant="secondary" className="text-xs">Creator</Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Joined: {new Date(member.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Show leave button for self if not creator */}
                      {session?.user?.username === member.name && !member.isCreator && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleLeaveFamily}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      )}
                      {/* Show remove button for creator to remove others */}
                      {isCreator && !member.isCreator && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemoveMember(member.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invite Code Section */}
            <div className="flex justify-start">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Invite Code</h4>
                <div className="flex items-center gap-2">
                  <code className="bg-background px-3 py-1 rounded border text-sm font-mono">
                    {familyData.inviteCode}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyInviteCode}
                    className="h-8 w-8"
                  >
                    {copiedInvite ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Click to copy and share with family members
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Delete family button for creator */}
      {isCreator && (
        <div className="max-w-4xl mx-auto mt-6">
          <Button variant="destructive" onClick={handleDeleteFamily} size="lg" className="hover:bg-black">
            Delete Family
          </Button>
        </div>
      )}
    </div>
  );
};

export default FamilyView;