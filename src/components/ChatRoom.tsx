import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Message, UserProfile, Chat, Property } from '../types';
import { Send, ChevronLeft, Info, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export default function ChatRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !user) return;

    const fetchChatInfo = async () => {
      const chatSnap = await getDoc(doc(db, 'chats', id));
      if (chatSnap.exists()) {
        const chatData = { id: chatSnap.id, ...chatSnap.data() } as Chat;
        setChat(chatData);
        
        const otherUserId = chatData.participants.find(p => p !== user.uid);
        if (otherUserId) {
          const userSnap = await getDoc(doc(db, 'users', otherUserId));
          if (userSnap.exists()) setOtherUser(userSnap.data() as UserProfile);
        }

        if (chatData.propertyId) {
          const propSnap = await getDoc(doc(db, 'properties', chatData.propertyId));
          if (propSnap.exists()) setProperty({ id: propSnap.id, ...propSnap.data() } as Property);
        }
      }
    };

    fetchChatInfo();

    const q = query(
      collection(db, `chats/${id}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `chats/${id}/messages`);
    });

    return unsubscribe;
  }, [id, user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !id || !user) return;

    const text = inputText;
    setInputText('');

    await addDoc(collection(db, `chats/${id}/messages`), {
      chatId: id,
      senderId: user.uid,
      text,
      createdAt: new Date().toISOString(),
    });

    await updateDoc(doc(db, 'chats', id), {
      lastMessage: text,
      lastMessageAt: new Date().toISOString(),
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-64px)] bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <button onClick={() => navigate('/chats')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
          {otherUser?.name[0] || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{otherUser?.name || 'Loading...'}</h3>
          <p className="text-xs text-gray-500 truncate">{property?.title || 'Property Inquiry'}</p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Info className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {property && (
          <div className="flex justify-center mb-8">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 max-w-xs">
              <img src={property.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">{property.title}</p>
                <p className="text-[10px] text-blue-600 font-bold">${property.price}/mo</p>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.senderId === user?.uid;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: isMe ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                  isMe 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                }`}
              >
                <p>{msg.text}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                  {format(new Date(msg.createdAt), 'HH:mm')}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-100"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
