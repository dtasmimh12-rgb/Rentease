import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, increment } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Property, UserProfile } from '../types';
import { MapPin, DollarSign, Calendar, User, MessageSquare, Phone, ChevronLeft, Share2, CheckCircle, Star, ShieldCheck, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitLoading, setVisitLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProperty = async () => {
      const docRef = doc(db, 'properties', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as Property;
        setProperty(data);
        
        // Increment views
        await updateDoc(docRef, { views: increment(1) });

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
    
    // Increment clicks
    await updateDoc(doc(db, 'properties', property.id), { clicks: increment(1) });

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

  const scheduleVisit = async () => {
    if (!user || !property || !owner || !visitDate) return;
    setVisitLoading(true);
    try {
      await addDoc(collection(db, 'visits'), {
        propertyId: property.id,
        tenantId: user.uid,
        landlordId: owner.uid,
        scheduledAt: new Date(visitDate).toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      setShowVisitModal(false);
      alert('Visit request sent successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'visits');
    } finally {
      setVisitLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse h-screen bg-gray-50"></div>;
  if (!property) return <div className="text-center py-20">Property not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 md:pb-8">
      <div className="flex items-center justify-between px-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
            <img
              src={property.images[0] || `https://picsum.photos/seed/${property.id}/800/600`}
              alt={property.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {property.isFeatured && (
              <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-lg">
                <Star className="w-3 h-3 fill-current" /> Featured
              </div>
            )}
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
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                {property.type}
              </span>
              <span className={cn(
                "px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider",
                property.status === 'available' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
              )}>
                {property.status}
              </span>
            </div>
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
              <p className="text-sm text-gray-500">Listed On</p>
              <p className="font-semibold text-gray-900">{new Date(property.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {property.amenities?.map((amenity, i) => (
                <span key={i} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" /> {amenity}
                </span>
              )) || <p className="text-gray-400 italic">No amenities listed</p>}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Description</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{property.description}</p>
          </div>

          {owner && (
            <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl relative">
                    {owner.name[0]}
                    {owner.verified && (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                        <ShieldCheck className="w-5 h-5 text-blue-500" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Listed by</p>
                    <div className="flex items-center gap-1">
                      <p className="text-lg font-bold text-gray-900">{owner.name}</p>
                      {owner.verified && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">Verified</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold">4.8</span>
                </div>
              </div>
              
              {profile?.role === 'tenant' && (
                <div className="grid grid-cols-1 gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={startChat}
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Message
                    </button>
                    <button
                      onClick={() => setShowVisitModal(true)}
                      className="flex items-center justify-center gap-2 bg-white text-blue-600 border-2 border-blue-600 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all"
                    >
                      <Calendar className="w-5 h-5" />
                      Schedule Visit
                    </button>
                  </div>
                  <a
                    href={`tel:${owner.phone || '+1234567890'}`}
                    className="flex items-center justify-center gap-2 bg-green-50 text-green-600 py-4 rounded-2xl font-bold hover:bg-green-100 transition-all border border-green-100"
                  >
                    <Phone className="w-5 h-5" />
                    Call Owner
                  </a>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Visit Scheduling Modal */}
      <AnimatePresence>
        {showVisitModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Schedule a Visit</h2>
                <button onClick={() => setShowVisitModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <ChevronLeft className="w-6 h-6 rotate-90" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Select Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl flex gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Your request will be sent to the landlord. They will confirm or suggest a different time.
                  </p>
                </div>
                <button
                  onClick={scheduleVisit}
                  disabled={!visitDate || visitLoading}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                >
                  {visitLoading ? 'Sending Request...' : 'Confirm Request'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
