"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Users, Plus, UserPlus, Copy, Check, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface FamilyDetails {
  _id: string;
  name: string;
  invitationCode: string;
  createdAt: string;
  createdBy?: { _id: string; username: string };
  members?: Array<{ userId: { _id: string; username: string }; joinedAt: string }>;
}

const FamilyAdd = () => {
  const { data: session, status } = useSession();
  const userId = session?.user?._id;
  // Separate state for create and join panels
  const [familyName, setFamilyName] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [createdFamilyDetails, setCreatedFamilyDetails] = useState<FamilyDetails | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState({ create: false, verify: false, join: false });

  const [invitationCode, setInvitationCode] = useState('');
  const [joinFamilyDetails, setJoinFamilyDetails] = useState<FamilyDetails | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [justJoined, setJustJoined] = useState(false); // NEW STATE

  // Create Family
  const handleCreateFamily = async () => {
    if (!familyName.trim() || !userId) return;
    setIsLoading(prev => ({ ...prev, create: true }));
    try {
      const response = await fetch('/api/familyCreate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: familyName }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create family');
      }
      setGeneratedCode(data.data.invitationCode);
      setCreatedFamilyDetails(data.data);
      setFamilyName('');
      // Reset join panel state
      setInvitationCode('');
      setJoinFamilyDetails(null);
      setIsVerified(false);
      toast.success('Family created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create family');
    } finally {
      setIsLoading(prev => ({ ...prev, create: false }));
    }
  };

  // Copy Invite Code
  const handleCopyCode = async () => {
    if (generatedCode) {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Verify Invitation Code
  const handleVerifyCode = async () => {
    if (!invitationCode.trim()) return;
    setIsLoading(prev => ({ ...prev, verify: true }));
    try {
      const response = await fetch(`/api/familyCreate?code=${invitationCode}`);
      if (!response.ok) throw new Error('Invalid invitation code');
      const data = await response.json();
      setJoinFamilyDetails(data);
      setIsVerified(true);
      // Reset create panel state
      setFamilyName('');
      setGeneratedCode('');
      setCreatedFamilyDetails(null);
      toast.success('Code verified successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Invalid invitation code');
      setJoinFamilyDetails(null);
      setIsVerified(false);
    } finally {
      setIsLoading(prev => ({ ...prev, verify: false }));
    }
  };

  // Join Family
  const handleJoinFamily = async () => {
    if (!invitationCode.trim() || !userId || !isVerified) return;
    setIsLoading(prev => ({ ...prev, join: true }));
    try {
      const response = await fetch('/api/familyCreate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: invitationCode }),
      });
      if (!response.ok) throw new Error('Failed to join family');
      const data = await response.json();
      setJoinFamilyDetails(data);
      setJustJoined(true); // SET JUST JOINED
      // Reset create panel state
      setFamilyName('');
      setGeneratedCode('');
      setCreatedFamilyDetails(null);
      toast.success('Successfully joined the family!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to join family');
    } finally {
      setIsLoading(prev => ({ ...prev, join: false }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-2">
            <Users className="h-8 w-8 text-slate-600" />
            Family Management
          </h1>
          <p className="text-slate-600">Create a new family or join an existing one</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Family Section */}
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="bg-slate-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Plus className="h-5 w-5" />
                Create Family
              </CardTitle>
              <CardDescription>
                Start a new family and invite members
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="familyName" className="text-slate-700">
                  Family Name
                </Label>
                <Input
                  id="familyName"
                  type="text"
                  placeholder="Enter family name"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="border-slate-300 focus:border-slate-500"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateFamily}
                  disabled={!familyName.trim() || isLoading.create || status !== 'authenticated'}
                  className="flex-1 bg-slate-700 hover:bg-slate-800 text-white"
                >
                  {isLoading.create ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Create'}
                </Button>
                {/* Invite Code Display Area */}
                <div className="flex-1">
                  {generatedCode ? (
                    <div
                      onClick={handleCopyCode}
                      className="h-10 bg-slate-100 border border-slate-300 rounded-md flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors"
                    >
                      <span className="font-mono font-bold text-slate-800 mr-2">
                        {generatedCode}
                      </span>
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-slate-600" />
                      )}
                    </div>
                  ) : (
                    <div className="h-10 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-center">
                      <span className="text-slate-400 text-sm">Invite code will appear here</span>
                    </div>
                  )}
                </div>
              </div>

              {generatedCode && (
                <p className="text-sm text-slate-600 text-center">
                  Click the code above to copy • Share with family members to invite them
                </p>
              )}
              {createdFamilyDetails && (
                <div className="mt-4 text-sm text-slate-700">
                  <div><b>Family Name:</b> {createdFamilyDetails.name}</div>
                  <div><b>Invite Code:</b> {createdFamilyDetails.invitationCode}</div>
                  <div><b>Created At:</b> {new Date(createdFamilyDetails.createdAt).toLocaleString()}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Join Family Section */}
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="bg-slate-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <UserPlus className="h-5 w-5" />
                Join Family
              </CardTitle>
              <CardDescription>
                Enter an invitation code to join a family
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invitationCode" className="text-slate-700">
                  Invitation Code
                </Label>
                <Input
                  id="invitationCode"
                  type="text"
                  placeholder="Enter invitation code"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                  className="border-slate-300 focus:border-slate-500 font-mono text-center"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleVerifyCode}
                  disabled={!invitationCode.trim() || isLoading.verify || status !== 'authenticated'}
                  variant="outline"
                  className="flex-1 border-slate-300 hover:bg-slate-50"
                >
                  {isLoading.verify ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                </Button>
                <Button
                  onClick={handleJoinFamily}
                  disabled={!invitationCode.trim() || !isVerified || isLoading.join || status !== 'authenticated'}
                  className="flex-1 bg-slate-700 hover:bg-slate-800 text-white"
                >
                  {isLoading.join ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Join'}
                </Button>
              </div>

              <Separator className="bg-slate-200" />

              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-4">
                  <h4 className="font-medium text-slate-800 mb-2">
                    {joinFamilyDetails ? `${joinFamilyDetails.name} Family` : 'View Panel'}
                  </h4>
                  {justJoined && joinFamilyDetails ? (
                    <div className="mb-4 p-4 rounded-md border border-green-400 bg-green-50 flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="text-green-700 font-semibold">
                        Congratulations, you are now part of {joinFamilyDetails.name}!
                      </span>
                    </div>
                  ) : joinFamilyDetails ? (
                    <div className="space-y-3">
                      <div className="text-sm">
                        <p className="text-slate-600">
                          <span className="font-medium">Creator:</span> {joinFamilyDetails.createdBy?.username}
                        </p>
                        <p className="text-slate-600">
                          <span className="font-medium">Members:</span> {joinFamilyDetails.members?.length ?? 0}
                        </p>
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        <ul className="space-y-2">
                          {joinFamilyDetails.members?.map((member, index) => (
                            <li key={index} className="flex justify-between text-sm">
                              <span className="text-slate-800">{member.userId.username}</span>
                              <span className="text-slate-500">
                                {new Date(member.joinedAt).toLocaleDateString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">
                      Once we, verify the code, you will be able to see the 
                      family members and the family name, before joining..
                    </p>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FamilyAdd;