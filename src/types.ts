export type UserRole = 'landlord' | 'tenant';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  photoURL?: string;
  phone?: string;
  verified?: boolean;
  searchHistory?: string[];
  createdAt: string;
}

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  type: string;
  amenities: string[];
  isFeatured: boolean;
  status: 'available' | 'rented';
  views: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface Visit {
  id: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  scheduledAt: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  propertyId: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
}
