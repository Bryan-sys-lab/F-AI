import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const ProviderContext = createContext();

export function ProviderProvider({ children }) {
  const [providers, setProviders] = useState({});
  const [providerMetrics, setProviderMetrics] = useState({});
  const [activeProvider, setActiveProvider] = useState('mistral');
  const [loading, setLoading] = useState(true);
  const pollingIntervalRef = useRef(null);

  // Fetch providers from API
    const fetchProviders = useCallback(async () => {
      try {
        console.log('Fetching providers from /api/providers');
        const response = await fetch('/api/providers');
        console.log('Provider fetch response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Provider data received:', data);
          console.log('Number of providers:', data.length);
          const providerMap = {};
          data.forEach(provider => {
            providerMap[provider.id] = {
              name: provider.name,
              type: provider.type,
              purpose: provider.purpose,
              models: provider.models,
              status: provider.status
            };
          });
          setProviders(providerMap);

          // Set active provider (first active one or mistral as default)
          const active = data.find(p => p.status === 'active') || data.find(p => p.id === 'mistral');
          if (active) {
            setActiveProvider(active.id);
          }
        } else {
          console.error('Provider fetch failed with status:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Error response:', errorText);
        }
      } catch (error) {
        console.error('Failed to fetch providers:', error);
      }
    }, []);

  // Fetch provider metrics from API
   const fetchProviderMetrics = useCallback(async () => {
     try {
       const response = await fetch('/api/providers/metrics');
       if (response.ok) {
         const data = await response.json();
         const metricsMap = {};
         data.forEach(metric => {
           metricsMap[metric.provider_id] = {
             latency: metric.latency,
             successRate: metric.success_rate,
             totalRequests: metric.total_requests,
             activeRequests: metric.active_requests,
             costEstimate: metric.cost_estimate,
             tokensUsed: metric.tokens_used,
             lastUsed: metric.last_used ? new Date(metric.last_used) : null,
             status: 'healthy'
           };
         });
         setProviderMetrics(metricsMap);
       }
     } catch (error) {
       console.error('Failed to fetch provider metrics:', error);
     } finally {
       setLoading(false);
     }
   }, []);

  // Poll for provider metrics updates via HTTP
  const pollProviderMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/providers/metrics');
      if (response.ok) {
        const data = await response.json();
        const metricsMap = {};
        data.forEach(metric => {
          metricsMap[metric.provider_id] = {
            latency: metric.latency,
            successRate: metric.success_rate,
            totalRequests: metric.total_requests,
            activeRequests: metric.active_requests,
            costEstimate: metric.cost_estimate,
            tokensUsed: metric.tokens_used,
            lastUsed: metric.last_used ? new Date(metric.last_used) : null,
            status: 'healthy'
          };
        });
        setProviderMetrics(metricsMap);
      }
    } catch (error) {
      console.error('Failed to poll provider metrics:', error);
    }
  }, []);

  // Load data on mount and start polling
  useEffect(() => {
    fetchProviders();
    fetchProviderMetrics();

    // Start polling for provider metrics updates every 10 seconds
    pollingIntervalRef.current = setInterval(pollProviderMetrics, 10000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchProviders, fetchProviderMetrics, pollProviderMetrics]);

  const switchProvider = useCallback(async (providerId) => {
     if (providers[providerId]) {
       try {
         const response = await fetch(`/api/providers/switch/${providerId}`, {
           method: 'POST',
         });

         if (response.ok) {
           setActiveProvider(providerId);
           // Update provider statuses locally
           setProviders(prev => {
             const updated = { ...prev };
             Object.keys(updated).forEach(id => {
               updated[id].status = id === providerId ? 'active' :
                                 updated[id].type === 'primary' ? 'standby' : 'inactive';
             });
             return updated;
           });
         } else {
           console.error('Failed to switch provider');
         }
       } catch (error) {
         console.error('Error switching provider:', error);
       }
     }
   }, [providers]);

  const getProviderById = useCallback((providerId) => {
    return providers[providerId] || null;
  }, [providers]);

  const getActiveProvider = useCallback(() => {
    return providers[activeProvider] || null;
  }, [providers, activeProvider]);

  const getProviderHealth = useCallback(() => {
    const primaryProviders = Object.values(providers).filter(p => p.type === 'primary');
    const fallbackProviders = Object.values(providers).filter(p => p.type === 'fallback');

    const primaryHealthy = primaryProviders.filter(p => p.status === 'active' || p.status === 'standby').length;
    const fallbackHealthy = fallbackProviders.filter(p => p.status === 'standby').length;

    return {
      primary: {
        total: primaryProviders.length,
        healthy: primaryHealthy,
        healthPercentage: primaryProviders.length > 0 ? Math.round((primaryHealthy / primaryProviders.length) * 100) : 0
      },
      fallback: {
        total: fallbackProviders.length,
        healthy: fallbackHealthy,
        healthPercentage: fallbackProviders.length > 0 ? Math.round((fallbackHealthy / fallbackProviders.length) * 100) : 0
      }
    };
  }, [providers]);

  const getProviderMetrics = useCallback((providerId) => {
    return providerMetrics[providerId] || null;
  }, [providerMetrics]);

  const value = {
    providers,
    providerMetrics,
    activeProvider,
    switchProvider,
    getProviderById,
    getActiveProvider,
    getProviderHealth,
    getProviderMetrics
  };

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  );
}

export function useProvider() {
  const context = useContext(ProviderContext);
  if (!context) {
    throw new Error('useProvider must be used within a ProviderProvider');
  }
  return context;
}