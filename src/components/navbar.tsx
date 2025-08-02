"use client"
import Link from 'next/link';
import React, { useState } from 'react';
import { Menu, Home, LayoutDashboard, LogOut, X, User as UserIcon} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useSession, signOut } from 'next-auth/react';
import { User } from 'next-auth'


export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: session } = useSession();
  const user: User = session?.user as User;
  const appName = "Home-Tree";

  const NavItems = ({ mobile = false, onItemClick = () => {}}) => (
    <div className={`flex ${mobile ? 'flex-col space-y-4' : 'items-center space-x-2'}`}>
    <Link href="/">
      <Button 
        variant="ghost" 
        className={`${mobile ? 'justify-start' : ''} text-slate-700 hover:text-slate-900 hover:bg-slate-100`}
      >
        <Home className="w-4 h-4 mr-2" />
        Home
      </Button>
      </Link>
      <Button 
        variant="ghost" 
        className={`${mobile ? 'justify-start' : ''} text-slate-700 hover:text-slate-900 hover:bg-slate-100`}
        onClick={() => signOut()}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );

  return (
    <nav className="border-b border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left section - App name and user info */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-slate-900">{appName}</h1>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-slate-700" />
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:inline">
              {user?.username || 'User'}
            </span>
          </div>
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-2">
          <NavItems />
          
          <Separator orientation="vertical" className="h-6 mx-2" />
          <Link href="/dashboard">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          </Link>
        </div>

        {/* Mobile navigation */}
        <div className="flex md:hidden items-center space-x-2">
        <Link href="/dashboard">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          </Link>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="border-slate-200">
                <Menu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              
              <div className="mt-6">
                {/* User info in mobile menu */}
                <div className="flex items-center space-x-3 mb-6 p-3 rounded-lg bg-slate-50">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{user?.username || 'User'}</p>
                    <p className="text-sm text-slate-500">Welcome back!</p>
                  </div>
                </div>
                
                <Separator className="mb-6" />
                
                <NavItems mobile onItemClick={() => setIsOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}