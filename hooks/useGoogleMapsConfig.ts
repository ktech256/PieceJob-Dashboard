import { useState, useEffect } from 'react';
import api from '@/lib/api/axios';

export function useGoogleMapsConfig() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await api.get('/api/admin/integrations');

                if (res.data?.success && Array.isArray(res.data.data)) {
                    const maps = res.data.data.find((i: any) => i.type === 'GOOGLE_MAPS');
                    if (maps && maps.isActive) {
                        // Extract dashboard config
                        setConfig(maps.config?.dashboard || null);
                    }
                } else {
                    console.warn('Integration API returned unsuccessful response', res.data);
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
