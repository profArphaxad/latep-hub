import React, { useState } from 'react';
import { Layers, Search, ShieldCheck, Mail, Sliders, LogIn, LogOut, User, Lock } from 'lucide-react';

interface HeaderProps {
  onNavigate: (tab: 'home' | 'services' | 'order' | 'track' | 'admin') => void;
  activeTab: string;
  onSearchTrack: (id: string) => void;
  currentUserEmail: string | null;
  isAdmin: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onAdminAccess?: () => void;
}

export default function Header({ 
  onNavigate, 
  activeTab, 
  onSearchTrack,
  currentUserEmail,
  isAdmin,
  onSignIn,
  onSignOut,
  onAdminAccess
}: HeaderProps) {
  const [trackSearchId, setTrackSearchId] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackSearchId.trim()) {
      onSearchTrack(trackSearchId.trim().toUpperCase());
      setTrackSearchId('');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200" id="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="bg-emerald-600 text-white p-2 rounded-lg shadow-sm flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-neutral-950 font-sans uppercase">
                Latep<span className="text-emerald-600 font-extrabold"> Hub</span>
              </span>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Professional Typesetting & Design</p>
            </div>
          </div>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              id="nav-home-btn"
              onClick={() => onNavigate('home')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-emerald-555/10 text-emerald-800 bg-emerald-50'
                  : 'text-neutral-600 hover:text-emerald-700 hover:bg-neutral-50'
              }`}
            >
              Home
            </button>
            <button
              id="nav-services-btn"
              onClick={() => onNavigate('services')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-emerald-555/10 text-emerald-800'
                  : 'text-neutral-600 hover:text-emerald-700 hover:bg-neutral-50'
              }`}
            >
              Our Solutions
            </button>
            <button
              id="nav-order-btn"
              onClick={() => onNavigate('order')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'order'
                  ? 'bg-emerald-550/10 text-emerald-800'
                  : 'text-neutral-600 hover:text-emerald-700 hover:bg-neutral-50'
              }`}
            >
              Order Workspace
            </button>
            <button
              id="nav-track-btn"
              onClick={() => onNavigate('track')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'track'
                  ? 'bg-emerald-550/10 text-emerald-800'
                  : 'text-neutral-600 hover:text-emerald-700 hover:bg-neutral-50'
              }`}
            >
              Order Tracking
            </button>
            
            {/* Admin Dashboard Navigation Tab (unlocked for admin) */}
            {isAdmin && (
              <button
                id="nav-admin-btn"
                onClick={() => onNavigate('admin')}
                className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all border flex items-center space-x-1 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-neutral-950 border-neutral-950 text-white font-black shadow-sm'
                    : 'bg-yellow-400 text-black border-yellow-450 hover:bg-yellow-500'
                }`}
              >
                <Lock className="h-3 w-3" />
                <span>Admin Panel</span>
              </button>
            )}
          </nav>

          {/* Right Area - Quick Search & Auth Gate */}
          <div className="flex items-center space-x-3 text-xs">
            <form onSubmit={handleSearchSubmit} className="relative hidden lg:block">
              <input
                type="text"
                value={trackSearchId}
                onChange={(e) => setTrackSearchId(e.target.value)}
                placeholder="Track ID (e.g. TRACK-LATE-1092)..."
                className="w-48 pl-8 pr-3 py-1.5 rounded-lg border border-neutral-250 text-xs focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all font-mono text-xs"
                id="header-track-search-input"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            </form>

            {/* Auth Session Button */}
            {currentUserEmail ? (
              <div className="flex items-center space-x-2 bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs shadow-sm">
                <div className="h-6 w-6 rounded-full bg-emerald-650 text-white font-black text-[10px] flex items-center justify-center font-mono">
                  {currentUserEmail.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[9px] text-neutral-450 font-mono">Signed In</p>
                  <p className="max-w-[125px] truncate font-bold text-neutral-800 font-mono leading-tight">{currentUserEmail}</p>
                </div>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="hover:bg-red-50 hover:text-red-600 p-1 rounded-lg text-neutral-400 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                className="bg-neutral-50 hover:bg-neutral-100 text-neutral-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-neutral-250 flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5 text-emerald-600" />
                <span>Sign In / Sign Up</span>
              </button>
            )}

            {/* Mobile Actions Overlay toggle */}
            <button
              onClick={() => onNavigate('order')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors shadow-sm cursor-pointer"
              id="header-get-started-btn"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Configure</span>
            </button>

            {/* Subtle Admin door key at the absolute far end */}
            {onAdminAccess && (
              <button
                type="button"
                onClick={onAdminAccess}
                className="text-neutral-400 hover:text-emerald-600 p-2 hover:bg-neutral-100 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 border border-transparent hover:border-neutral-200"
                id="header-subtle-admin-btn"
                title="Admin Portal Access"
              >
                <Lock className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile view alert helper */}
      <div className="sm:hidden px-4 py-2 border-t border-neutral-100 bg-emerald-50 text-[11px] text-emerald-900 flex items-center justify-between">
        <span className="font-medium flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Latep Hub Secure Channels Engaged
        </span>
        <button onClick={() => onNavigate('track')} className="underline font-semibold hover:text-emerald-950 cursor-pointer">
          Track Your Order
        </button>
      </div>
    </header>
  );
}
