import { useState, useEffect } from 'react';
import api from '@/lib/api/axios';

export function useGoogleMapsConfig() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await api.get('/api/admin/integrations');
                const maps = res.data.data.find((i: any) => i.type === 'GOOGLE_MAPS');
                if (maps && maps.isActive) {
                    // Extract dashboard config
                    setConfig(maps.config?.dashboard || null);
                }
            } catch (e) {
                console.error('Failed to fetch Google Maps config', e);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    return { config, loading };
}
