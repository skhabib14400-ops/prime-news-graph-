import React, { useEffect, useRef } from 'react';
import { AdSlot } from '../types/news';
import { api } from '../services/api';

interface AdPlacementProps {
  slot: AdSlot | undefined;
  className?: string;
  fallbackText?: string;
}

export const AdPlacement: React.FC<AdPlacementProps> = ({ slot, className = '', fallbackText }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (slot && slot.is_active) {
      api.recordAdImpression(slot.id);
    }
  }, [slot]);

  if (!slot || !slot.is_active) {
    return null;
  }

  // Handle device targeting class
  const visibilityClass =
    slot.device_target === 'desktop'
      ? 'hidden md:block'
      : slot.device_target === 'mobile'
      ? 'block md:hidden'
      : 'block';

  const handleClick = () => {
    api.recordAdClick(slot.id);
  };

  return (
    <aside
      className={`ad-placement my-4 overflow-hidden rounded text-center ${visibilityClass} ${className}`}
      aria-label="Advertisement"
      onClick={handleClick}
    >
      <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-400">
        ADVERTISEMENT
      </div>
      <div
        ref={containerRef}
        className="inline-block max-w-full overflow-hidden"
        dangerouslySetInnerHTML={{ __html: slot.ad_code || `<div class="p-4 bg-slate-100 text-xs text-slate-500 rounded border border-slate-200">${fallbackText || slot.name}</div>` }}
      />
    </aside>
  );
};
