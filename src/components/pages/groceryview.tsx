"use client"
import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User } from 'next-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, List, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  completed: boolean;
}

interface GroceryList {
  _id: string;
  creator: string;
  recipients: string[];
  items: GroceryItem[];
  status: 'active' | 'completed';
}

export default function GroceryPage() {
  const { data: session } = useSession();
  const user: User = session?.user as User;
  
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const [currentItem, setCurrentItem] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState('1');
  const [currentUnit, setCurrentUnit] = useState('pcs');
  const [isLoading, setIsLoading] = useState(true);
  const [familyMembers, setFamilyMembers] = useState<{id: string, name: string, isCreator: boolean}[]>([]);
  const [sending, setSending] = useState(false);

  const units = ['pcs', 'kg', 'g', 'l', 'ml', 'pack'];

  // Fetch family members on mount
  useEffect(() => {
    const fetchFamilyMembers = async () => {
      try {
        const res = await fetch('/api/family');
        if (res.ok) {
          const data = await res.json();
          setFamilyMembers(data.members || []);
        }
      } catch (e) {
        setFamilyMembers([]);
      }
    };
    fetchFamilyMembers();
  }, []);
  // Add this auto-refresh for family members ▼
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/family');
        if (res.ok) {
          const data = await res.json();
          setFamilyMembers(data.members || []);
        }
      } catch (e) {
        console.error('Family members refresh error:', e);
      }
    }, 60 * 1000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  // Fetch active grocery list on component mount
  useEffect(() => {
    const fetchActiveList = async () => {
      try {
        const response = await fetch('/api/grocery');
        if (response.ok) {
          const data = await response.json();
          setGroceryList(data);
        } else {
          setGroceryList(null);
        }
      } catch (error) {
        console.error('Error fetching grocery list:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveList();
  }, []);
  //auto-refresh for grocery list ▼
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/grocery');
        if (response.ok) {
          const data = await response.json();
          setGroceryList(data);
        }
      } catch (error) {
        console.error('Auto-refresh error:', error);
      }
    }, 60 * 1000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  const addItem = async () => {
    if (!currentItem.trim() || !groceryList || groceryList.status !== 'active') return;

    const newItem: GroceryItem = {
      id: Date.now().toString(),
      name: currentItem,
      quantity: parseInt(currentQuantity) || 1,
      unit: currentUnit,
      completed: false
    };

    try {
      const response = await fetch('/api/grocery', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add',
          item: newItem
        }),
      });

      if (response.ok) {
        const updatedList = await response.json();
        setGroceryList(updatedList);
        setCurrentItem('');
        setCurrentQuantity('1');
        setCurrentUnit('pcs');
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const deleteItem = async (id: string) => {
    if (!groceryList) return;

    try {
      const response = await fetch('/api/grocery', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'remove',
          itemId: id
        }),
      });

      if (response.ok) {
        const updatedList = await response.json();
        setGroceryList(updatedList);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const toggleComplete = async (id: string) => {
    if (!groceryList) return;

    try {
      const response = await fetch('/api/grocery', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggle',
          itemId: id
        }),
      });

      if (response.ok) {
        const updatedList = await response.json();
        setGroceryList(updatedList);
      }
    } catch (error) {
      console.error('Error toggling item completion:', error);
    }
  };

  const createList = async () => {
    try {
      const response = await fetch('/api/grocery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const newList = await response.json();
        setGroceryList(newList);
      }
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };



  const completeList = async () => {
    if (!groceryList) return;

    try {
      const response = await fetch('/api/grocery', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'complete'
        }),
      });

      if (response.ok) {
        // After completing, clear the list from state so user can create a new one
        setGroceryList(null);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to complete list');
      }
    } catch (error) {
      console.error('Error completing list:', error);
      alert('Error completing list');
    }
  };

  const sendList = async (recipientId: string) => {
    if (!groceryList || !recipientId) return;
    setSending(true);
    try {
      const response = await fetch('/api/grocery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'share', recipientId }),
      });
      if (response.ok) {
        const updatedList = await response.json();
        setGroceryList(updatedList);
        alert('List shared successfully!');
      } else {
        alert('Failed to share list');
      }
    } catch (error) {
      alert('Error sharing list');
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p>Loading your grocery list...</p>
        </div>
      </div>
    );
  }

  const items = groceryList?.items || [];

  // Filter out the current user from the send list options
  const sendableMembers = familyMembers.filter(member => member.id !== user?._id);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar Area - Placeholder */}
      <div className="h-16 bg-slate-800 border-b border-slate-200">
        <div className="container mx-auto px-4 h-full flex items-center">
          <h1 className="text-xl font-semibold text-white">Grocery List</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Item Addition Area */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Item Name</label>
                  <Input
                    placeholder="Enter item name"
                    value={currentItem}
                    onChange={(e) => setCurrentItem(e.target.value)}
                    className="border-slate-300 focus:border-slate-500"
                    onKeyPress={(e) => e.key === 'Enter' && addItem()}
                    disabled={!groceryList || groceryList.status !== 'active'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Quantity</label>
                    <Input
                      type="number"
                      min="1"
                      value={currentQuantity}
                      onChange={(e) => setCurrentQuantity(e.target.value)}
                      className="border-slate-300 focus:border-slate-500"
                      disabled={!groceryList || groceryList.status !== 'active'}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Unit</label>
                    <Select 
                      value={currentUnit} 
                      onValueChange={setCurrentUnit}
                      disabled={!groceryList || groceryList.status !== 'active'}
                    >
                      <SelectTrigger className="border-slate-300 focus:border-slate-500">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={addItem}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white"
                  disabled={!currentItem.trim() || !groceryList || groceryList.status !== 'active'}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={createList}
                variant="default"
                size="sm"
                className="border-slate-300 text-white"
                disabled={groceryList?.status === 'active'}
              >
                Create
              </Button>
              
              {groceryList?.status === 'active' && groceryList?.creator === user?._id && (
                <Button
                  onClick={completeList}
                  variant="destructive"
                  size="sm"
                  className="hover:black text-white"
                >
                  Close List
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-slate-500"
                    disabled={!groceryList || groceryList.status !== 'active' || sendableMembers.length === 0}
                  >
                    Share List
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Select User</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {sendableMembers.map(member => (
                    <DropdownMenuItem key={member.id} onClick={() => sendList(member.id)} disabled={sending}>
                      {member.name} {member.isCreator ? '(Creator)' : ''}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Middle Section - Active List */}
          <div className="lg:col-span-1">
            <Card className="border-slate-200 h-fit">
              <CardHeader>
                <CardTitle className="text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <List className="w-5 h-5" />
                    Active List ({items.length} items)
                  </span>
                  {items.length > 0 && (
                    <span className="text-sm font-normal text-slate-500">
                      {items.filter(item => item.completed).length} completed
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {items.length > 0 ? (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 ${item.completed ? 'opacity-60' : ''}`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteItem(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                          disabled={groceryList?.status !== 'active'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>

                        <div className="flex-1">
                          <div className={`font-medium text-slate-800 ${item.completed ? 'line-through' : ''}`}>
                            {item.name}
                          </div>
                          <div className="text-sm text-slate-600">
                            {item.quantity} {item.unit}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={item.completed}
                            onCheckedChange={() => toggleComplete(item.id)}
                            className="border-slate-400"
                            disabled={groceryList?.status !== 'active'}
                          />
                          <label className="text-sm text-slate-600">Done</label>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <List className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium mb-1">
                      {groceryList ? 'No items in your list' : 'No active list'}
                    </p>
                    <p className="text-sm">
                      {groceryList ? 'Start adding items to see them here' : 'Create a new list to get started'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Section - Total List View */}
          <div className="lg:col-span-1">
            <Card className="border-slate-200 h-fit">
              <CardHeader>
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Total List View
                </CardTitle>
              </CardHeader>
              <CardContent>
                {items.length > 0 ? (
                  <div className="space-y-4">
                    <div className="prose prose-slate max-w-none">
                      <ul className="space-y-2">
                        {items.map((item) => (
                          <li key={item.id} className="text-slate-700">
                            <span className={`italic ${item.completed ? 'line-through opacity-60' : ''}`}>
                              {item.name} - {item.quantity} {item.unit}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium mb-1">No items in list</p>
                    <p className="text-sm">Add items to see the total list view</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}