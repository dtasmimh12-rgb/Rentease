import React, { useState } from 'react';
import { Sparkles, Search, Loader2 } from 'lucide-react';
import { aiSearchProperties } from '../services/aiService';
import { Property } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AISearchProps {
  properties: Property[];
  onResults: (propertyIds: string[] | null) => void;
}

export default function AISearch({ properties, onResults }: AISearchProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      onResults(null);
      return;
    }

    setLoading(true);
    try {
      const results = await aiSearchProperties(query, properties);
      onResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
        <div className="relative flex items-center bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all p-1.5">
          <div className="pl-4 pr-2 text-blue-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try '2 bedroom under 1500 with parking'..."
            className="flex-1 bg-transparent border-none outline-none py-3 text-gray-700 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">AI Search</span>
              </>
            )}
          </button>
        </div>
      </form>
      
      <AnimatePresence>
        {query && !loading && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={() => {
              setQuery('');
              onResults(null);
            }}
            className="absolute -bottom-8 right-4 text-xs text-gray-400 hover:text-gray-600 font-medium"
          >
            Clear AI Filters
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
