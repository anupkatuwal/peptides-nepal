import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, QrCode, Smartphone, ArrowRight, Loader2 } from 'lucide-react';

interface EsewaModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  amountNpr: number;
  onSuccess: (txnRef: string) => void;
}

export const EsewaModal: React.FC<EsewaModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  amountNpr,
  onSuccess
}) => {
  const [esewaId, setEsewaId] = useState('9841234567');
  const [mpin, setMpin] = useState('****');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'wallet' | 'qr'>('wallet');

  if (!isOpen) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const randomTxn = `ESEWA-${Math.floor(10000000 + Math.random() * 90000000)}`;
      onSuccess(randomTxn);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
        {/* eSewa Header */}
        <div className="bg-[#60BB46] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white text-[#60BB46] font-black text-xl flex items-center justify-center shadow-xs">
              e
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">eSewa epay</h3>
              <p className="text-xs text-white/80">Secure Nepali Digital Wallet</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Strip */}
        <div className="bg-[#F8FAF5] px-6 py-3 border-b border-gray-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-gray-500">Order ID: </span>
            <span className="font-bold text-gray-800">{orderNumber}</span>
          </div>
          <div>
            <span className="text-gray-500">Payable Amount: </span>
            <span className="font-black text-[#60BB46] text-sm">रू {amountNpr.toLocaleString()}</span>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'wallet'
                ? 'border-[#60BB46] text-[#60BB46]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>eSewa ID / Password</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'qr'
                ? 'border-[#60BB46] text-[#60BB46]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Scan eSewa QR</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'wallet' ? (
            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  eSewa ID (Mobile Number / Email)
                </label>
                <input
                  type="text"
                  value={esewaId}
                  onChange={(e) => setEsewaId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#60BB46]"
                  placeholder="98XXXXXXXX"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  MPIN / Password
                </label>
                <input
                  type="password"
                  value={mpin}
                  onChange={(e) => setMpin(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#60BB46]"
                  placeholder="Enter 4-digit MPIN"
                  required
                />
              </div>

              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-none mt-0.5" />
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  <strong>Sandbox / Demo Mode Active:</strong> Clicking "Authorize eSewa Payment" will simulate instant biometric authorization and return a verified transaction token.
                </p>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-[#60BB46] text-white font-bold text-sm hover:bg-[#52A33A] transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Communicating with eSewa API...</span>
                  </>
                ) : (
                  <>
                    <span>Authorize रू {amountNpr.toLocaleString()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-48 h-48 mx-auto bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center">
                {/* Simulated dynamic QR code */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-gray-800">
                  <rect x="0" y="0" width="100" height="100" fill="white" />
                  {/* Outer markers */}
                  <rect x="10" y="10" width="24" height="24" fill="#60BB46" />
                  <rect x="14" y="14" width="16" height="16" fill="white" />
                  <rect x="18" y="18" width="8" height="8" fill="#60BB46" />

                  <rect x="66" y="10" width="24" height="24" fill="#60BB46" />
                  <rect x="70" y="14" width="16" height="16" fill="white" />
                  <rect x="74" y="18" width="8" height="8" fill="#60BB46" />

                  <rect x="10" y="66" width="24" height="24" fill="#60BB46" />
                  <rect x="14" y="70" width="16" height="16" fill="white" />
                  <rect x="18" y="74" width="8" height="8" fill="#60BB46" />

                  {/* QR Grid dots */}
                  <rect x="42" y="14" width="6" height="6" fill="#2A3312" />
                  <rect x="52" y="14" width="6" height="6" fill="#2A3312" />
                  <rect x="42" y="24" width="6" height="6" fill="#2A3312" />
                  <rect x="42" y="38" width="16" height="16" fill="#60BB46" />
                  <rect x="14" y="44" width="6" height="6" fill="#2A3312" />
                  <rect x="24" y="44" width="6" height="6" fill="#2A3312" />
                  <rect x="66" y="44" width="10" height="10" fill="#2A3312" />
                  <rect x="42" y="66" width="6" height="6" fill="#2A3312" />
                  <rect x="52" y="74" width="6" height="6" fill="#2A3312" />
                  <rect x="66" y="66" width="20" height="20" fill="#2A3312" />
                  <rect x="72" y="72" width="8" height="8" fill="white" />
                </svg>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-700">
                  Open eSewa Mobile App &amp; Scan QR Code
                </p>
                <p className="text-[11px] text-gray-400">
                  Merchant: <strong className="text-gray-700">Peptides Nepal</strong>
                </p>
                <a
                  href={`https://wa.me/9779808318864?text=${encodeURIComponent(
                    `Namaste! I am paying for Order #${orderNumber} (रू ${amountNpr.toLocaleString()} NPR) on Peptides Nepal. Please send the active eSewa QR code directly.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-[11px] font-bold text-[#60BB46] hover:underline mt-1"
                >
                  Ask for direct eSewa QR via WhatsApp (+977 9808318864) →
                </a>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsProcessing(true);
                  setTimeout(() => {
                    setIsProcessing(false);
                    onSuccess(`ESEWA-QR-${Math.floor(10000000 + Math.random() * 90000000)}`);
                  }, 1200);
                }}
                disabled={isProcessing}
                className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {isProcessing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Simulate Successful QR Scan</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
