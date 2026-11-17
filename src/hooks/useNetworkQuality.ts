// src/hooks/useNetworkQuality.ts
import { useState, useEffect } from 'react';

interface NetworkInformation extends EventTarget {
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  saveData?: boolean;
}

/**
 * Detects slow connections (3G / 2G / Data Saver) via the Network Information API
 * so the SDK can adapt camera resolution and compression automatically.
 */
export function useNetworkQuality() {
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);
  const [effectiveType, setEffectiveType] = useState<string>('4g');

  useEffect(() => {
    const nav = navigator as Navigator & { connection?: NetworkInformation };
    const conn = nav.connection;

    if (!conn) return;

    const updateStatus = () => {
      const type = conn.effectiveType || '4g';
      setEffectiveType(type);
      setIsSlowNetwork(
        Boolean(conn.saveData) || ['slow-2g', '2g', '3g'].includes(type)
      );
    };

    updateStatus();
    conn.addEventListener('change', updateStatus);
    return () => conn.removeEventListener('change', updateStatus);
  }, []);

  return { isSlowNetwork, effectiveType };
}