import React from 'react';
import { MapPinIcon } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 max-w-4xl flex items-center justify-center">
        <MapPinIcon className="w-8 h-8 text-blue-500 mr-3" />
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
          AI Tourist Guide
        </h1>
      </div>
    </header>
  );
};
