import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api/axios';

export function useGoogleMapsConfig() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 5;

        const fetchConfig = async () => {
            try {
                const res = await api.get('/api/admin/integrations');

                if (res.data?.success && Array.isArray(res.data.data)) {
                    const maps = res.data.data.find((i: any) => i.type === 'GOOGLE_MAPS');
                    if (maps && maps.isActive) {
                        const dashboardConfig = maps.config?.dashboard;
                        if (dashboardConfig?.mapsJavascriptApiKey) {
                            setConfig(dashboardConfig);
                            setLoading(false);
                            return;
                        }
                    }
                }

                // If we reach here, it wasn't successful or no key found
                if (attempts < maxAttempts) {
                    attempts++;
                    timerRef.current = setTimeout(fetchConfig, 2000);
                } else {
                    setLoading(false);
                }
            } catch (e: any) {
                const status = e.response?.status;
                if ((status === 401 || status === 403) && attempts < maxAttempts) {
                    attempts++;
                    // Unauthorized - wait for rehydration/login and retry
                    timerRef.current = setTimeout(fetchConfig, 2000);
                } else {
                    console.error('Final attempt failed to fetch Maps config', e);
                    setLoading(false);
                }
            }
        };

        fetchConfig();

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return { config, loading };
}
