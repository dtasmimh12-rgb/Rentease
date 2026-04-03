import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Property } from '../types';
import PropertyCard from './PropertyCard';
import { Heart, Search } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

export default function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `users/${user.uid}/favorites`));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const favData = await Promise.all(snapshot.docs.map(async (favDoc) => {
        const propertyId = favDoc.data().propertyId;
        const propSnap = await getDoc(doc(db, 'properties', propertyId));
        if (propSnap.exists()) {
          return { id: propSnap.id, ...propSnap.data() } as Property;
        }
        return null;
      }));
      setFavorites(favData.filter(p => p !== null) as Property[]);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/favorites`);
    });
    return unsubscribe;
  }, [user]);

  const removeFavorite = async (propertyId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/favorites`, propertyId));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Favorites</h1>
        <p className="text-gray-500 mt-1">Your saved rental properties</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {favorites.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorite={true}
                onToggleFavorite={() => removeFavorite(property.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No favorites yet</h3>
          <p className="text-gray-500 mt-2">Save properties you like to view them later.</p>
        </div>
      )}
    </div>
  );
}
