import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Property, Favorite } from '../types';
import PropertyCard from './PropertyCard';
import { Search, SlidersHorizontal, MapPin, DollarSign, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TenantFeed() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [priceRange, setPriceRange] = useState(10000);

  useEffect(() => {
    const q = query(collection(db, 'properties'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      setProperties(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `users/${user.uid}/favorites`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFavorites(snapshot.docs.map(doc => doc.data().propertyId));
    });
    return unsubscribe;
  }, [user]);

  const toggleFavorite = async (propertyId: string) => {
    if (!user) return;
    const favId = propertyId; // Simplified ID
    if (favorites.includes(propertyId)) {
      await deleteDoc(doc(db, `users/${user.uid}/favorites`, favId));
    } else {
      await setDoc(doc(db, `users/${user.uid}/favorites`, favId), {
        userId: user.uid,
        propertyId,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || p.type === filterType;
    const matchesPrice = p.price <= priceRange;
    return matchesSearch && matchesType && matchesPrice;
  });

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Find Your Next Home</h1>
          <p className="text-gray-500 mt-1">Explore thousands of rental properties</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by location or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {['All', 'Apartment', 'House', 'Studio', 'Villa'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-6 py-3 rounded-2xl font-semibold whitespace-nowrap transition-all ${
                  filterType === type 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-sm font-semibold text-gray-700">
              <span>Max Price</span>
              <span className="text-blue-600">${priceRange.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <SlidersHorizontal className="w-4 h-4" />
            <span>{filteredProperties.length} properties found</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorite={favorites.includes(property.id)}
                onToggleFavorite={() => toggleFavorite(property.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No properties found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
