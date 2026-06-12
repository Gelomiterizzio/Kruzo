import type { Timestamp } from 'firebase/firestore'

export type NotificationType = 'review' | 'business_approved' | 'system'

/** In-app notification, created by Cloud Functions under users/{uid}/notifications. */
export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  businessId?: string
  read: boolean
  createdAt: Timestamp
}
