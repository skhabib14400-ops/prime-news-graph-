import React, { useEffect } from 'react';
import { AdSlot } from '../types/news';

interface AdsterraGlobalControllerProps {
  ads: AdSlot[];
}

export const AdsterraGlobalController: React.FC<AdsterraGlobalControllerProps> = ({ ads }) => {
  useEffect(() => {
    // 1. Popunder controller
    const popunderSlot = ads.find(a => a.id === 'popunder');
    const existingPop = document.getElementById('adsterra-popunder-script');

    if (popunderSlot && popunderSlot.is_active && popunderSlot.ad_code) {
      if (!existingPop) {
        const srcMatch = popunderSlot.ad_code.match(/src=["'](.*?)["']/);
        const script = document.createElement('script');
        script.id = 'adsterra-popunder-script';
        script.setAttribute('data-cfasync', 'false');
        if (srcMatch && srcMatch[1]) {
          script.src = srcMatch[1];
        } else {
          script.textContent = popunderSlot.ad_code.replace(/<\/?script.*?>/gi, '');
        }
        document.body.appendChild(script);
      }
    } else if (existingPop) {
      existingPop.remove();
    }

    // 2. Social Bar / In-page Push Controller
    const socialSlot = ads.find(a => a.id === 'social_bar');
    const existingSocial = document.getElementById('adsterra-social-bar-script');

    if (socialSlot && socialSlot.is_active && socialSlot.ad_code) {
      if (!existingSocial) {
        const srcMatch = socialSlot.ad_code.match(/src=["'](.*?)["']/);
        const script = document.createElement('script');
        script.id = 'adsterra-social-bar-script';
        script.setAttribute('data-cfasync', 'false');
        if (srcMatch && srcMatch[1]) {
          script.src = srcMatch[1];
        } else {
          script.textContent = socialSlot.ad_code.replace(/<\/?script.*?>/gi, '');
        }
        document.body.appendChild(script);
      }
    } else if (existingSocial) {
      existingSocial.remove();
    }
  }, [ads]);

  return null;
};
