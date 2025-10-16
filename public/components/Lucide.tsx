import React, { useEffect } from 'react';

declare global {
    interface Window {
        lucide: {
            createIcons: () => void;
        };
    }
}

export const Lucide: React.FC = () => {
    useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, []);

    // This component does not render anything itself
    return null; 
};