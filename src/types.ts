export type UserRole = 'landlord' | 'tenant';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  photoURL?: string;
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
  createdAt: string;
  updatedAt: string;
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
