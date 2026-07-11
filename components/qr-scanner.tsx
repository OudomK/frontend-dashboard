"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
}

export function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // We delay slightly to ensure the DOM element exists
    const timer = setTimeout(() => {
      if (!scannerRef.current) {
        scannerRef.current = new Html5QrcodeScanner(
          "qr-reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
            rememberLastUsedCamera: true,
          },
          /* verbose= */ false
        );

        scannerRef.current.render(
          (decodedText) => {
            // Once successfully scanned, pause or clear to prevent duplicate triggers
            if (scannerRef.current) {
              scannerRef.current.clear();
            }
            onScanSuccess(decodedText);
          },
          (errorMessage) => {
            if (onScanError) {
              onScanError(errorMessage);
            }
          }
        );
        setIsReady(true);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
      <div id="qr-reader" className="w-full border-none"></div>
      {!isReady && (
        <div className="p-12 text-center text-slate-400 font-medium">
          Initializing Camera...
        </div>
      )}
    </div>
  );
}
