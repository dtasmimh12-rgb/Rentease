import { Link } from 'react-router-dom';
import { Property } from '../types';
import { MapPin, DollarSign, Heart, Trash2, Edit, Eye, MousePointer2, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface PropertyCardProps {
  key?: string | number;
  property: Property;
  isOwner?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onBoost?: () => void;
}

export default function PropertyCard({ 
  property, 
  isOwner, 
  isFavorite, 
  onToggleFavorite, 
  onDelete, 
  onEdit,
  onBoost
}: PropertyCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow group relative",
        property.isFeatured ? "border-amber-200 ring-1 ring-amber-100" : "border-gray-100"
      )}
    >
      {property.isFeatured && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1 px-3 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-lg">
          <Star className="w-3 h-3 fill-current" /> Featured
        </div>
      )}

      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images[0] || `https://picsum.photos/seed/${property.id}/800/600`}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          {!isOwner && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleFavorite?.();
              }}
              className={cn(
                "p-2 rounded-full backdrop-blur-md transition-colors",
                isFavorite ? "bg-red-500 text-white" : "bg-white/80 text-gray-600 hover:text-red-500"
              )}
            >
              <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
            </button>
          )}
          {isOwner && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onBoost?.();
                }}
                className={cn(
                  "p-2 rounded-full backdrop-blur-md transition-colors",
                  property.isFeatured ? "bg-amber-500 text-white" : "bg-white/80 text-amber-600 hover:bg-amber-500 hover:text-white"
                )}
                title="Boost Listing"
              >
                <Star className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onEdit?.();
                }}
                className="p-2 rounded-full bg-white/80 backdrop-blur-md text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDelete?.();
                }}
                className="p-2 rounded-full bg-white/80 backdrop-blur-md text-red-600 hover:bg-red-600 hover:text-white transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
        <div className="absolute bottom-4 left-4">
          <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
            {property.type}
          </span>
        </div>
        {property.status === 'rented' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
            <span className="px-6 py-2 bg-white/90 text-gray-900 font-bold rounded-full uppercase tracking-widest text-sm shadow-xl">
              Rented
            </span>
          </div>
        )}
      </div>

      <Link to={`/property/${property.id}`} className="p-5 block">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{property.title}</h3>
          <div className="flex items-center text-blue-600 font-bold">
            <DollarSign className="w-4 h-4" />
            <span>{property.price.toLocaleString()}</span>
            <span className="text-xs text-gray-500 font-normal ml-1">/mo</span>
          </div>
        </div>
        
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>

        {isOwner && (
          <div className="flex items-center gap-4 mb-4 p-2 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Eye className="w-3 h-3" />
              <span>{property.views || 0} views</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MousePointer2 className="w-3 h-3" />
              <span>{property.clicks || 0} clicks</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
            {new Date(property.createdAt).toLocaleDateString()}
          </span>
          <span className="text-blue-600 text-sm font-bold group-hover:translate-x-1 transition-transform">
            View Details →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
