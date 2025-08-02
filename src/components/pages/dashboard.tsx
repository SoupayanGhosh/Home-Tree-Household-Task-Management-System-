"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  MessageCircle,
  CheckSquare,
  Calendar as CalendarIcon,
  Zap,
  Tv,
  Wifi,
  Receipt,
  Pill,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Plus,
  ChevronRight,
  TrendingUp,
  Activity,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  MailOpenIcon,
  CheckCheck,
} from "lucide-react";
import Link from "next/link";

function displayMedicineTime(time: string | undefined) {
  if (!time) return "Not set";
  // If already contains AM/PM, return as is
  if (/am|pm|AM|PM/.test(time)) return time;
  // Otherwise, convert from 24-hour to 12-hour
  let [hour, minute] = time.split(":");
  let h = parseInt(hour, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h.toString().padStart(2, "0")}:${minute} ${ampm}`;
}

const Dashboard: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState("medium");
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [showEditMedicine, setShowEditMedicine] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<any>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    quantity: "",
    UsePerDay: "",
  });
  const [newTask, setNewTask] = useState({
    title: "",
    tobecompletedBy: "Today",
    priority: "Medium",
  });
  const [newMedicineTime, setNewMedicineTime] = useState("08:00");
  const [newMedicineAMPM, setNewMedicineAMPM] = useState("AM");
  const [editMedicineTime, setEditMedicineTime] = useState("08:00");
  const [editMedicineAMPM, setEditMedicineAMPM] = useState("AM");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [showEditTask, setShowEditTask] = useState(false);
  const [customTaskDate, setCustomTaskDate] = useState("");

  // View All states
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [showAllTodos, setShowAllTodos] = useState(false);
  const [showAllMedicines, setShowAllMedicines] = useState(false);
  const [showAllTasks, setShowAllTasks] = useState(false);

  // Notification functions
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/notifications?notificationId=${notificationId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        fetchDashboardData();
        toast({
          title: "Success",
          description: "Notification deleted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (
    notificationId: string | { toString: () => string }
  ) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationId: notificationId.toString(),
          isRead: true,
        }),
      });
      if (response.ok) {
        fetchDashboardData();
        toast({
          title: "Success",
          description: "Notification marked as read",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard");
      if (response.ok) {
        const data = await response.json();
        console.log("Dashboard data received:", data);
        setDashboardData(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Add this right after - Auto-refresh data every 2 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        fetchDashboardData();
        console.log("Auto-refreshing dashboard data...");
      },
      2 * 60 * 1000
    ); // 2 minutes in milliseconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Todo functions
  const addTodo = async () => {
    if (!newTodoText.trim()) return;

    try {
      const todoData = {
        text: newTodoText,
        priority: newTodoPriority,
      };
      console.log("Sending todo data:", todoData);

      const response = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todoData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Todo creation result:", result);
        setNewTodoText("");
        setNewTodoPriority("medium");
        setShowAddTodo(false);
        fetchDashboardData();
        toast({
          title: "Success",
          description: "Todo added successfully",
        });
      } else {
        const errorData = await response.json();
        console.error("Todo creation failed:", errorData);
        toast({
          title: "Error",
          description: errorData.error || "Failed to add todo",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Todo creation error:", error);
      toast({
        title: "Error",
        description: "Failed to add todo",
        variant: "destructive",
      });
    }
  };

  const toggleTodo = async (todoId: string) => {
    try {
      console.log("Toggling todo with ID:", todoId);
      console.log("All todos in dashboardData:", dashboardData.todos);
      const todo = dashboardData.todos.find((t: any) => t.id === todoId);
      console.log("Found todo:", todo);

      if (!todo) {
        console.error("Todo not found for ID:", todoId);
        console.log(
          "Available todo IDs:",
          dashboardData.todos.map((t: any) => t.id)
        );
        return;
      }

      const updateData = {
        todoId,
        updates: { completed: !todo.completed },
      };
      console.log("Sending update data:", updateData);

      const response = await fetch("/api/dashboard", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        console.log("Todo toggle successful");
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        console.error("Todo toggle failed:", errorData);
        toast({
          title: "Error",
          description: errorData.error || "Failed to update todo",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Todo toggle error:", error);
      toast({
        title: "Error",
        description: "Failed to update todo",
        variant: "destructive",
      });
    }
  };

  const deleteTodo = async (todoId: string) => {
    try {
      const response = await fetch(`/api/dashboard?todoId=${todoId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchDashboardData();
        toast({
          title: "Success",
          description: "Todo deleted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete todo",
        variant: "destructive",
      });
    }
  };

  // Medicine functions
  const addMedicine = async () => {
    if (!newMedicine.name || !newMedicine.quantity || !newMedicine.UsePerDay)
      return;

    try {
      const response = await fetch("/api/medicine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newMedicine,
          time: newMedicineTime,
        }),
      });

      if (response.ok) {
        setNewMedicine({ name: "", quantity: "", UsePerDay: "" });
        setNewMedicineTime("08:00");
        setShowAddMedicine(false);
        fetchDashboardData();
        toast({
          title: "Success",
          description: "Medicine added successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add medicine",
        variant: "destructive",
      });
    }
  };

  const editMedicine = async () => {
    console.log("Editing medicine:", editingMedicine); // Debug log
    if (
      !editingMedicine ||
      !editingMedicine.name ||
      !editingMedicine.quantity ||
      !editingMedicine.UsePerDay
    ) {
      console.log("Missing required fields:", { editingMedicine });
      return;
    }

    try {
      const updateData = {
        medicineId: editingMedicine.id,
        updates: {
          name: editingMedicine.name,
          quantity: Number(editingMedicine.quantity),
          UsePerDay: Number(editingMedicine.UsePerDay),
        },
      };
      console.log("Sending update data:", updateData);

      const response = await fetch("/api/medicine", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setEditingMedicine(null);
        setShowEditMedicine(false);
        fetchDashboardData();
        toast({
          title: "Success",
          description: "Medicine updated successfully",
        });
      } else {
        const errorData = await response.json();
        console.error("Medicine update failed:", errorData);
        toast({
          title: "Error",
          description: errorData.error || "Failed to update medicine",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Medicine update error:", error);
      toast({
        title: "Error",
        description: "Failed to update medicine",
        variant: "destructive",
      });
    }
  };

  const openEditMedicine = (medicine: any) => {
    console.log("Opening edit medicine:", medicine); // Debug log
    setEditingMedicine({
      ...medicine,
      id: medicine.id || medicine._id?.toString(),
      quantity: medicine.totalStock.toString(),
      UsePerDay: medicine.dosage ? medicine.dosage.split(" ")[0] : "1",
      time: medicine.time ? medicine.time : "08:00",
    });
    setEditMedicineTime(medicine.time ? medicine.time : "08:00");
    setEditMedicineAMPM(medicine.time ? medicine.time.split(" ")[1] : "AM");
    setShowEditMedicine(true);
  };

  // Medicine delete function
  const deleteMedicine = async (medicineId: string) => {
    try {
      const response = await fetch(`/api/medicine?medicineId=${medicineId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchDashboardData();
        toast({
          title: "Success",
          description: "Medicine deleted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete medicine",
        variant: "destructive",
      });
    }
  };

  // Family task functions
  const addFamilyTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      const response = await fetch("/api/family/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        setNewTask({ title: "", tobecompletedBy: "Today", priority: "Medium" });
        setShowAddTask(false);
        fetchDashboardData();
        toast({
          title: "Success",
          description: "Family task added successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add family task",
        variant: "destructive",
      });
    }
  };

  // Handler to delete a family task
  const deleteFamilyTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/family/tasks?taskId=${taskId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchDashboardData();
        toast({
          title: "Success",
          description: "Task deleted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  // Handler to open edit dialog for a task
  const openEditTask = (task: any) => {
    setEditingTask({ ...task });
    setShowEditTask(true);
  };

  // Handler to update a family task
  const editFamilyTask = async () => {
    if (!editingTask) return;

    try {
      // Prepare the due date based on the completion type
      let dueDate;
      if (editingTask.tobecompletedBy === "Today") {
        dueDate = new Date();
      } else if (editingTask.tobecompletedBy === "Tomorrow") {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dueDate = tomorrow;
      } else if (customTaskDate) {
        dueDate = new Date(customTaskDate);
      }

      const response = await fetch("/api/family/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: editingTask.id,
          updates: {
            title: editingTask.title,
            priority: editingTask.priority,
            tobecompletedBy: editingTask.tobecompletedBy,
            dueDate: dueDate || undefined,
          },
        }),
      });

      if (response.ok) {
        setShowEditTask(false);
        setEditingTask(null);
        setCustomTaskDate("");
        fetchDashboardData();
        toast({ title: "Success", description: "Task updated successfully" });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to update task",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const {
    notifications = [],
    messages = [],
    todos = [],
    bills = [],
    medicines = [],
    tasks = [],
    stats = {},
  } = dashboardData || {};

  // Debug: Log the todos to see what we're getting
  console.log("Todos in component:", todos);

  const currentDate = new Date();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Top Row - General Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Notifications Card */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Bell className="w-5 h-5 mr-2 text-slate-600" />
              Notifications
            </CardTitle>
            <Badge variant="secondary" className="bg-slate-100 text-slate-600">
              {
                notifications.filter(
                  (n: any) => n.priority === "high" || n.priority === "medium"
                ).length
              }
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {(showAllNotifications
              ? notifications
              : notifications.slice(0, 3)
            ).map((notification: any) => (
              <div
                key={notification.id}
                className="flex items-start space-x-3 p-2 rounded-lg hover:bg-slate-50"
              >
                <div
                  className={`mt-1 ${
                    notification.priority === "high"
                      ? "text-red-500"
                      : notification.priority === "medium"
                        ? "text-amber-500"
                        : "text-blue-500"
                  }`}
                >
                  {notification.priority === "high" ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : notification.priority === "medium" ? (
                    <Bell className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {notification.time}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markNotificationAsRead(notification.id)}
                  className="h-6 w-6 p-0 hover:bg-green-100 hover:text-green-600"
                  title="Mark as read"
                >
                  <CheckCheck className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteNotification(notification.id)}
                  className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                  title="Delete notification"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {notifications.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-slate-600 flex items-center justify-center gap-1"
                onClick={() => setShowAllNotifications(!showAllNotifications)}
              >
                {showAllNotifications ? (
                  <>
                    Show Less <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    View All Notifications <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Messages Card */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-slate-600" />
              <Link href="/message">Messages</Link>
            </CardTitle>
            <Badge variant="secondary" className="bg-slate-100 text-slate-600">
              {messages.length}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {(showAllMessages ? messages : messages.slice(0, 3)).map(
              (message: any) => (
                <div
                  key={message.id}
                  className="flex items-start space-x-3 p-2 rounded-lg hover:bg-slate-50"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-slate-200 text-slate-600 text-sm">
                      {message.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">
                        {message.sender}
                      </p>
                      <p className="text-xs text-slate-500">{message.time}</p>
                    </div>
                    <p className="text-sm text-slate-600 truncate">
                      {message.message}
                    </p>
                  </div>
                </div>
              )
            )}
            {messages.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-slate-600 flex items-center justify-center gap-1"
                onClick={() => setShowAllMessages(!showAllMessages)}
              >
                {showAllMessages ? (
                  <>
                    Show Less <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    View All Messages <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Todo List Card */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center">
              <CheckSquare className="w-5 h-5 mr-2 text-slate-600" />
              Todo List
            </CardTitle>
            <Dialog open={showAddTodo} onOpenChange={setShowAddTodo}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-slate-100"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-3">
                  <DialogTitle className="text-xl font-semibold text-center">
                    Add New Todo
                  </DialogTitle>
                  <Separator />
                </DialogHeader>
                <div className="space-y-6 pt-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="todo-text"
                      className="text-sm font-medium text-slate-700"
                    >
                      Todo Description
                    </Label>
                    <Input
                      id="todo-text"
                      value={newTodoText}
                      onChange={(e) => setNewTodoText(e.target.value)}
                      placeholder="What needs to be done?"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="todo-priority"
                      className="text-sm font-medium text-slate-700"
                    >
                      Priority Level
                    </Label>
                    <Select
                      value={newTodoPriority}
                      onValueChange={setNewTodoPriority}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🟢 Low Priority</SelectItem>
                        <SelectItem value="medium">
                          🟡 Medium Priority
                        </SelectItem>
                        <SelectItem value="high">🔴 High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddTodo(false)}
                      className="flex-1 h-11"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={addTodo}
                      className="flex-1 h-11 bg-slate-900 hover:bg-slate-800"
                    >
                      Add Todo
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-2">
            {todos.length === 0 && (
              <div className="text-center text-slate-500 text-sm py-8">
                <CheckSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium">No todos yet</p>
                <p>Click the + button to add your first task!</p>
              </div>
            )}
            {(showAllTodos ? todos : todos.slice(0, 3)).map((todo: any) => {
              console.log("Rendering todo:", todo); // Debug log
              console.log("Todo text value:", todo.text); // Debug log
              console.log("Todo text type:", typeof todo.text); // Debug log
              return (
                <div
                  key={todo.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50"
                >
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                    className="data-[state=checked]:bg-slate-600 data-[state=checked]:border-slate-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${todo.completed ? "line-through text-slate-400" : "text-slate-900"}`}
                    >
                      {todo.text || "No text available"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        todo.priority === "high"
                          ? "destructive"
                          : todo.priority === "medium"
                            ? "default"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {todo.priority}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTodo(todo.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {todos.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-slate-600 flex items-center justify-center gap-1"
                onClick={() => setShowAllTodos(!showAllTodos)}
              >
                {showAllTodos ? (
                  <>
                    Show Less <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    View All Tasks <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second Row - Calendar and Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Card */}
        <Card className="lg:col-span-2 hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-slate-600" />
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-slate-500"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                // Check if this day has bills due
                const hasBillDue = bills.some((bill: any) => {
                  const billDate = new Date(bill.dueDate);
                  return (
                    billDate.getDate() === day &&
                    billDate.getMonth() === currentDate.getMonth()
                  );
                });

                // Check if this day has tasks due
                const hasTaskDue = tasks.some((task: any) => {
                  if (task.dueDate === "Today" && day === currentDate.getDate())
                    return true;
                  if (
                    task.dueDate === "Tomorrow" &&
                    day === currentDate.getDate() + 1
                  )
                    return true;
                  return false;
                });

                let dayClass =
                  "p-2 text-center text-sm hover:bg-slate-100 rounded cursor-pointer";

                if (day === currentDate.getDate()) {
                  dayClass += " bg-slate-600 text-white";
                } else if (hasBillDue) {
                  dayClass += " bg-red-100 text-red-700 font-medium";
                } else if (hasTaskDue) {
                  dayClass += " bg-blue-100 text-blue-700 font-medium";
                } else {
                  dayClass += " text-slate-700";
                }

                return (
                  <div key={day} className={dayClass}>
                    {day}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 space-y-2">
              {bills.slice(0, 2).map((bill: any) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-2 bg-amber-50 rounded-lg"
                >
                  <span className="text-sm text-amber-800">
                    {bill.name} Bill
                  </span>
                  <span className="text-xs text-amber-600">
                    {new Date(bill.dueDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {tasks.slice(0, 2).map((task: any) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 bg-blue-50 rounded-lg"
                >
                  <span className="text-sm text-blue-800">{task.title}</span>
                  <span className="text-xs text-blue-600">{task.dueDate}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bills Overview */}
        <div className="space-y-4">
          {bills.map((bill: any) => {
            const getBillIcon = (type: string) => {
              switch (type) {
                case "electricity":
                  return Zap;
                case "cable":
                  return Tv;
                case "wifi":
                  return Wifi;
                case "tax":
                  return Receipt;
                default:
                  return Receipt;
              }
            };
            const getBillColor = (status: string) => {
              switch (status) {
                case "paid":
                  return "text-green-600 bg-green-50";
                case "overdue":
                  return "text-red-600 bg-red-50";
                case "due-soon":
                  return "text-amber-600 bg-amber-50";
                default:
                  return "text-blue-600 bg-blue-50";
              }
            };
            const BillIcon = getBillIcon(bill.type);

            return (
              <Card
                key={bill.id}
                className="hover:shadow-md transition-shadow duration-300"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${getBillColor(bill.status)}`}
                      >
                        <BillIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {bill.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Due: {new Date(bill.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-900 flex items-center">
                        <IndianRupee className="w-4 h-4 mr-1 text-black" />
                        {bill.amount}
                      </p>
                      <Badge
                        variant={
                          bill.status === "paid"
                            ? "default"
                            : bill.status === "overdue"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {bill.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Third Row - Medicine and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medicine Card */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Pill className="w-5 h-5 mr-2 text-slate-600" />
              Medicine Stock
            </CardTitle>
            <Dialog open={showAddMedicine} onOpenChange={setShowAddMedicine}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-slate-100"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-3">
                  <DialogTitle className="text-xl font-semibold text-center">
                    Add New Medicine
                  </DialogTitle>
                  <Separator />
                </DialogHeader>
                <div className="space-y-6 pt-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="medicine-name"
                      className="text-sm font-medium text-slate-700"
                    >
                      Medicine Name
                    </Label>
                    <Input
                      id="medicine-name"
                      value={newMedicine.name}
                      onChange={(e) =>
                        setNewMedicine({ ...newMedicine, name: e.target.value })
                      }
                      placeholder="Enter medicine name..."
                      className="h-11"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="medicine-quantity"
                        className="text-sm font-medium text-slate-700"
                      >
                        Total Quantity
                      </Label>
                      <Input
                        id="medicine-quantity"
                        type="number"
                        value={newMedicine.quantity}
                        onChange={(e) =>
                          setNewMedicine({
                            ...newMedicine,
                            quantity: e.target.value,
                          })
                        }
                        placeholder="0"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="medicine-use-per-day"
                        className="text-sm font-medium text-slate-700"
                      >
                        Daily Usage
                      </Label>
                      <Input
                        id="medicine-use-per-day"
                        type="number"
                        value={newMedicine.UsePerDay}
                        onChange={(e) =>
                          setNewMedicine({
                            ...newMedicine,
                            UsePerDay: e.target.value,
                          })
                        }
                        placeholder="0"
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="medicine-time"
                      className="text-sm font-medium text-slate-700"
                    >
                      Reminder Time
                    </Label>
                    <Input
                      id="medicine-time"
                      type="time"
                      value={newMedicineTime}
                      onChange={(e) => setNewMedicineTime(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddMedicine(false)}
                      className="flex-1 h-11"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={addMedicine}
                      className="flex-1 h-11 bg-slate-900 hover:bg-slate-800"
                    >
                      Add Medicine
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Medicine Dialog */}
            <Dialog open={showEditMedicine} onOpenChange={setShowEditMedicine}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-3">
                  <DialogTitle className="text-xl font-semibold text-center">
                    Edit Medicine
                  </DialogTitle>
                  <Separator />
                </DialogHeader>
                <div className="space-y-6 pt-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-medicine-name"
                      className="text-sm font-medium text-slate-700"
                    >
                      Medicine Name
                    </Label>
                    <Input
                      id="edit-medicine-name"
                      value={editingMedicine?.name || ""}
                      onChange={(e) =>
                        setEditingMedicine({
                          ...editingMedicine,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter medicine name..."
                      className="h-11"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-medicine-quantity"
                        className="text-sm font-medium text-slate-700"
                      >
                        Restock Quantity
                      </Label>
                      <Input
                        id="edit-medicine-quantity"
                        type="number"
                        value={editingMedicine?.quantity || ""}
                        onChange={(e) =>
                          setEditingMedicine({
                            ...editingMedicine,
                            quantity: e.target.value,
                          })
                        }
                        placeholder="0"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-medicine-use-per-day"
                        className="text-sm font-medium text-slate-700"
                      >
                        Daily Usage
                      </Label>
                      <Input
                        id="edit-medicine-use-per-day"
                        type="number"
                        value={editingMedicine?.UsePerDay || ""}
                        onChange={(e) =>
                          setEditingMedicine({
                            ...editingMedicine,
                            UsePerDay: e.target.value,
                          })
                        }
                        placeholder="0"
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-medicine-time"
                      className="text-sm font-medium text-slate-700"
                    >
                      Reminder Time
                    </Label>
                    <Input
                      id="edit-medicine-time"
                      type="time"
                      value={editMedicineTime}
                      onChange={(e) => setEditMedicineTime(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowEditMedicine(false)}
                      className="flex-1 h-11"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={editMedicine}
                      className="flex-1 h-11 bg-slate-900 hover:bg-slate-800"
                    >
                      Update Medicine
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4">
            {medicines.length === 0 && (
              <div className="text-center text-slate-500 text-sm py-8">
                <Pill className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium">No medicines yet</p>
                <p>Click the + button to add your first medicine!</p>
              </div>
            )}
            {(showAllMedicines ? medicines : medicines.slice(0, 3)).map(
              (medicine: any) => (
                <div
                  key={medicine.id}
                  className="space-y-2 p-3 border border-slate-200 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {medicine.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {medicine.dosage}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-600">
                            {displayMedicineTime(medicine.time)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditMedicine(medicine)}
                        className="h-6 w-6 p-0 hover:bg-slate-200"
                      >
                        <Edit className="h-3 w-3 text-slate-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMedicine(medicine.id)}
                        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Stock remaining</span>
                      <span className="text-slate-700">
                        {medicine.quantityLeft}/{medicine.quantity}
                      </span>
                    </div>
                    <Progress
                      value={(medicine.quantityLeft / medicine.quantity) * 100}
                      className="h-2"
                    />
                    {medicine.isLowStock && (
                      <p className="text-xs text-amber-600 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Low stock - reorder soon
                      </p>
                    )}
                  </div>
                </div>
              )
            )}
            {medicines.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-slate-600 flex items-center justify-center gap-1"
                onClick={() => setShowAllMedicines(!showAllMedicines)}
              >
                {showAllMedicines ? (
                  <>
                    Show Less <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    View All Medicines <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Tasks Card */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Activity className="w-5 h-5 mr-2 text-slate-600" />
              Family Tasks
            </CardTitle>
            <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-slate-100"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-3">
                  <DialogTitle className="text-xl font-semibold text-center">
                    Add New Family Task
                  </DialogTitle>
                  <Separator />
                </DialogHeader>
                <div className="space-y-6 pt-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="task-title"
                      className="text-sm font-medium text-slate-700"
                    >
                      Task Title
                    </Label>
                    <Input
                      id="task-title"
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                      placeholder="What needs to be done?"
                      className="h-11"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="task-completion"
                        className="text-sm font-medium text-slate-700"
                      >
                        Complete By
                      </Label>
                      <Select
                        value={newTask.tobecompletedBy}
                        onValueChange={(value) =>
                          setNewTask({ ...newTask, tobecompletedBy: value })
                        }
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Today">📅 Today</SelectItem>
                          <SelectItem value="Tomorrow">📅 Tomorrow</SelectItem>
                          <SelectItem value="This Week">
                            📅 This Week
                          </SelectItem>
                          <SelectItem value="This Month">
                            📅 This Month
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="task-priority"
                        className="text-sm font-medium text-slate-700"
                      >
                        Priority
                      </Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value) =>
                          setNewTask({ ...newTask, priority: value })
                        }
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">🟢 Low</SelectItem>
                          <SelectItem value="Medium">🟡 Medium</SelectItem>
                          <SelectItem value="High">🔴 High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {(newTask.tobecompletedBy === "This Week" ||
                    newTask.tobecompletedBy === "This Month") && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="add-task-custom-date"
                        className="text-sm font-medium text-slate-700"
                      >
                        Custom Due Date
                      </Label>
                      <Input
                        id="add-task-custom-date"
                        type="date"
                        value={customTaskDate}
                        onChange={(e) => setCustomTaskDate(e.target.value)}
                        className="h-11"
                      />
                    </div>
                  )}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddTask(false)}
                      className="flex-1 h-11"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={addFamilyTask}
                      className="flex-1 h-11 bg-slate-900 hover:bg-slate-800"
                    >
                      Add Task
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.length === 0 && (
              <div className="text-center text-slate-500 text-sm py-8">
                <Activity className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium">No tasks yet</p>
                <p>Click the + button to add your first family task!</p>
              </div>
            )}
            {(showAllTasks ? tasks : tasks.slice(0, 3)).map((task: any) => {
              const isExpanded = expandedTaskId === task.id;
              return (
                <div
                  key={task.id}
                  className="flex flex-col border border-slate-200 rounded-lg hover:bg-slate-50 mb-2"
                >
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer"
                    onClick={() =>
                      setExpandedTaskId(isExpanded ? null : task.id)
                    }
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {task.title}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-600">
                            {task.assignee}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-600">
                            {task.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          task.priority === "high"
                            ? "destructive"
                            : task.priority === "medium"
                              ? "default"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                      <ChevronRight
                        className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      />
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="flex items-center justify-end space-x-2 px-3 pb-3">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteFamilyTask(task.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
            {tasks.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-3 text-slate-600 flex items-center justify-center gap-1"
                onClick={() => setShowAllTasks(!showAllTasks)}
              >
                {showAllTasks ? (
                  <>
                    Show Less <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    View All Tasks <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Expenses</p>
                <p className="text-2xl font-bold text-slate-900">
                  <span className="inline-block align-middle mr-1">
                    <IndianRupee className="w-6 h-6 inline-block text-green-600" />
                  </span>
                  {stats.totalExpenses || 0}
                </p>
              </div>
              <IndianRupee className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Bills</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.pendingBills || 0}
                </p>
              </div>
              <Receipt className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Tasks Completed</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.completedTasks || 0}/{stats.totalTasks || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Family Members</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.familyMembers || 1}
                </p>
              </div>
              <User className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Family Task Dialog */}
      <Dialog open={showEditTask} onOpenChange={setShowEditTask}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold text-center">
              Edit Family Task
            </DialogTitle>
            <Separator />
          </DialogHeader>
          <div className="space-y-6 pt-2">
            <div className="space-y-2">
              <Label
                htmlFor="edit-task-title"
                className="text-sm font-medium text-slate-700"
              >
                Task Title
              </Label>
              <Input
                id="edit-task-title"
                value={editingTask?.title || ""}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, title: e.target.value })
                }
                placeholder="What needs to be done?"
                className="h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="edit-task-completion"
                  className="text-sm font-medium text-slate-700"
                >
                  Complete By
                </Label>
                <Select
                  value={editingTask?.tobecompletedBy}
                  onValueChange={(value) => {
                    setEditingTask({ ...editingTask, tobecompletedBy: value });
                    setCustomTaskDate("");
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Today">📅 Today</SelectItem>
                    <SelectItem value="Tomorrow">📅 Tomorrow</SelectItem>
                    <SelectItem value="This Week">📅 This Week</SelectItem>
                    <SelectItem value="This Month">📅 This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit-task-priority"
                  className="text-sm font-medium text-slate-700"
                >
                  Priority
                </Label>
                <Select
                  value={editingTask?.priority}
                  onValueChange={(value) =>
                    setEditingTask({ ...editingTask, priority: value })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">🟢 Low</SelectItem>
                    <SelectItem value="Medium">🟡 Medium</SelectItem>
                    <SelectItem value="High">🔴 High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(editingTask?.tobecompletedBy === "This Week" ||
              editingTask?.tobecompletedBy === "This Month") && (
              <div className="space-y-2">
                <Label
                  htmlFor="edit-task-custom-date"
                  className="text-sm font-medium text-slate-700"
                >
                  Custom Due Date
                </Label>
                <Input
                  id="edit-task-custom-date"
                  type="date"
                  value={customTaskDate}
                  onChange={(e) => setCustomTaskDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]} // Don't allow past dates
                  className="h-11"
                />
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditTask(false);
                  setCustomTaskDate("");
                }}
                className="flex-1 h-11"
              >
                Cancel
              </Button>
              <Button
                onClick={editFamilyTask}
                className="flex-1 h-11 bg-slate-900 hover:bg-slate-800"
              >
                Update Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
