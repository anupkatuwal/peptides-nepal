import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Order, OrderStatus, PaymentStatus } from '../types';
import { BRAND_IMAGES } from '../assets/productImages';
import { 
  SlidersHorizontal, 
  Package, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Mail,
  ShieldCheck,
  Search,
  Filter,
  Download,
  MessageSquare,
  ExternalLink
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { 
    products, 
    orders, 
    messages, 
    updateProduct, 
    addProduct, 
    deleteProduct, 
    updateOrderStatus, 
    updatePaymentStatus, 
    markMessageRead,
    navigateTo 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'messages'>('orders');
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProductModalOpen, setNewProductModalOpen] = useState(false);

  // Form state for creating product
  const [newName, setNewName] = useState('');
  const [newBrand, setNewBrand] = useState('Denik');
  const [newPrice, setNewPrice] = useState(6200);
  const [newStock, setNewStock] = useState(25);
  const [newPurity, setNewPurity] = useState(99.6);
  const [newBatch, setNewBatch] = useState('DEL-DNK-');
  const [newCategory, setNewCategory] = useState<'recovery' | 'metabolic' | 'longevity' | 'supplies'>('recovery');
  const [newMg, setNewMg] = useState(5);
  const [newImage, setNewImage] = useState(BRAND_IMAGES.denik);
  const [newDesc, setNewDesc] = useState('');

  // Admin Passkey Authentication Gate
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('pn_admin_auth') === 'true';
  });
  const [passkeyInput, setPasskeyInput] = useState('');
  const [passkeyError, setPasskeyError] = useState('');

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const validKeys = ['nepal2026', 'peptides2026', 'admin123', 'PN-2026'];
    if (validKeys.includes(passkeyInput.trim().toLowerCase())) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('pn_admin_auth', 'true');
      setPasskeyError('');
    } else {
      setPasskeyError('Invalid admin security passkey. Please re-enter.');
    }
  };

  const handleLockAdmin = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('pn_admin_auth');
  };

  // Metrics
  const totalRevenueInr = orders
    .filter(o => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + (o.totalInr || Math.round(o.totalNpr / 1.6)), 0);

  const totalRevenueNpr = Math.round(totalRevenueInr * 1.6);

  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'processing' || o.orderStatus === 'pending').length;
  const unreadMessagesCount = messages.filter(m => !m.isRead).length;

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'all') return true;
    return o.orderStatus === orderFilter;
  });

  // Feature 2: Export Orders to CSV / Excel for accounting & courier slips
  const exportOrdersCSV = () => {
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Email',
      'Phone',
      'Address',
      'City',
      'District',
      'Items',
      'Total INR',
      'Total NPR',
      'Payment Method',
      'Payment Status',
      'Delivery Status',
      'Tracking Number',
      'Transaction Ref'
    ];

    const rows = orders.map(o => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toLocaleDateString()}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.email}"`,
      `"${o.phone}"`,
      `"${(o.address || '').replace(/"/g, '""')}"`,
      `"${o.city || ''}"`,
      `"${o.district || ''}"`,
      `"${o.items.map(i => `${i.productName} (x${i.quantity})`).join('; ').replace(/"/g, '""')}"`,
      o.totalInr || Math.round(o.totalNpr / 1.6),
      o.totalNpr,
      `"${o.paymentMethod}"`,
      `"${o.paymentStatus}"`,
      `"${o.orderStatus}"`,
      `"${o.trackingNumber || ''}"`,
      `"${o.transactionRef || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `peptides_nepal_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveProductEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const updated = {
      ...editingProduct,
      priceNpr: Math.round(editingProduct.priceInr * 1.6)
    };
    updateProduct(updated);
    setEditingProduct(null);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const priceInr = Number(newPrice);
    const newProd: Product = {
      id: `prod-${slug}-${Date.now().toString().slice(-4)}`,
      slug,
      name: newName,
      brand: newBrand || 'Denik',
      format: 'Lyophilized Vial & Box',
      scientificName: `${newName} Laboratory Reagent`,
      category: newCategory,
      categoryLabel: newCategory.toUpperCase(),
      priceInr,
      priceNpr: Math.round(priceInr * 1.6),
      vialOptions: [{ mg: Number(newMg), label: `${newMg}mg Lyophilized Vial`, priceInr, priceNpr: Math.round(priceInr * 1.6) }],
      defaultVialMg: Number(newMg),
      inStock: true,
      stockCount: Number(newStock),
      purityPercent: Number(newPurity),
      batchNumber: newBatch,
      deliveryTimeline: '10–14 days',
      sourcePartner: 'Delhi Peptides Partner Company',
      shortDesc: newDesc || `${newBrand} ${newName} analytical grade research peptide.`,
      description: newDesc || `${newBrand} authentic laboratory packaging with one-time verification security code. Sourced directly from Delhi partner network for Nepal delivery.`,
      highlights: [
        `${newBrand} authentic packaging & batch trace`,
        '≥99.5% HPLC certified analytical purity',
        'One-time scratch verification code on box',
        '10 to 14 days delivery across Nepal'
      ],
      reconstitutionWaterMl: 2.0,
      storageInstructions: 'Store refrigerated at 2°C–8°C.',
      reconstitutionInstructions: 'Mix gently with sterile Bacteriostatic Water.',
      dosageExample: 'Research only',
      rating: 5.0,
      reviewsCount: 1,
      image: newImage || BRAND_IMAGES.denik
    };

    addProduct(newProd);
    setNewProductModalOpen(false);
    setNewName('');
    setNewDesc('');
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
        <div className="bg-white rounded-3xl p-8 border border-[#DCE3CE] shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#707E46]">
              Store Manager Access
            </span>
            <h2 className="text-2xl font-black text-[#3E481D] tracking-tight">
              Admin Authentication
            </h2>
            <p className="text-xs text-[#707E46]">
              Enter the authorized administrator passkey to view customer orders and manage store inventory.
            </p>
          </div>

          <form onSubmit={handleUnlockAdmin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter Admin Passkey (e.g. nepal2026)"
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                className="w-full p-3.5 bg-[#F4F4EA] border border-[#DCE3CE] rounded-2xl text-center text-sm font-bold text-[#3E481D] focus:outline-none focus:border-[#3E481D]"
                autoFocus
              />
              {passkeyError && (
                <p className="text-xs text-red-600 mt-2 font-medium">{passkeyError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#3E481D] hover:bg-[#2C3414] text-white text-xs font-bold transition-all shadow-sm"
            >
              Unlock Administration Console
            </button>
          </form>

          <div className="pt-2 border-t border-[#F0F0E0]">
            <button
              type="button"
              onClick={() => navigateTo('shop')}
              className="text-xs text-[#707E46] hover:text-[#3E481D] font-bold"
            >
              ← Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Admin Title */}
      <div className="border-b border-[#DCE3CE] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" />
              <span>Peptides Nepal Administration Console</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>Live Firestore Cloud Sync Active</span>
            </div>
          </div>
          <h1 className="text-3xl font-black text-[#3E481D] tracking-tight mt-1">
            Store &amp; Inventory Management
          </h1>
          <p className="text-xs text-[#707E46] mt-0.5">
            Customer orders and product catalog inventory synchronize instantly in real-time across all devices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLockAdmin}
            className="px-3.5 py-2 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-red-700 hover:bg-red-100"
            title="Lock the console"
          >
            Lock Console
          </button>
          <button
            onClick={() => navigateTo('shop')}
            className="px-4 py-2 rounded-full bg-white border border-[#B7C29E] text-xs font-bold text-[#3E481D] hover:bg-[#F4F4EA]"
          >
            View Live Storefront →
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#DCE3CE] shadow-xs space-y-1">
          <span className="text-xs text-[#707E46] font-medium flex items-center justify-between">
            <span>Total Sales Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </span>
          <strong className="text-2xl font-black text-[#3E481D] block">
            रू {totalRevenueNpr.toLocaleString()}
          </strong>
          <span className="text-[11px] text-emerald-700 font-semibold">Across all Nepal regions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE3CE] shadow-xs space-y-1">
          <span className="text-xs text-[#707E46] font-medium flex items-center justify-between">
            <span>Total Orders</span>
            <Package className="w-4 h-4 text-blue-600" />
          </span>
          <strong className="text-2xl font-black text-[#3E481D] block">
            {orders.length}
          </strong>
          <span className="text-[11px] text-amber-700 font-semibold">{pendingOrdersCount} pending dispatch</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE3CE] shadow-xs space-y-1">
          <span className="text-xs text-[#707E46] font-medium flex items-center justify-between">
            <span>Active Catalog Items</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </span>
          <strong className="text-2xl font-black text-[#3E481D] block">
            {products.length}
          </strong>
          <span className="text-[11px] text-gray-500 font-medium">All HPLC batch linked</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE3CE] shadow-xs space-y-1">
          <span className="text-xs text-[#707E46] font-medium flex items-center justify-between">
            <span>Customer Inquiries</span>
            <Mail className="w-4 h-4 text-amber-600" />
          </span>
          <strong className="text-2xl font-black text-[#3E481D] block">
            {messages.length}
          </strong>
          <span className="text-[11px] text-amber-700 font-semibold">{unreadMessagesCount} unread</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#DCE3CE] gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-[#3E481D] text-[#3E481D] bg-white rounded-t-xl'
              : 'border-transparent text-[#707E46] hover:text-[#3E481D]'
          }`}
        >
          Customer Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-[#3E481D] text-[#3E481D] bg-white rounded-t-xl'
              : 'border-transparent text-[#707E46] hover:text-[#3E481D]'
          }`}
        >
          Product &amp; Pricing Inventory ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'messages'
              ? 'border-[#3E481D] text-[#3E481D] bg-white rounded-t-xl'
              : 'border-transparent text-[#707E46] hover:text-[#3E481D]'
          }`}
        >
          Inquiries &amp; Messages ({messages.length})
        </button>
      </div>

      {/* ── TAB 1: ORDERS MANAGEMENT ── */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-[#DCE3CE] overflow-hidden shadow-xs space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#3E481D]">Customer Orders</h2>
              <p className="text-xs text-[#707E46]">Real-time synchronized with Google Firebase Firestore.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Feature 2: Export Orders to CSV / Excel */}
              <button
                onClick={exportOrdersCSV}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold hover:bg-emerald-100 flex items-center gap-1.5 text-xs transition-colors shrink-0 shadow-xs"
                title="Download all customer orders as CSV/Excel for accounting and courier dispatch"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV (Excel)</span>
              </button>

              {/* Filter buttons */}
              <div className="flex gap-1 overflow-x-auto text-xs">
                {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-colors ${
                      orderFilter === st
                        ? 'bg-[#3E481D] text-white'
                        : 'bg-[#F4F4EA] text-[#3E481D] hover:bg-[#EAEBD9]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DCE3CE] text-[#707E46] bg-[#F8FAF5]">
                  <th className="p-3 font-bold">Order #</th>
                  <th className="p-3 font-bold">Customer</th>
                  <th className="p-3 font-bold">Destination</th>
                  <th className="p-3 font-bold">Items</th>
                  <th className="p-3 font-bold">Total</th>
                  <th className="p-3 font-bold">Payment</th>
                  <th className="p-3 font-bold">Delivery Status</th>
                  <th className="p-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#F9FAF5] transition-colors">
                    <td className="p-3 font-mono font-bold text-[#3E481D]">
                      {o.orderNumber}
                      <span className="block text-[10px] text-gray-400 font-normal">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-3">
                      <strong className="block text-gray-800">{o.customerName}</strong>
                      <span className="text-gray-500 font-mono text-[11px]">{o.phone}</span>
                    </td>
                    <td className="p-3">
                      <p className="text-gray-700 max-w-xs truncate">{o.address}</p>
                      <span className="text-[10px] text-gray-500 font-bold">{o.city}, {o.district}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-gray-800">{o.items.length} items</span>
                      <p className="text-[10px] text-gray-400 truncate max-w-xs">
                        {o.items.map(i => i.productName).join(', ')}
                      </p>
                    </td>
                    <td className="p-3 font-bold text-gray-900 whitespace-nowrap">
                      रू {o.totalNpr.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        o.paymentStatus === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.paymentMethod} ({o.paymentStatus})
                      </span>
                      {o.transactionRef && (
                        <span className="block font-mono text-[9px] text-gray-400 mt-0.5">
                          {o.transactionRef}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                        className="px-2 py-1 text-[11px] font-bold rounded-lg border border-gray-200 bg-[#F4F4EA] text-[#3E481D]"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <a
                        href={`https://wa.me/977${o.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Namaste ${o.customerName}! 🔬 Peptides Nepal here regarding your Order #${o.orderNumber}.\nStatus: ${o.orderStatus.toUpperCase()}.\nItems: ${o.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}.\nTotal: रू ${o.totalNpr.toLocaleString()} (₹${o.totalInr} INR).\nTracking Code: ${o.trackingNumber || 'Pending dispatch'}.\nDelivery address: ${o.address}, ${o.city}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#25D366]/20 text-[#1EBE5D] hover:bg-[#25D366] hover:text-white border border-[#25D366]/40 font-bold text-[11px] transition-colors"
                        title="Chat with customer on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: PRODUCT MANAGEMENT ── */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-[#DCE3CE] p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#F0F0E0] pb-4">
            <div>
              <h2 className="text-base font-bold text-[#3E481D]">Catalog Inventory</h2>
              <p className="text-xs text-[#707E46]">Edit prices in NPR, update live stock count, and manage HPLC batch numbers.</p>
            </div>
            <button
              onClick={() => setNewProductModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#3E481D] text-white text-xs font-bold hover:bg-[#2A3312] flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Peptide</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DCE3CE] text-[#707E46] bg-[#F8FAF5]">
                  <th className="p-3 font-bold">Peptide Name</th>
                  <th className="p-3 font-bold">Category</th>
                  <th className="p-3 font-bold">Price (NPR)</th>
                  <th className="p-3 font-bold">Stock</th>
                  <th className="p-3 font-bold">HPLC Purity</th>
                  <th className="p-3 font-bold">Batch Code</th>
                  <th className="p-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F9FAF5]">
                    <td className="p-3 font-bold text-[#3E481D]">
                      {p.name}
                      <span className="block text-[10px] text-gray-400 font-normal">{p.scientificName}</span>
                    </td>
                    <td className="p-3 uppercase text-[10px] font-bold text-[#707E46]">
                      {p.category}
                    </td>
                    <td className="p-3 font-bold text-gray-900">
                      रू {p.priceNpr.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.stockCount > 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {p.stockCount} units
                      </span>
                    </td>
                    <td className="p-3 font-bold text-emerald-700">
                      {p.purityPercent}%
                    </td>
                    <td className="p-3 font-mono text-[11px] text-gray-600">
                      {p.batchNumber}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="p-1 text-gray-500 hover:text-[#3E481D] hover:bg-gray-100 rounded"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: CUSTOMER INQUIRIES ── */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-3xl border border-[#DCE3CE] p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#3E481D] border-b border-[#F0F0E0] pb-3">
            Inquiries Received via Contact Form
          </h2>

          <div className="space-y-3">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`p-4 rounded-2xl border transition-colors space-y-2 ${
                  m.isRead ? 'bg-white border-[#DCE3CE]' : 'bg-amber-50/40 border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#3E481D]">{m.name}</span>
                    <span className="text-gray-400 ml-2">({m.email} · {m.phone})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                    {!m.isRead && (
                      <button
                        onClick={() => markMessageRead(m.id)}
                        className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full hover:bg-amber-200"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>

                <p className="font-bold text-xs text-gray-800">{m.subject}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{m.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 border border-gray-200 shadow-2xl">
            <h3 className="text-lg font-bold text-[#3E481D]">Edit Peptide Details</h3>

            <form onSubmit={handleSaveProductEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#3E481D] mb-1">Product Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full p-2.5 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#3E481D] mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full p-2.5 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#3E481D] mb-1">Packaging Image URL</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, image: BRAND_IMAGES.denik })}
                    className="px-2 py-1 bg-[#F4F4EA] hover:bg-[#EAEBD9] rounded-lg border border-[#DCE3CE] text-[10px] font-bold"
                  >
                    Denik
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, image: BRAND_IMAGES.enhancedPharma })}
                    className="px-2 py-1 bg-[#F4F4EA] hover:bg-[#EAEBD9] rounded-lg border border-[#DCE3CE] text-[10px] font-bold"
                  >
                    Enhanced Pharma
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, image: BRAND_IMAGES.goldBond })}
                    className="px-2 py-1 bg-[#F4F4EA] hover:bg-[#EAEBD9] rounded-lg border border-[#DCE3CE] text-[10px] font-bold"
                  >
                    Gold Bond Rado
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, image: BRAND_IMAGES.ghrpKit })}
                    className="px-2 py-1 bg-[#F4F4EA] hover:bg-[#EAEBD9] rounded-lg border border-[#DCE3CE] text-[10px] font-bold"
                  >
                    GHRP 10-Kit
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, image: BRAND_IMAGES.peptideSciences })}
                    className="px-2 py-1 bg-[#F4F4EA] hover:bg-[#EAEBD9] rounded-lg border border-[#DCE3CE] text-[10px] font-bold"
                  >
                    Peptide Sciences
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, image: BRAND_IMAGES.supplies })}
                    className="px-2 py-1 bg-[#F4F4EA] hover:bg-[#EAEBD9] rounded-lg border border-[#DCE3CE] text-[10px] font-bold"
                  >
                    Sterile Supplies
                  </button>
                </div>
                <input
                  type="text"
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  className="w-full p-2.5 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#3E481D] mb-1">Price (NPR)</label>
                  <input
                    type="number"
                    value={editingProduct.priceNpr}
                    onChange={(e) => setEditingProduct({ ...editingProduct, priceNpr: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#3E481D] mb-1">Stock Count</label>
                  <input
                    type="number"
                    value={editingProduct.stockCount}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockCount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#3E481D] mb-1">HPLC Purity (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingProduct.purityPercent}
                    onChange={(e) => setEditingProduct({ ...editingProduct, purityPercent: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#3E481D] mb-1">Batch Code</label>
                  <input
                    type="text"
                    value={editingProduct.batchNumber}
                    onChange={(e) => setEditingProduct({ ...editingProduct, batchNumber: e.target.value })}
                    className="w-full p-2.5 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#3E481D] text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Product Modal */}
      {newProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 border border-gray-200 shadow-2xl">
            <h3 className="text-lg font-bold text-[#3E481D]">Add New Peptide Product</h3>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#3E481D] mb-1">Peptide Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. BPC-157 or MOTS-c"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-2.5 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#3E481D] mb-1">Brand Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Denik, Enhanced, Gold Bond"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full p-2.5 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-[#3E481D]">Select Product Packaging Photo Preset</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  <button
                    type="button"
                    onClick={() => { setNewImage(BRAND_IMAGES.denik); setNewBrand('Denik'); }}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      newImage === BRAND_IMAGES.denik ? 'border-[#3E481D] bg-[#EAEBD9] font-bold' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <img src={BRAND_IMAGES.denik} alt="Denik" className="w-12 h-12 object-cover mx-auto rounded-lg mb-1" />
                    <span className="block text-[10px]">Denik Vial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setNewImage(BRAND_IMAGES.enhancedPharma); setNewBrand('Enhanced Pharma'); }}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      newImage === BRAND_IMAGES.enhancedPharma ? 'border-[#3E481D] bg-[#EAEBD9] font-bold' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <img src={BRAND_IMAGES.enhancedPharma} alt="Enhanced" className="w-12 h-12 object-cover mx-auto rounded-lg mb-1" />
                    <span className="block text-[10px]">Enhanced Box</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setNewImage(BRAND_IMAGES.goldBond); setNewBrand('Gold Bond'); }}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      newImage === BRAND_IMAGES.goldBond ? 'border-[#3E481D] bg-[#EAEBD9] font-bold' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <img src={BRAND_IMAGES.goldBond} alt="Gold Bond" className="w-12 h-12 object-cover mx-auto rounded-lg mb-1" />
                    <span className="block text-[10px]">Gold Bond Rado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setNewImage(BRAND_IMAGES.ghrpKit); setNewBrand('Anabolic Monster'); }}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      newImage === BRAND_IMAGES.ghrpKit ? 'border-[#3E481D] bg-[#EAEBD9] font-bold' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <img src={BRAND_IMAGES.ghrpKit} alt="GHRP Kit" className="w-12 h-12 object-cover mx-auto rounded-lg mb-1" />
                    <span className="block text-[10px]">Complete Kit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setNewImage(BRAND_IMAGES.peptideSciences); setNewBrand('Peptide Sciences'); }}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      newImage === BRAND_IMAGES.peptideSciences ? 'border-[#3E481D] bg-[#EAEBD9] font-bold' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <img src={BRAND_IMAGES.peptideSciences} alt="Peptide Sciences" className="w-12 h-12 object-cover mx-auto rounded-lg mb-1" />
                    <span className="block text-[10px]">Peptide Sciences</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setNewImage(BRAND_IMAGES.supplies); setNewBrand('Medical Supplies Tier'); }}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      newImage === BRAND_IMAGES.supplies ? 'border-[#3E481D] bg-[#EAEBD9] font-bold' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <img src={BRAND_IMAGES.supplies} alt="Supplies" className="w-12 h-12 object-cover mx-auto rounded-lg mb-1" />
                    <span className="block text-[10px]">Sterile Supplies</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#3E481D] mb-1">Price (INR) *</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl font-bold"
                    required
                  />
                  <span className="text-[10px] text-gray-500 font-medium">~ रू {Math.round(newPrice * 1.6)} NPR</span>
                </div>

                <div>
                  <label className="block font-bold text-[#3E481D] mb-1">Vial Mg / IU</label>
                  <input
                    type="number"
                    value={newMg}
                    onChange={(e) => setNewMg(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#3E481D] mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl font-bold"
                  >
                    <option value="recovery">Recovery &amp; Tissue</option>
                    <option value="metabolic">Metabolic &amp; GLP-1</option>
                    <option value="longevity">Longevity &amp; Skin</option>
                    <option value="supplies">Supplies &amp; Water</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#3E481D] mb-1">Stock Count</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#3E481D] mb-1">Batch Code</label>
                  <input
                    type="text"
                    value={newBatch}
                    onChange={(e) => setNewBatch(e.target.value)}
                    className="w-full p-2.5 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#3E481D] mb-1">Brief Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Preclinical properties and summary..."
                  className="w-full p-2.5 bg-[#F4F4EA] border border-[#DCE3CE] rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#3E481D] text-white font-bold"
                >
                  Create &amp; Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
