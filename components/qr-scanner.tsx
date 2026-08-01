"use client";

import { useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
}

export function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const [error, setError] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let html5QrCode: Html5Qrcode;
    let isComponentMounted = true;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("qr-reader");
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        
        const handleSuccess = (decodedText: string) => {
          if (isComponentMounted) {
            html5QrCode.stop().then(() => {
              onScanSuccess(decodedText);
            }).catch(console.warn);
          }
        };
        
        const handleError = (errorMessage: string) => {
          if (onScanError) onScanError(errorMessage);
        };

        try {
          // Try back camera first
          await html5QrCode.start({ facingMode: "environment" }, config, handleSuccess, handleError);
        } catch (envErr) {
          // Fallback to front camera (e.g., laptops/desktops)
          console.warn("Environment camera failed, trying user camera:", envErr);
          await html5QrCode.start({ facingMode: "user" }, config, handleSuccess, handleError);
        }

        if (isComponentMounted) {
          setIsScanning(true);
          setError("");
        }
      } catch (err: any) {
        if (isComponentMounted) {
          console.warn("Camera start error:", err);
          setError("Cannot access camera. Please ensure you have granted permissions and a camera is available.");
        }
      }
    };

    // Small delay to ensure the div is rendered
    const timer = setTimeout(() => {
      startScanner();
    }, 100);

    return () => {
      isComponentMounted = false;
      clearTimeout(timer);
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative aspect-square flex items-center justify-center">
      <div id="qr-reader" className="w-full h-full border-none [&>video]:object-cover [&>video]:w-full [&>video]:h-full"></div>
      
      {!isScanning && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10 text-slate-500 space-y-3">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="font-medium text-sm">Requesting camera access...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10 p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <div>
            <p className="text-slate-900 font-bold mb-1">Camera Access Denied</p>
            <p className="text-slate-500 text-sm">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      )}
    </div>
  );
}
