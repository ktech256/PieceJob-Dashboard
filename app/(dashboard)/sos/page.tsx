"use client";

import { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Bell, Shield, CheckCircle } from 'lucide-react';

interface PanicAlert {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  location: {
    coordinates: number[];
  };
  status: string;
  createdAt: string;
}

export default function SOSHub() {
  const [alerts, setAlerts] = useState<PanicAlert[]>([]);
  const [isSirenActive, setIsSirenActive] = useState(false);

  useEffect(() => {
    // SECTION 12: Real-time SOS Listener simulation
    // In production: socket.on('SOS_TRIGGER', (alert) => { ... })
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black tracking-tight text-gray-800">SOS EMERGENCY HUB</h1>

        {/* SECTION 12 & 23: Dashboard Siren Status */}
        <div className={`flex items-center gap-4 px-6 py-3 rounded-full border-2 transition-all ${
            isSirenActive ? 'bg-red-600 border-red-800 text-white animate-pulse' : 'bg-green-50 border-green-200 text-green-700'
        }`}>
            <Bell className={isSirenActive ? 'animate-bounce' : ''} />
            <span className="font-black uppercase tracking-tighter">
                {isSirenActive ? 'CRITICAL ALERT ACTIVE' : 'ALL SYSTEMS SECURE'}
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Alerts Column */}
        <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xs font-black uppercase text-gray-400 tracking-widest">Active Panic Triggers</h2>
            {alerts.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
                    <Shield size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-medium">No emergency alerts currently active.</p>
                </div>
            ) : (
                alerts.map((alert) => (
                    <div key={alert._id} className="bg-white border-2 border-red-100 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 bottom-0 w-2 bg-red-600"></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">Emergency</span>
                                    <span className="text-xs text-gray-400 font-mono">{new Date(alert.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    {alert.userId.firstName} {alert.userId.lastName}
                                </h3>
                                <p className="text-sm font-medium text-gray-500 mb-4">{alert.userId.phoneNumber}</p>

                                <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black transition-colors">
                                    <MapPin size={16} />
                                    Launch Live Tracking
                                </button>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-black uppercase hover:bg-green-700">Mark Resolved</button>
                                <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-xs font-black uppercase hover:bg-gray-200">False Alarm</button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* SOS Stats & Protocol */}
        <div className="space-y-6">
            <div className="bg-[#0A0A0A] rounded-2xl p-6 text-white">
                <h3 className="font-black text-lg mb-4">EMERGENCY PROTOCOL</h3>
                <ul className="space-y-4 text-xs text-gray-400">
                    <li className="flex gap-3">
                        <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center shrink-0 text-white font-black">1</div>
                        <p>Immediate broadcast sent to 5 closest providers in a 5km radius.</p>
                    </li>
                    <li className="flex gap-3">
                        <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center shrink-0 text-white font-black">2</div>
                        <p>High-frequency GPS tracking and Audio capture initiated on target device.</p>
                    </li>
                    <li className="flex gap-3">
                        <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center shrink-0 text-white font-black">3</div>
                        <p>SMS notifications dispatched to registered Emergency Contacts.</p>
                    </li>
                </ul>
            </div>

            <div className="bg-white border rounded-2xl p-6">
                <h3 className="font-bold text-gray-800 mb-4">Response Performance</h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold text-gray-500 uppercase">Avg Response Time</span>
                            <span className="font-black">1.2 Min</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className="bg-green-500 h-1.5 rounded-full w-[85%]"></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold text-gray-500 uppercase">Proximity Success</span>
                            <span className="font-black">94%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full w-[94%]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
