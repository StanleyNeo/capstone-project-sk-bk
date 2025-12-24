import React, { createContext, useState, useContext, useEffect } from 'react';
import HybridApiService from '../services/HybridApiService';

const AIProviderContext = createContext();

export const useAIProvider = () => {
  const context = useContext(AIProviderContext);
  if (!context) {
    throw new Error('useAIProvider must be used within AIProviderProvider');
  }
  return context;
};

export const AIProviderProvider = ({ children }) => {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('auto');
  const [aiStatus, setAiStatus] = useState({ online: false, stats: {} });
  const [loading, setLoading] = useState(false);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const [healthRes, providersRes] = await Promise.all([
        HybridApiService.getHealth(),
        HybridApiService.getProviders()
      ]);
      
      setAiStatus({
        online: healthRes.success,
        stats: healthRes.statistics || {}
      });
      
      setProviders(providersRes.available || []);
    } catch (error) {
      console.error('Failed to load providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message, options = {}) => {
    const finalProvider = options.provider || selectedProvider;
    
    return await HybridApiService.chat(message, {
      ...options,
      provider: finalProvider === 'auto' ? undefined : finalProvider
    });
  };

  const changePriority = async (newPriority) => {
    try {
      const result = await HybridApiService.setPriority(newPriority);
      if (result.success) {
        await loadProviders(); // Refresh provider list
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    loadProviders();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadProviders, 30000);
    return () => clearInterval(interval);
  }, []);

  const value = {
    providers,
    selectedProvider,
    setSelectedProvider,
    aiStatus,
    loading,
    sendMessage,
    changePriority,
    refreshProviders: loadProviders
  };

  return (
    <AIProviderContext.Provider value={value}>
      {children}
    </AIProviderContext.Provider>
  );
};