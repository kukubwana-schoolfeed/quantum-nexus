'use client';

import { MOCK_DATA } from '@/lib/api/mock-data';

const qr = MOCK_DATA.offlineQrBridge.getQrCode('');

export default function PrintableQR(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center" id="printable-qr">
        <p className="text-lg font-bold text-gray-900 mb-4">The Flame Grill</p>
        <img
          src={qr.imageUrl}
          alt="QR Code"
          className="w-64 h-64 object-contain"
        />
        <p className="text-sm text-gray-700 mt-4">Scan to join our loyalty program</p>
        <p className="text-xs text-gray-500 mt-1 font-mono">{qr.url}</p>
      </div>
      <button
        className="px-4 py-2 bg-gray-600 text-white text-xs rounded hover:bg-gray-500"
        onClick={() => {
          const el = document.getElementById('printable-qr');
          if (el) {
            const w = window.open('', '', 'width=400,height=500');
            if (w) {
              w.document.write(el.innerHTML);
              w.document.close();
              w.print();
            }
          }
        }}
      >
        Print QR Code
      </button>
    </div>
  );
}
