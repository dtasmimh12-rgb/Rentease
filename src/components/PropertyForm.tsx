import React, { useState } from 'react';
import { Property } from '../types';
import { X, Upload, MapPin, DollarSign, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PropertyFormProps {
  initialData?: Property;
  onSubmit: (data: Partial<Property>) => Promise<void>;
  onClose: () => void;
}

export default function PropertyForm({ initialData, onSubmit, onClose }: PropertyFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    location: initialData?.location || '',
    type: initialData?.type || 'Apartment',
    images: initialData?.images || [],
    amenities: initialData?.amenities || [],
    status: initialData?.status || 'available',
  });
  const [loading, setLoading] = useState(false);
  const [newAmenity, setNewAmenity] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        updatedAt: new Date().toISOString(),
        ...(initialData ? {} : { 
          createdAt: new Date().toISOString(),
          views: 0,
          clicks: 0,
          isFeatured: false 
        })
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? 'Edit Property' : 'List New Property'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Type className="w-4 h-4" /> Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Modern 2-Bedroom Apartment"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Monthly Rent
              </label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="1500"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Location
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Downtown, San Francisco"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                Property Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option>Apartment</option>
                <option>House</option>
                <option>Studio</option>
                <option>Villa</option>
                <option>Condo</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' | 'rented' })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="available">Available</option>
                <option value="rented">Rented</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Amenities</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="WiFi, Parking, Gym..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newAmenity.trim()) {
                      setFormData({ ...formData, amenities: [...formData.amenities, newAmenity.trim()] });
                      setNewAmenity('');
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newAmenity.trim()) {
                    setFormData({ ...formData, amenities: [...formData.amenities, newAmenity.trim()] });
                    setNewAmenity('');
                  }
                }}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.amenities.map((amenity, i) => (
                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm flex items-center gap-1">
                  {amenity}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, amenities: formData.amenities.filter((_, idx) => idx !== i) })}
                    className="hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell us more about the property..."
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Upload className="w-4 h-4" /> Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const url = (e.target as HTMLInputElement).value;
                    if (url) {
                      setFormData({ ...formData, images: [...formData.images, url] });
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.images.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, images: formData.images.filter((_, idx) => idx !== i) })}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialData ? 'Update Property' : 'Create Listing'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
