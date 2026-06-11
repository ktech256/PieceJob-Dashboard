"use client";

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ShieldAlert, Volume2, Lock } from 'lucide-react';
import api from '@/lib/api/axios';
import { useCountryStore } from '@/lib/store/countryStore';
import { usePathname, useRouter } from 'next/navigation';

export default function SirenSystem() {
  const { countryCode } = useCountryStore();
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    socket.emit('join_admin');

    socket.on('sos_siren_trigger', (data) => {
      if (data.countryCode === countryCode || countryCode === 'GLOBAL') {
        setActiveAlerts(prev => {
            if (prev.find(a => a._id === data._id)) return prev;
            return [...prev, data];
        });
      }
    });

    socket.on('sos_siren_stop', (data) => {
        setActiveAlerts(prev => prev.filter(a => a._id !== data._id));
    });

    const checkActive = async () => {
        try {
            const res = await api.get(`/api/admin/sos/incidents?countryCode=${countryCode}&status=ACTIVE`);
            setActiveAlerts(res.data.incidents || []);
        } catch (e) {}
    };
    checkActive();

    return () => { socket.disconnect(); };
  }, [countryCode]);

  useEffect(() => {
    if (activeAlerts.length > 0) {
      if (!audioRef.current) {
        audioRef.current = new Audio('/siren.mp3');
        audioRef.current.loop = true;
      }
      audioRef.current.play().catch(() => {});
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [activeAlerts]);

  // If on SOS page, we don't show the overlay, but keep audio playing
  if (activeAlerts.length === 0 || pathname === '/sos') return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-red-600/30 backdrop-blur-md flex flex-col items-center justify-center p-8 pointer-events-none">
      <div className="bg-white rounded-[48px] p-12 shadow-[0_0_150px_rgba(220,38,38,0.8)] border-[12px] border-red-600 max-w-2xl w-full pointer-events-auto animate-in zoom-in-95">
        <div className="flex flex-col items-center text-center gap-8">
          <div className="relative">
              <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-20 scale-150"></div>
              <div className="p-10 bg-red-600 rounded-full text-white relative z-10">
                  <ShieldAlert size={100} className="animate-bounce" />
              </div>
          </div>

          <div>
            <h2 className="text-6xl font-black uppercase tracking-tighter text-red-600 mb-2">SOS ALERT</h2>
            <p className="text-2xl font-black text-neutral-900 uppercase tracking-widest">Global Incident Response Active</p>
          </div>

          <div className="w-full space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            {activeAlerts.map(alert => (
                <div key={alert._id} className="w-full bg-neutral-50 p-6 rounded-[32px] border border-neutral-100 flex justify-between items-center group hover:bg-neutral-100 transition-all">
                    <div className="text-left">
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Incident ID</p>
                        <p className="text-xl font-black text-neutral-900">{alert.incidentId}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-black text-red-600 uppercase">{alert.userType}</p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">{alert.countryCode}</p>
                    </div>
                </div>
            ))}
          </div>

          <div className="w-full pt-4 border-t border-neutral-100">
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] mb-6 flex items-center justify-center gap-2">
                  <Lock size={12} />
                  Mute Prohibited until Resolution
              </p>
              <button
                onClick={() => router.push('/sos')}
                className="w-full bg-neutral-900 text-white py-8 rounded-[36px] text-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl"
              >
                Go to SOS Command Hub
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
