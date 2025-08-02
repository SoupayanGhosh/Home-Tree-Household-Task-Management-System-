"use client"

import React from 'react'
import {useSession, signOut } from 'next-auth/react'
import {User} from 'next-auth'
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { LogInIcon, LogOutIcon, Home } from 'lucide-react'
import Link from 'next/link'

export function SiteHeader() {
  const {data: session} = useSession()
  const user: User = session?.user as User 

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Welcome to your dashboard, {session ? user.username : "User"}.</h1>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/">
            <Button variant="outline" className="hidden sm:flex">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>
        {
          session ? (
            <Button variant="default" className="hidden sm:flex" onClick={() => signOut()}>
              <LogOutIcon className="w-4 h-4" />
              Logout
            </Button>
          ) : (
            <Link href="/dashboard">
              <Button variant="outline" className="hidden sm:flex">
                <LogInIcon className="w-4 h-4" />
                Login
              </Button>
            </Link>
          )
        }
        </div>
      </div>
    </header>
  )
}
