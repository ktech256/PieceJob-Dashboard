"use client";

import { useState, useEffect } from 'react';

export default function DemandHeatmap() {
    const [heatmapData, setHeatmapData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // SECTION 14 & 25: Fetch Demand Heatmap Data
        const fetchHeatmap = async () => {
            // Simulated API call to get coordinates and demand intensity
            setLoading(false);
        };
        fetchHeatmap();
    }, []);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Demand Heatmap</h1>
                <div className="flex gap-4">
                    <select className="border rounded-md px-3 py-1 bg-white text-sm">
                        <option>Last 24 Hours</option>
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                    </select>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-[600px] flex items-center justify-center relative overflow-hidden">
                {/*
                    Integration Point for Google Maps Heatmap Layer
                    Reference: SECTION 21 - Phase 5
                */}
                <div className="absolute inset-0 bg-blue-50 opacity-20"></div>
                <div className="z-10 text-center">
                    <div className="w-16 h-16 bg-red-500 rounded-full blur-2xl animate-pulse mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Map Layer Initializing...</p>
                    <p className="text-sm text-gray-400 mt-2">Visualizing job request intensity across active zones.</p>
                </div>

                {/* Simulated Legend */}
                <div className="absolute bottom-6 right-6 bg-white p-4 rounded-lg border shadow-sm z-20">
                    <p className="text-xs font-bold uppercase text-gray-500 mb-2">Demand Intensity</p>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                        <span className="text-xs text-gray-600">Low</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <span className="text-xs text-gray-600">Medium</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-xs text-gray-600">High</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="bg-white p-4 rounded-xl border">
                    <h3 className="text-sm font-bold text-gray-500 mb-1">TOP ZONE</h3>
                    <p className="text-xl font-bold text-gray-800">Johannesburg CBD</p>
                    <p className="text-xs text-green-600 font-medium">+14% vs last week</p>
                </div>
                <div className="bg-white p-4 rounded-xl border">
                    <h3 className="text-sm font-bold text-gray-500 mb-1">AVG WAIT TIME</h3>
                    <p className="text-xl font-bold text-gray-800">4.2 Minutes</p>
                    <p className="text-xs text-gray-400 font-medium">Within target range</p>
                </div>
                <div className="bg-white p-4 rounded-xl border">
                    <h3 className="text-sm font-bold text-gray-500 mb-1">CONVERSION RATE</h3>
                    <p className="text-xl font-bold text-gray-800">82.5%</p>
                    <p className="text-xs text-red-500 font-medium">-2% supply shortage</p>
                </div>
            </div>
        </div>
    );
}
