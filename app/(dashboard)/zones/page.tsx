"use client";

import { useState } from 'react';
import { Map, Layers, Plus, Target, MousePointer2 } from 'lucide-react';

export default function ZoneManagement() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-3">
            <Layers className="text-blue-600" />
            GeoJSON Zone Management
        </h1>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-black uppercase hover:scale-105 transition-transform flex items-center gap-2 shadow-md">
            <Plus size={16} />
            Create New Zone
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Zone List Sidebar */}
        <div className="lg:col-span-1 space-y-4">
            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Active Polygons</h3>
            <div className="space-y-2">
                {[
                    { name: 'Sandton Core', city: 'Johannesburg', active: true },
                    { name: 'Hatfield/Sunnyside', city: 'Pretoria', active: true },
                    { name: 'Waterfront', city: 'Cape Town', active: true },
                    { name: 'Windhoek Central', city: 'Windhoek', active: false }
                ].map((zone, i) => (
                    <div key={i} className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        zone.active ? 'bg-white hover:border-blue-400' : 'bg-gray-50 opacity-60'
                    }`}>
                        <div className="flex justify-between items-start mb-1">
                            <p className="font-bold text-sm">{zone.name}</p>
                            {zone.active && <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>}
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase font-medium">{zone.city}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Map Editor View */}
        <div className="lg:col-span-3">
            <div className="bg-white border-2 border-gray-100 rounded-[32px] h-[700px] relative overflow-hidden flex items-center justify-center">
                {/* Map Interface Mockup */}
                <div className="absolute inset-0 bg-[#f0f0f0] opacity-30"></div>

                {/* Simulated Polygons */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-64 bg-blue-500/20 border-2 border-blue-500 rounded-[20%] rotate-12 flex items-center justify-center">
                    <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg">SANDTON_CORE</span>
                </div>

                <div className="absolute bottom-20 right-40 w-48 h-48 bg-orange-500/20 border-2 border-orange-500 rounded-full flex items-center justify-center">
                    <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg">PRETORIA_EAST</span>
                </div>

                {/* Editor Controls */}
                <div className="absolute top-6 right-6 bg-white shadow-xl rounded-2xl p-2 border flex flex-col gap-1">
                    <button className="p-3 bg-gray-100 rounded-xl text-gray-800 hover:bg-blue-500 hover:text-white transition-all"><MousePointer2 size={18} /></button>
                    <button className="p-3 bg-gray-100 rounded-xl text-gray-800 hover:bg-blue-500 hover:text-white transition-all"><Layers size={18} /></button>
                    <button className="p-3 bg-gray-100 rounded-xl text-gray-800 hover:bg-blue-500 hover:text-white transition-all"><Target size={18} /></button>
                </div>

                <div className="z-10 text-center pointer-events-none">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Targeting Regional Isolation</p>
                    <p className="text-[10px] text-gray-300 mt-1 italic">Click and drag to modify boundaries</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
