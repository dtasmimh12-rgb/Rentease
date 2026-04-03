import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../firebase';
import { Home, Search, MessageSquare, Heart, User, LogOut, PlusSquare } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const location = useLocation();

  const navItems = profile?.role === 'landlord' 
    ? [
        { icon: Home, label: 'Dashboard', path: '/' },
        { icon: MessageSquare, label: 'Messages', path: '/chats' },
      ]
    : [
        { icon: Search, label: 'Feed', path: '/' },
        { icon: Heart, label: 'Favorites', path: '/favorites' },
        { icon: MessageSquare, label: 'Messages', path: '/chats' },
      ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:pl-64">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 p-6">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-blue-600">RentEase</h1>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{profile?.role}</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                location.pathname === item.path 
                  ? "bg-blue-50 text-blue-600 font-semibold" 
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-6 px-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {profile?.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.name}</p>
              <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
            </div>
          </div>
          <button
            onClick={() => auth.signOut()}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 px-4 z-50">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full transition-all",
              location.pathname === item.path ? "text-blue-600" : "text-gray-500"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] mt-1">{item.label}</span>
          </Link>
        ))}
        <button
          onClick={() => auth.signOut()}
          className="flex flex-col items-center justify-center w-full h-full text-gray-500"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-[10px] mt-1">Exit</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
