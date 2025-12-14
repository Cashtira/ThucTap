'use client';

import { Scanner } from '@yudiel/react-qr-scanner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function ScanPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [scanned, setScanned] = useState(false);

  const handleScan = (result: any) => {
    if (scanned) return;

    if (result) {
      const rawValue = result[0]?.rawValue;
      if (rawValue) {
        setScanned(true);
        // Nếu quét trúng mã có dạng link "https.../kit/1" hoặc chỉ số "1"
        if (rawValue.includes('/kit/')) {
            const id = rawValue.split('/kit/')[1];
            router.push(`/kit/${id}`);
        } else {
            router.push(`/kit/${rawValue}`);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative p-4">
      <Link href="/" className="absolute top-6 right-6 text-white bg-gray-800 p-3 rounded-full z-20">❌</Link>

      <div className="z-10 text-white text-center mb-10">
        <h1 className="text-xl font-bold text-yellow-400">Quét Mã QR 📸</h1>
      </div>

      <div className="w-full max-w-sm aspect-square overflow-hidden rounded-3xl border-4 border-yellow-400 relative shadow-2xl">
        <Scanner 
            onScan={handleScan}
            onError={(err:any) => setError(err.message)}
            components={{ finder: false }}
            styles={{ container: { width: '100%', height: '100%' } }}
        />
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_20px_rgba(255,0,0,0.8)] animate-scan"></div>
      </div>

      {error && <p className="text-red-500 mt-4 bg-white px-4 py-2 rounded">⚠️ Lỗi: {error}</p>}
      
      <style jsx>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan { animation: scan 2s linear infinite; }
      `}</style>
    </div>
  );
}