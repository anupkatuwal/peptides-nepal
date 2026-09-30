import React, { useState } from 'react';
import { X, ShieldCheck, ArrowRight, Loader2, Smartphone, QrCode } from 'lucide-react';

interface KhaltiModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  amountNpr: number;
  onSuccess: (txnRef: string) => void;
}

export const KhaltiModal: React.FC<KhaltiModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  amountNpr,
  onSuccess
}) => {
  const [khaltiMobile, setKhaltiMobile] = useState('9801234567');
  const [mpin, setMpin] = useState('1234');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [otp, setOtp] = useState('9482');

  if (!isOpen) return null;

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep('otp');
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const randomTxn = `KHALTI-${Math.floor(10000000 + Math.random() * 90000000)}`;
      onSuccess(randomTxn);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
        {/* Khalti Header */}
        <div className="bg-[#5C2D91] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white text-[#5C2D91] font-black text-xl flex items-center justify-center shadow-xs">
              K
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Khalti Payment</h3>
              <p className="text-xs text-white/80">Digital Wallet &amp; Banking</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Strip */}
        <div className="bg-[#FAF7FC] px-6 py-3 border-b border-gray-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-gray-500">Order Ref: </span>
            <span className="font-bold text-gray-800">{orderNumber}</span>
          </div>
          <div>
            <span className="text-gray-500">Amount: </span>
            <span className="font-black text-[#5C2D91] text-sm">रू {amountNpr.toLocaleString()}</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 'details' ? (
            <form onSubmit={handleInitiate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Khalti Registered Mobile Number
                </label>
                <input
                  type="text"
                  value={khaltiMobile}
                  onChange={(e) => setKhaltiMobile(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#5C2D91]"
                  placeholder="98XXXXXXXX"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Khalti MPIN (4 Digits)
                </label>
                <input
                  type="password"
                  value={mpin}
                  onChange={(e) => setMpin(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#5C2D91]"
                  placeholder="Enter 4-digit MPIN"
                  required
                />
              </div>

              <div className="bg-purple-50 rounded-xl p-3 border border-purple-100 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#5C2D91] flex-none mt-0.5" />
                <p className="text-[11px] text-[#5C2D91] leading-relaxed">
                  <strong>Khalti Sandbox:</strong> Click "Generate OTP" to simulate receiving a one-time verification token.
                </p>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-[#5C2D91] text-white font-bold text-sm hover:bg-[#4D2479] transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Contacting Khalti API...</span>
                  </>
                ) : (
                  <>
                    <span>Generate OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <a
                  href={`https://wa.me/9779808318864?text=${encodeURIComponent(
                    `Namaste! I am paying for Order #${orderNumber} (रू ${amountNpr.toLocaleString()} NPR) on Peptides Nepal. Please send the active Khalti / Fonepay QR code directly.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-[#5C2D91] hover:underline"
                >
                  Ask for direct Khalti QR on WhatsApp (+977 9808318864) →
                </a>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-gray-800">
                  Enter SMS Verification OTP
                </p>
                <p className="text-[11px] text-gray-500">
                  Sent to <strong className="text-gray-800">{khaltiMobile}</strong>
                </p>
              </div>

              <div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center tracking-widest text-lg font-bold px-3.5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5C2D91]"
                  placeholder="OTP Code"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-[#5C2D91] text-white font-bold text-sm hover:bg-[#4D2479] transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying OTP &amp; Settling Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Khalti Payment (रू {amountNpr.toLocaleString()})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('details')}
                className="w-full py-1 text-xs text-gray-500 hover:text-gray-700 underline text-center"
              >
                ← Back to Mobile &amp; PIN
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
