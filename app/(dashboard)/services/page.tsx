"use client";

import { useState } from 'react';
import { ToggleRight, ToggleLeft, MoreVertical, Edit3 } from 'lucide-react';

export default function ServiceCatalogManagement() {
  const categories = [
    { name: 'HDS', title: 'Home & Domestic', services: ['House Cleaning', 'Deep Cleaning', 'Laundry', 'Yard Cleaning'] },
    { name: 'CSS', title: 'Care & Support', services: ['Babysitting', 'Nanny - Stay In', 'Elderly Care'] },
    { name: 'HMS', title: 'Handyman', services: ['General Handyman', 'Electrical', 'Plumbing'] }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Global Service Catalog</h1>
        <button className="bg-brand-customer-red text-white px-6 py-2 rounded-full text-sm font-black uppercase hover:scale-105 transition-transform shadow-sm">
            Add New Service
        </button>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {categories.map((cat) => (
            <div key={cat.name}>
                <div className="flex items-center gap-4 mb-6">
                    <span className="bg-gray-100 px-3 py-1 rounded text-xs font-black text-gray-400">{cat.name}</span>
                    <h2 className="text-xl font-bold text-gray-700">{cat.title}</h2>
                    <div className="h-px bg-gray-100 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {cat.services.map((service, i) => (
                        <div key={i} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="font-bold text-lg">{service}</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{cat.name}-0{i+1}</p>
                                </div>
                                <button className="p-1 text-gray-300 hover:text-gray-900"><MoreVertical size={16} /></button>
                            </div>

                            {/* SECTION 16 & 17: Visibility Toggles per country */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-tighter mb-2">Regional Availability</p>
                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                                    <span className="text-xs font-medium">🇿🇦 South Africa</span>
                                    <button className="text-brand-customer-red"><ToggleRight size={24} /></button>
                                </div>
                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                                    <span className="text-xs font-medium">🇳🇦 Namibia</span>
                                    <button className="text-gray-300"><ToggleLeft size={24} /></button>
                                </div>
                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                                    <span className="text-xs font-medium">🇧🇼 Botswana</span>
                                    <button className="text-brand-customer-red"><ToggleRight size={24} /></button>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t flex justify-between">
                                <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-brand-customer-red">
                                    <Edit3 size={14} />
                                    Edit Rules
                                </button>
                                <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase">Vetting: Standard</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
