import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Property, UserProfile } from '../types';
import { MapPin, DollarSign, Calendar, User, MessageSquare, Phone, ChevronLeft, Share2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchProperty = async () => {
      const docSnap = await getDoc(doc(db, 'properties', id));
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as Property;
        setProperty(data);
        const ownerSnap = await getDoc(doc(db, 'users', data.ownerId));
        if (ownerSnap.exists()) {
          setOwner(ownerSnap.data() as UserProfile);
        }
      }
      setLoading(false);
    };
    fetchProperty();
  }, [id]);

  const startChat = async () => {
    if (!user || !property || !owner) return;
    
    // Check if chat already exists
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      where('propertyId', '==', property.id)
    );
    const querySnapshot = await getDocs(q);
    let chatId = '';
    
    const existingChat = querySnapshot.docs.find(doc => 
      doc.data().participants.includes(owner.uid)
    );

    if (existingChat) {
      chatId = existingChat.id;
    } else {
      const newChat = await addDoc(collection(db, 'chats'), {
        participants: [user.uid, owner.uid],
        propertyId: property.id,
        lastMessage: 'Started a conversation',
        lastMessageAt: new Date().toISOString(),
      });
      chatId = newChat.id;
    }
    
    navigate(`/chat/${chatId}`);
  };

  if (loading) return <div className="animate-pulse h-screen bg-gray-50"></div>;
  if (!property) return <div className="text-center py-20">Property not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 md:pb-8">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
            <img
              src={property.images[0] || `https://picsum.photos/seed/${property.id}/800/600`}
              alt={property.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {property.images.slice(1, 4).map((img, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-md">
                <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider">
              {property.type}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{property.title}</h1>
            <div className="flex items-center text-gray-500">
              <MapPin className="w-5 h-5 mr-1 text-blue-500" />
              <span className="text-lg">{property.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 bg-blue-50 rounded-3xl border border-blue-100">
            <div className="space-y-1">
              <p className="text-sm text-blue-600 font-semibold uppercase tracking-wider">Monthly Rent</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-blue-700">${property.price.toLocaleString()}</span>
                <span className="text-blue-500">/month</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Available From</p>
              <p className="font-semibold text-gray-900">Immediately</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Description</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{property.description}</p>
          </div>

          {owner && (
            <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                  {owner.name[0]}
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Listed by</p>
                  <p className="text-lg font-bold text-gray-900">{owner.name}</p>
                </div>
              </div>
              
              {profile?.role === 'tenant' && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={startChat}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Message
                  </button>
                  <a
                    href={`tel:+1234567890`}
                    className="flex items-center justify-center gap-2 bg-green-50 text-green-600 py-4 rounded-2xl font-bold hover:bg-green-100 transition-all border border-green-100"
                  >
                    <Phone className="w-5 h-5" />
                    Call
                  </a>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
