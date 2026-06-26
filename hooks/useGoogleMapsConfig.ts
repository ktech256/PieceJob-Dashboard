import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api/axios';
import { useAuthStore } from '@/lib/store/authStore';

export function useGoogleMapsConfig() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const timerRef = useRef<any>(null);
    const { token } = useAuthStore();

    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 10;

        const fetchConfig = async () => {
            // If we don't have a token yet and we're in the browser, wait a bit
            const currentToken = token || localStorage.getItem('token');
            console.log(`[MAP_CONFIG] Fetch attempt ${attempts + 1}. Token present: ${!!currentToken}`);

            if (!currentToken && attempts < maxAttempts) {
                attempts++;
                timerRef.current = setTimeout(fetchConfig, 2000);
                return;
            }

            try {
                const res = await api.get('/api/admin/integrations');
                console.log(`[MAP_CONFIG] Status: ${res.status}`);

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
    }, [token]);

    return { config, loading };
}
