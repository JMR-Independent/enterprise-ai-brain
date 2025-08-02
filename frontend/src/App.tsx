import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';
import Enterprise from '@/pages/Enterprise';
import LoadingSpinner from '@/components/LoadingSpinner';

function App() {
  const { setIsMobile } = useUIStore();

  useEffect(() => {
    // Handle window resize for mobile detection
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [setIsMobile]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Enterprise />} />
        <Route path="/enterprise" element={<Enterprise />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;