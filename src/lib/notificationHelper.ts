import NotificationModel from '@/model/Notification';
import { Types } from 'mongoose';

export interface CreateNotificationParams {
  userId: string;
  type: 'message' | 'grocery' | 'medicine' | 'bill' | 'task';
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
  relatedId?: string;
  billType?: string; // <-- add this
  dueDate?: Date | string;
  deletedAt?: Date | null;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await NotificationModel.create({
      userId: new Types.ObjectId(params.userId),
      type: params.type,
      title: params.title,
      message: params.message,
      priority: params.priority || 'medium',
      relatedId: params.relatedId ? new Types.ObjectId(params.relatedId) : undefined,
      isRead: false,
      createdAt: new Date(),
      ...(params.billType ? { billType: params.billType } : {}), // <-- add this
      ...(params.dueDate ? { dueDate: params.dueDate } : {}),
      ...(params.deletedAt !== undefined ? { deletedAt: params.deletedAt } : {})
    });

    return { success: true, notification };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
}

export async function sendBrowserNotification(title: string, options?: NotificationOptions) {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, options);
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, options);
      }
    }
  }
}

export async function createNotificationWithBrowserAlert(params: CreateNotificationParams) {
  const result = await createNotification(params);
  
  if (result.success) {
    // Send browser notification
    await sendBrowserNotification(params.title, {
      body: params.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: params.type,
      requireInteraction: params.priority === 'high'
    });
  }
  
  return result;
} 