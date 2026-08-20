import React from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { TabFlowLogoSvg } from '../pages/Landing';

export default function LoadingScreen({ message = "Loading workspaces & cloud data...", fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-md mx-auto">
      {/* Animated Logo Container with Glow */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl animate-pulse" />
        <div className="relative w-16 h-16 bg-slate-900 border border-slate-700/80 rounded-2xl flex items-center justify-center shadow-2xl">
          <TabFlowLogoSvg className="w-10 h-8 text-blue-400 animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1 border-2 border-slate-950 shadow-md">
          <RefreshCw size={12} className="text-white animate-spin" />
        </div>
      </div>

      {/* Loading Title & Message */}
      <h3 className="text-lg font-bold text-white mb-1.5 flex items-center justify-center gap-2">
        <Sparkles size={16} className="text-blue-400 animate-pulse" />
        FlowZone Data Loading
      </h3>
      <p className="text-xs text-slate-400 mb-6 max-w-xs leading-relaxed">
        {message}
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/80 rounded-full h-1.5 mb-8 overflow-hidden border border-slate-700/50">
        <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full animate-pulse w-3/4" />
      </div>

      {/* Skeleton Preview Grid */}
      <div className="w-full space-y-3">
        <div className="h-16 bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3 w-full">
            <div className="w-3.5 h-3.5 rounded-full bg-blue-500/40" />
            <div className="space-y-1.5 flex-1 text-left">
              <div className="h-3 bg-slate-800 rounded w-1/3" />
              <div className="h-2 bg-slate-800/60 rounded w-2/3" />
            </div>
          </div>
        </div>
        <div className="h-16 bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3 w-full">
            <div className="w-3.5 h-3.5 rounded-full bg-indigo-500/40" />
            <div className="space-y-1.5 flex-1 text-left">
              <div className="h-3 bg-slate-800 rounded w-1/2" />
              <div className="h-2 bg-slate-800/60 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl my-4">
      {content}
    </div>
  );
}
