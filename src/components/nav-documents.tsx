"use client"
import { useState, useEffect } from "react"
import {
  IconDots,
  IconFolder,
  IconShare3,
  IconTrash,
  type Icon,
} from "@tabler/icons-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface FolderData {
  name: string
  url: string | null
  type: 'docsFolder' | 'videosFolder' | 'photosFolder'
}

export function NavDocuments() {
  const { isMobile } = useSidebar()
  const { toast } = useToast()
  const [folders, setFolders] = useState<FolderData[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<FolderData | null>(null)
  const [folderUrl, setFolderUrl] = useState("")

  // Initialize folder data
  useEffect(() => {
    const defaultFolders: FolderData[] = [
      {
        name: "Documents",
        url: null,
        type: 'docsFolder'
      },
      {
        name: "Videos", 
        url: null,
        type: 'videosFolder'
      },
      {
        name: "Photos",
        url: null,
        type: 'photosFolder'
      }
    ]
    setFolders(defaultFolders)
    fetchFolderData()
  }, [])

  const fetchFolderData = async () => {
    try {
      const response = await fetch("/api/family")
      if (response.ok) {
        const data = await response.json()
        setFolders(prev => prev.map(folder => ({
          ...folder,
          url: data[folder.type] || null
        })))
      }
    } catch (error) {
      console.error("Failed to fetch folder data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddLink = (folder: FolderData) => {
    setEditingFolder(folder)
    setFolderUrl(folder.url || "")
    setIsDialogOpen(true)
  }

  const handleSaveLink = async () => {
    if (!editingFolder) return

    try {
      const response = await fetch("/api/family/folders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderType: editingFolder.type,
          folderUrl: folderUrl.trim() || null
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update folder link")
      }

      // Update local state
      setFolders(prev => prev.map(folder => 
        folder.type === editingFolder.type 
          ? { ...folder, url: folderUrl.trim() || null }
          : folder
      ))

      toast({
        title: "Success",
        description: folderUrl.trim() 
          ? "Folder link added successfully" 
          : "Folder link removed successfully",
      })

      setIsDialogOpen(false)
      setEditingFolder(null)
      setFolderUrl("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update folder link",
        variant: "destructive",
      })
    }
  }

  const handleDeleteLink = async (folder: FolderData) => {
    if (!folder.url) return

    try {
      const response = await fetch("/api/family/folders", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderType: folder.type
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete folder link")
      }

      // Update local state
      setFolders(prev => prev.map(f => 
        f.type === folder.type ? { ...f, url: null } : f
      ))

      toast({
        title: "Success",
        description: "Folder link removed successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove folder link",
        variant: "destructive",
      })
    }
  }

  const handleOpenFolder = (folder: FolderData) => {
    if (folder.url) {
      window.open(folder.url, '_blank')
    }
  }

  if (loading) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Media</SidebarGroupLabel>
        <div className="p-4 text-sm text-muted-foreground">Loading...</div>
      </SidebarGroup>
    )
  }

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Media</SidebarGroupLabel>
        <SidebarMenu>
          {folders.map((folder) => (
            <SidebarMenuItem key={folder.name}>
              <SidebarMenuButton 
                asChild={!!folder.url}
                onClick={folder.url ? undefined : () => handleAddLink(folder)}
                className={!folder.url ? "cursor-pointer" : ""}
              >
                {folder.url ? (
                  <a href={folder.url} target="_blank" rel="noopener noreferrer">
                    <span>{folder.name}</span>
                  </a>
                ) : (
                  <div>
                    <span>{folder.name}</span>
                  </div>
                )}
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction
                    showOnHover
                    className="data-[state=open]:bg-accent rounded-sm"
                  >
                    <IconDots />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-24 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  {folder.url && (
                    <DropdownMenuItem onClick={() => handleOpenFolder(folder)}>
                      <IconFolder />
                      <span>Open Folder</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleAddLink(folder)}>
                    <IconShare3 />
                    <span>{folder.url ? "Edit Link" : "Add Link"}</span>
                  </DropdownMenuItem>
                  {folder.url && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        variant="destructive"
                        onClick={() => handleDeleteLink(folder)}
                      >
                        <IconTrash />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFolder?.url ? "Edit" : "Add"} {editingFolder?.name} Folder Link
            </DialogTitle>
            <DialogDescription>
              Enter the Google Drive shareable folder link for {editingFolder?.name.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-url">Google Drive Folder URL</Label>
              <Input
                id="folder-url"
                placeholder="https://drive.google.com/drive/folders/..."
                value={folderUrl}
                onChange={(e) => setFolderUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLink}>
              {editingFolder?.url ? "Update" : "Add"} Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
