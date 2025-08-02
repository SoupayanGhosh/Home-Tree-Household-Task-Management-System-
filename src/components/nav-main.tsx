"use client"

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const [familyName, setFamilyName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFamily = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/family");
        if (res.ok) {
          const data = await res.json();
          setFamilyName(data.name);
        } else if (res.status === 404) {
          setFamilyName(null);
        }
      } catch {
        setFamilyName(null);
      } finally {
        setLoading(false);
      }
    };
    fetchFamily();
  }, []);

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            {loading ? (
              <div className="rounded-sm bg-primary text-primary-foreground min-w-8 px-3 py-2 animate-pulse">
                <span>...</span>
              </div>
            ) : familyName ? (
              <div className="rounded-sm bg-primary text-primary-foreground min-w-8 px-3 py-2">
                <span>{familyName}</span>
              </div>
            ) : (
              <SidebarMenuButton
                asChild
                tooltip="Create Family"
                className="rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              >
                <Link href="/family/familycreate">
                  <IconCirclePlusFilled />
                  <span>Create/Join Family</span>
                </Link>
              </SidebarMenuButton>
            )}
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.url && item.url !== "#" ? (
                <SidebarMenuButton asChild tooltip={item.title}>
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
