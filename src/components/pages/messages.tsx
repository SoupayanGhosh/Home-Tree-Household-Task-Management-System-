"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, ChevronDown, User, Mail, MailOpen, ChevronRight, ChevronUp, Loader2, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface FamilyMember {
  _id: string;
  username: string;
  email: string;
}

interface Message {
  _id: string;
  content: string;
  createdAt: string;
  status: 'Read' | 'Sent' | 'Completed';
  sender: string;
  senderId: string;
  recipient: string;
  recipientId: string;
}

interface SentMessage {
  id: string;
  text: string;
  recipient: string;
  recipientId: string;
  timestamp: string;
}

const MessageComponent = () => {
  const { data: session } = useSession();
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<FamilyMember | null>(null);
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [deletingMessage, setDeletingMessage] = useState<string | null>(null);

  // Fetch messages and family members
  const fetchMessages = async () => {
    if (!session?.user?._id) return;

    setLoading(true);
    try {
      const response = await fetch('/api/message');
      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        console.log('Messages:', data.messages); // Debug messages specifically
        console.log('Current User ID:', session?.user?._id); // Debug current user
        setReceivedMessages(data.messages || []);
        setFamilyMembers(data.familyMembers || []);
        setFamilyName(data.familyName || '');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Set up polling for new messages every 30 seconds
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, [session?.user?._id]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser || !session?.user?._id) return;

    setSending(true);
    try {
      const response = await fetch('/api/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message,
          recipientId: selectedUser._id,
        }),
      });

      if (response.ok) {
        const newMessage: SentMessage = {
          id: Date.now().toString(),
          text: message,
          recipient: selectedUser.username,
          recipientId: selectedUser._id,
          timestamp: new Date().toLocaleTimeString(),
        };
        setSentMessages(prev => [newMessage, ...prev]);
        setMessage('');
        setSelectedUser(null);
        // Refresh messages to show the new message
        await fetchMessages();
      } else {
        const error = await response.json();
        console.error('Error sending message:', error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleUserSelect = (user: FamilyMember) => {
    setSelectedUser(user);
  };

  const toggleMessageExpansion = async (messageId: string) => {
    setExpandedMessage(expandedMessage === messageId ? null : messageId);

    // Mark message as read when expanded
    const message = receivedMessages.find(msg => msg._id === messageId);
    if (message && message.status === 'Sent') {
      try {
        await fetch('/api/message', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messageId }),
        });

        // Update local state
        setReceivedMessages(msgs =>
          msgs.map(msg =>
            msg._id === messageId ? { ...msg, status: 'Read' as const } : msg
          )
        );
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const handleDeleteMessage = async (messageId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent message expansion when clicking delete

    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    setDeletingMessage(messageId);
    try {
      const response = await fetch('/api/message', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId }),
      });

      if (response.ok) {
        // Remove message from local state
        setReceivedMessages(msgs => msgs.filter(msg => msg._id !== messageId));
        // Close expanded message if it was the deleted one
        if (expandedMessage === messageId) {
          setExpandedMessage(null);
        }
      } else {
        const error = await response.json();
        console.error('Error deleting message:', error);
        alert('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    } finally {
      setDeletingMessage(null);
    }
  };

  const unreadCount = receivedMessages.filter(msg => msg.status === 'Sent').length;

  // Filter messages for current user
  const currentUserId = session?.user?._id;
  const myReceivedMessages = receivedMessages.filter(msg => msg.recipientId?.toString() === currentUserId?.toString());
  const mySentMessages = receivedMessages.filter(msg => msg.senderId?.toString() === currentUserId?.toString());

  // Debug logging
  console.log('All Messages:', receivedMessages);
  console.log('My Received Messages:', myReceivedMessages);
  console.log('My Sent Messages:', mySentMessages);

  if (!session?.user?._id) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6 bg-slate-50 min-h-screen">
        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6">
            <p className="text-center text-slate-600">Please sign in to view messages</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Send Message Card */}
      <Card className="shadow-lg border-slate-200 overflow-hidden p-0">
        <CardHeader className="bg-slate-800 text-white p-4 border-b-0 rounded-t-lg">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Message
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message" className="text-slate-700 font-medium">
              Message
            </Label>
            <textarea
              id="message"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full min-h-[120px] p-3 border border-slate-300 rounded-md focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none resize-y transition-colors"
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            />
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Label className="text-slate-700 font-medium mb-2 block">
                Send to
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors"
                    disabled={familyMembers.length === 0}
                  >
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-500" />
                      {selectedUser ? selectedUser.username : 'Select member'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full min-w-[200px]">
                  {familyMembers.length === 0 ? (
                    <DropdownMenuItem disabled>
                      No family members found
                    </DropdownMenuItem>
                  ) : (
                    familyMembers
                      .filter(member => member._id?.toString() !== currentUserId?.toString())
                      .map((member) => (
                        <DropdownMenuItem
                          key={member._id}
                          onClick={() => handleUserSelect(member)}
                          className="cursor-pointer hover:bg-slate-100 focus:bg-slate-100"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{member.username}</span>
                            <span className="text-sm text-slate-500">{member.email}</span>
                          </div>
                        </DropdownMenuItem>
                      ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || !selectedUser || sending}
              className="bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white px-6 py-2 shadow-sm transition-colors"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Received Messages Card */}
      <Card className="shadow-lg border-slate-200 overflow-hidden p-0">
        <CardHeader className="bg-slate-800 text-white p-4 border-b-0 rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Received Messages
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {myReceivedMessages.length === 0 ? (
                <div className="text-slate-500 text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  <Mail className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                  <p>No messages received yet</p>
                </div>
              ) : (
                myReceivedMessages.map((msg) => (
                  <div key={msg._id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                    <div
                      className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${msg.status === 'Sent' ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'bg-white'
                        }`}
                      onClick={() => toggleMessageExpansion(msg._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {msg.status === 'Read' ? (
                              <MailOpen className="h-4 w-4 text-slate-400" />
                            ) : (
                              <Mail className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`font-medium ${msg.status === 'Sent' ? 'text-slate-900' : 'text-slate-700'}`}>
                              From: {msg.sender}
                            </p>
                            <p className={`text-sm ${msg.status === 'Sent' ? 'text-slate-600' : 'text-slate-500'}`}>
                              {new Date(msg.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {msg.status === 'Sent' && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <button
                            onClick={(e) => handleDeleteMessage(msg._id, e)}
                            disabled={deletingMessage === msg._id}
                            className="p-1 hover:bg-red-100 hover:text-red-600 rounded transition-colors disabled:opacity-50"
                            title="Delete message"
                          >
                            {deletingMessage === msg._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                            )}
                          </button>
                          {expandedMessage === msg._id ? (
                            <ChevronUp className="h-4 w-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {expandedMessage !== msg._id && (
                        <p className={`text-sm mt-2 truncate ${msg.status === 'Sent' ? 'text-slate-700' : 'text-slate-500'}`}>
                          {msg.content}
                        </p>
                      )}
                    </div>

                    {expandedMessage === msg._id && (
                      <div className="px-4 pb-4 bg-slate-50 border-t border-slate-200">
                        <p className="text-slate-700 pt-3 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sent Messages Card */}
      {mySentMessages.length > 0 && (
        <Card className="shadow-lg border-slate-200 overflow-hidden p-0">
        <CardHeader className="bg-slate-800 text-white p-4 border-b-0 rounded-t-lg">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Message
            </CardTitle>
          </div>
        </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {mySentMessages.map((msg) => (
                <div
                  key={msg._id}
                  className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-slate-800">To: {msg.recipient}</span>
                    <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{msg.content}</p>
                  <div className="mt-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${msg.status === 'Read'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                      {msg.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};


export default MessageComponent;