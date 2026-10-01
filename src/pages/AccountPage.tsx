import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { User, Package, MapPin, Phone, Mail, Clock, Search, LogOut, ArrowRight, ShieldCheck } from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { currentUser, orders, logout, navigateTo, switchUserRole } = useStore();
  const [trackInput, setTrackInput] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [trackError, setTrackError] = useState('');

  // Orders matching current user email or demo orders
  const userOrders = orders.filter(
    o => o.email.toLowerCase() === currentUser?.email.toLowerCase() || currentUser?.role === 'admin'
  );

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackInput.trim()) return;
    const found = orders.find(
      o => o.orderNumber.toLowerCase() === trackInput.trim().toLowerCase() ||
           o.trackingNumber.toLowerCase() === trackInput.trim().toLowerCase()
    );
    if (found) {
      setTrackedOrder(found);
      setTrackError('');
    } else {
      setTrackError(`No order found matching "${trackInput}".`);
      setTrackedOrder(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Page Header */}
      <div className="border-b border-[#DCE3CE] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#707E46]">
            Customer Portal
          </span>
          <h1 className="text-3xl font-black text-[#3E481D] tracking-tight mt-1">
            My Account &amp; Order History
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={logout}
            className="px-3.5 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold hover:bg-red-100 flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Profile & Track Widget */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* User Profile Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#DCE3CE] shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#3E481D] text-white flex items-center justify-center font-black text-xl">
                {currentUser?.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-base text-[#3E481D]">{currentUser?.name}</h3>
                <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {currentUser?.role === 'admin' ? 'Administrator' : 'Verified Customer'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#5f6b3a] pt-3 border-t border-[#F0F0E0]">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#707E46]" />
                <span>{currentUser?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#707E46]" />
                <span>{currentUser?.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#707E46]" />
                <span>{currentUser?.address || 'Kathmandu, Nepal'}</span>
              </div>
            </div>
          </div>

          {/* Instant Order Tracker */}
          <div className="bg-[#EAEBD9] rounded-3xl p-6 border border-[#DCE3CE] space-y-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#3E481D]" />
              <h3 className="font-bold text-sm text-[#3E481D]">Track an Order</h3>
            </div>
            <p className="text-xs text-[#5f6b3a]">
              Enter your PN order number or courier tracking code:
            </p>

            <form onSubmit={handleTrack} className="space-y-2">
              <input
                type="text"
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value)}
                placeholder="e.g. PN-84291 or NP-KTM-7482"
                className="w-full p-2.5 bg-white border border-[#DCE3CE] rounded-xl text-xs font-mono font-bold text-[#3E481D] focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#3E481D] text-white text-xs font-bold hover:bg-[#2A3312] transition-colors"
              >
                Track Status
              </button>
            </form>

            {trackError && (
              <p className="text-xs text-red-600 font-medium">{trackError}</p>
            )}

            {trackedOrder && (
              <div className="bg-white p-3.5 rounded-xl border border-[#DCE3CE] text-xs space-y-1.5 animate-in fade-in">
                <div className="flex justify-between font-bold text-[#3E481D]">
                  <span>{trackedOrder.orderNumber}</span>
                  <span className="capitalize text-emerald-700">{trackedOrder.orderStatus}</span>
                </div>
                <p className="text-gray-500">Tracking: {trackedOrder.trackingNumber}</p>
                <p className="text-gray-500">Total: रू {trackedOrder.totalNpr.toLocaleString()}</p>
              </div>
            )}
          </div>

        </div>

        {/* Right Orders List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#3E481D]">
              Recent Orders ({userOrders.length})
            </h2>
            <button
              onClick={() => navigateTo('shop')}
              className="text-xs font-bold text-[#3E481D] hover:underline"
            >
              Order More Peptides →
            </button>
          </div>

          {userOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#DCE3CE] space-y-3">
              <Package className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="font-bold text-sm text-[#3E481D]">No orders placed yet</p>
              <button
                onClick={() => navigateTo('shop')}
                className="px-5 py-2.5 rounded-full bg-[#3E481D] text-white text-xs font-bold"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 border border-[#DCE3CE] shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0F0E0] pb-3">
                    <div>
                      <span className="text-base font-black font-mono text-[#3E481D]">
                        {order.orderNumber}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        order.orderStatus === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                      <span className="text-xs font-mono font-semibold text-gray-500 bg-[#F4F4EA] px-2 py-0.5 rounded">
                        {order.trackingNumber}
                      </span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="divide-y divide-gray-50 text-xs">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-2 flex justify-between">
                        <span className="font-medium text-[#3E481D]">
                          {item.productName} × {item.quantity}
                        </span>
                        <span className="font-bold text-gray-700">
                          रू {(item.totalNpr ?? Math.round(item.totalInr * 1.6)).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="border-t border-[#F0F0E0] pt-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-gray-400">Total Paid: </span>
                      <strong className="text-sm font-bold text-[#3E481D]">
                        रू {order.totalNpr.toLocaleString()}
                      </strong>
                      <span className="ml-2 text-gray-500 uppercase">({order.paymentMethod})</span>
                    </div>

                    <button
                      onClick={() => navigateTo('order-confirmation', { order })}
                      className="text-xs font-bold text-[#3E481D] hover:underline"
                    >
                      View Receipt Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
