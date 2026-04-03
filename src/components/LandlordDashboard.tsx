import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Property } from '../types';
import PropertyCard from './PropertyCard';
import PropertyForm from './PropertyForm';
import { Plus, Home, Eye, MousePointer2, Building2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LandlordDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'properties'), where('ownerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      setProperties(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'properties');
    });
    return unsubscribe;
  }, [user]);

  const handleCreate = async (data: Partial<Property>) => {
    if (!user) return;
    await addDoc(collection(db, 'properties'), {
      ...data,
      ownerId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      clicks: 0,
      isFeatured: false,
    });
  };

  const handleUpdate = async (data: Partial<Property>) => {
    if (!editingProperty) return;
    await updateDoc(doc(db, 'properties', editingProperty.id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      await deleteDoc(doc(db, 'properties', id));
    }
  };

  const handleBoost = async (propertyId: string, currentFeatured: boolean) => {
    try {
      await updateDoc(doc(db, 'properties', propertyId), {
        isFeatured: !currentFeatured,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `properties/${propertyId}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Landlord Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage and track your rental properties</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus className="w-5 h-5" />
          Add Property
        </button>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Listings', value: properties.length, icon: Building2, color: 'blue' },
          { label: 'Total Views', value: properties.reduce((acc, p) => acc + (p.views || 0), 0), icon: Eye, color: 'purple' },
          { label: 'Total Clicks', value: properties.reduce((acc, p) => acc + (p.clicks || 0), 0), icon: MousePointer2, color: 'amber' },
          { label: 'Active Chats', value: '5', icon: MessageSquare, color: 'green' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center mb-4`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
            </div>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isOwner={true}
                onDelete={() => handleDelete(property.id)}
                onEdit={() => {
                  setEditingProperty(property);
                  setShowForm(true);
                }}
                onBoost={() => handleBoost(property.id, property.isFeatured)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No properties yet</h3>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto">
            Start by adding your first rental property to attract tenants.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 text-blue-600 font-semibold hover:underline"
          >
            Create your first listing
          </button>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <PropertyForm
            initialData={editingProperty || undefined}
            onSubmit={editingProperty ? handleUpdate : handleCreate}
            onClose={() => {
              setShowForm(false);
              setEditingProperty(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
