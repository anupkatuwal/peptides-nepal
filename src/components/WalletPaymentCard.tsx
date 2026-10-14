import React, { useState } from 'react';
import { Check, Copy, AlertTriangle } from 'lucide-react';

// Manual payment to the owner's personal wallets. This is not a payment gateway:
// nothing here talks to eSewa or Khalti. The customer pays in their own app, and the
// admin marks the order as paid after seeing the money arrive with the order number.
export type WalletId = 'esewa' | 'khalti';

export const WALLETS: Record<WalletId, {
  label: string;
  accountName: string;
  walletId: string;
  qrSrc: string;
  color: string;
  badge: string;
}> = {
  esewa: {
    label: 'eSewa',
    accountName: 'Anup Katuwal',
    walletId: '9745947888',
    qrSrc: '/qr/esewa-qr.png',
    color: '#60BB46',
    badge: 'e'
  },
  khalti: {
    label: 'Khalti',
    accountName: 'Anup Katuwal',
    walletId: '9808318864',
    qrSrc: '/qr/khalti-qr.png',
    color: '#5C2D91',
    badge: 'K'
  }
};

export const isWallet = (method: string): method is WalletId =>
  method === 'esewa' || method === 'khalti';

const CopyButton: React.FC<{ value: string; label: string }> = ({ value, label }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (old browsers, http). The value is still on screen to type.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#CBD5CF] bg-white text-[11px] font-bold text-[#0E2A23] hover:bg-[#F2F5F3] shrink-0"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
};

interface WalletPaymentCardProps {
  method: WalletId;
  amountNpr: number;
  orderNumber: string;
  customerName?: string;
}

export const WalletPaymentCard: React.FC<WalletPaymentCardProps> = ({
  method,
  amountNpr,
  orderNumber,
  customerName
}) => {
  const wallet = WALLETS[method];
  const [qrMissing, setQrMissing] = useState(false);
  const amountText = `रू ${amountNpr.toLocaleString()}`;

  return (
    <div
      className="rounded-2xl border-2 p-4 sm:p-5 space-y-4 bg-white"
      style={{ borderColor: wallet.color }}
    >
      {/* 1. Wallet name */}
      <div className="flex items-center gap-2">
        <span
          className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-black"
          style={{ backgroundColor: wallet.color }}
        >
          {wallet.badge}
        </span>
        <h4 className="text-sm font-black text-[#0E2A23] whitespace-nowrap">Pay with {wallet.label}</h4>
        {customerName && (
          <span className="ml-auto text-[11px] text-[#4B635A] truncate">Order for {customerName}</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 items-start">
        {/* 2. QR code */}
        <div className="mx-auto sm:mx-0 w-48 h-48 rounded-xl border border-[#CBD5CF] bg-white p-2 flex items-center justify-center">
          {qrMissing ? (
            <p className="text-[11px] text-[#4B635A] text-center leading-relaxed px-2">
              QR image not available. Send the payment to the {wallet.label} ID shown here.
            </p>
          ) : (
            <img
              src={wallet.qrSrc}
              alt={`${wallet.label} QR – ${wallet.accountName} ${wallet.walletId}`}
              className="w-full h-full object-contain"
              onError={() => setQrMissing(true)}
            />
          )}
        </div>

        {/* 3–6. Name, ID, amount, order number */}
        <dl className="space-y-2.5 text-xs">
          <div>
            <dt className="text-[10px] uppercase font-bold text-gray-500">Name</dt>
            <dd className="font-bold text-[#0E2A23]">{wallet.accountName}</dd>
          </div>

          <div>
            <dt className="text-[10px] uppercase font-bold text-gray-500">{wallet.label} ID</dt>
            <dd className="flex items-center gap-2">
              <span className="font-mono text-lg font-black text-[#0E2A23] tracking-wide">{wallet.walletId}</span>
              <CopyButton value={wallet.walletId} label={`${wallet.label} ID`} />
            </dd>
          </div>

          <div>
            <dt className="text-[10px] uppercase font-bold text-gray-500">Amount to pay</dt>
            <dd className="flex items-center gap-2">
              <span className="font-mono text-lg font-black text-[#0E2A23]">{amountText}</span>
              <CopyButton value={String(amountNpr)} label="amount" />
            </dd>
          </div>

          <div className="bg-amber-50 border border-amber-300 rounded-xl p-2.5">
            <dt className="text-[10px] uppercase font-bold text-amber-900">
              Order Number — write this in the remarks
            </dt>
            <dd className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-lg font-black text-amber-950 tracking-wide">{orderNumber}</span>
              <CopyButton value={orderNumber} label="order number" />
            </dd>
          </div>
        </dl>
      </div>

      {/* 7. Steps */}
      <div className="border-t border-[#E4EBE7] pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] text-[#10241E]">
        <div>
          <h5 className="font-bold text-[#0E2A23] mb-1">How to pay</h5>
          <ol className="list-decimal pl-4 space-y-0.5 leading-relaxed">
            <li>Open the {wallet.label} app.</li>
            <li>Scan the QR code above (or search for ID {wallet.walletId}).</li>
            <li>Enter the exact amount: {amountText}.</li>
            <li>In the remarks, write the Order Number: <strong className="font-mono">{orderNumber}</strong>.</li>
            <li>Complete the payment.</li>
            <li>Keep the screenshot until your order is confirmed.</li>
          </ol>
        </div>
        <div lang="ne">
          <h5 className="font-bold text-[#0E2A23] mb-1">कसरी भुक्तानी गर्ने</h5>
          <ol className="list-decimal pl-4 space-y-0.5 leading-relaxed">
            <li>{wallet.label} एप खोल्नुहोस्।</li>
            <li>माथिको QR स्क्यान गर्नुहोस्।</li>
            <li>सही रकम हाल्नुहोस्: {amountText}।</li>
            <li>Remarks मा Order Number लेख्नुहोस्।</li>
            <li>भुक्तानी पूरा गर्नुहोस्।</li>
          </ol>
        </div>
      </div>

      {/* Notes */}
      <div className="flex items-start gap-2 bg-[#F7F9F8] border border-[#CBD5CF] rounded-xl p-3 text-[11px] text-[#3F574D] leading-relaxed">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p>
            Prices shown are approximate. Please confirm the current price and any running offers before making payment.
          </p>
          <p>
            Payment goes to the personal {wallet.label} wallet shown. Your order stays pending until we check
            the payment by hand. This is not an automatic payment gateway.
          </p>
        </div>
      </div>
    </div>
  );
};
