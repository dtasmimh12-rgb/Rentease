import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Chat, UserProfile } from '../types';
import { Link } from 'react-router-dom';
import { MessageSquare, ChevronRight, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ChatList() {
  const { user } = useAuth();
  const [chats, setChats] = useState<(Chat & { otherUser?: UserProfile })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatData = await Promise.all(snapshot.docs.map(async (chatDoc) => {
        const data = { id: chatDoc.id, ...chatDoc.data() } as Chat;
        const otherUserId = data.participants.find(p => p !== user.uid);
        if (otherUserId) {
          const userSnap = await getDoc(doc(db, 'users', otherUserId));
          if (userSnap.exists()) {
            return { ...data, otherUser: userSnap.data() as UserProfile };
          }
        }
        return data;
      }));
      setChats(chatData);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 mt-1">Chat with property owners and tenants</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : chats.length > 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          {chats.map((chat) => (
            <Link
              key={chat.id}
              to={`/chat/${chat.id}`}
              className="flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors group"
            >
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl flex-shrink-0">
                {chat.otherUser?.name[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-900 truncate">{chat.otherUser?.name || 'Unknown User'}</h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {chat.lastMessageAt ? formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: true }) : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate line-clamp-1">
                  {chat.lastMessage || 'No messages yet'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No messages yet</h3>
          <p className="text-gray-500 mt-2">Start a conversation from a property listing.</p>
        </div>
      )}
    </div>
  );
}
