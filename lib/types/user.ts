import type { Timestamp } from 'firebase/firestore'

// Two real roles only. Owning a business is NOT a role — it is a resource
// associated with the user (see `businessIds`). A user who registers a business
// stays a 'user'; "business owner" is derived from `businessIds.length > 0`.
export type UserRole = 'user' | 'admin'

export interface UserNotificationSettings {
  email: boolean; whatsapp: boolean; push: boolean
  newReviews: boolean; newMessages: boolean; promotions: boolean
}

export interface AppUser {
  id: string; email: string; displayName: string; photoURL: string
  phone: string; bio: string; location: string; role: UserRole
  businessIds: string[]; favoriteIds: string[]
  postCount: number; reviewCount: number; reputation: number
  notifications: UserNotificationSettings
  isVerified: boolean; isBanned: boolean; banReason: string
  createdAt: Timestamp; lastSeen: Timestamp
}
