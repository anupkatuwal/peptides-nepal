import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  Product, 
  CartItem, 
  Order, 
  OrderStatus, 
  PaymentStatus, 
  BatchCOA, 
  GuideItem, 
  QuizQuestion, 
  User, 
  ContactMessage 
} from '../types';
import { getBrandImage } from '../assets/productImages';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_COAS, 
  INITIAL_GUIDES, 
  INITIAL_QUIZ, 
  INITIAL_ORDERS, 
  DEMO_USERS 
} from '../data/initialData';

interface StoreContextType {
  products: Product[];
  updateProduct: (product: Product) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  
  cart: CartItem[];
  addToCart: (product: Product, vialMg: number, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartDeliveryFee: number;
  cartDiscount: number;
  cartTotal: number;
  cartSubtotalInr: number;
  cartDeliveryFeeInr: number;
  cartDiscountInr: number;
  cartTotalInr: number;
  cartSubtotalNpr: number;
  cartTotalNpr: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  couponCode: string;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  
  orders: Order[];
  placeOrder: (orderData: {
    customerName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    deliveryNotes?: string;
    paymentMethod: Order['paymentMethod'];
    transactionRef?: string;
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updatePaymentStatus: (orderId: string, status: PaymentStatus, txnRef?: string) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getOrderByNumber: (orderNumber: string) => Order | undefined;
  
  coas: BatchCOA[];
  getCOAByBatch: (batchNumber: string) => BatchCOA | undefined;
  
  guides: GuideItem[];
  quizQuestions: QuizQuestion[];
  
  currentUser: User | null;
  login: (email: string, role?: 'customer' | 'admin') => boolean;
  logout: () => void;
  register: (name: string, email: string, phone: string, address?: string) => void;
  switchUserRole: (role: 'customer' | 'admin') => void;
  
  messages: ContactMessage[];
  sendMessage: (msg: { name: string; email: string; phone: string; subject: string; message: string }) => void;
  markMessageRead: (id: string) => void;
  
  currentView: string;
  selectedProductSlug: string | null;
  selectedGuideId: string | null;
  selectedBatch: string | null;
  lastOrder: Order | null;
  navigateTo: (view: string, params?: { slug?: string; id?: string; batch?: string; order?: Order }) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products - V9 with verified authentic Brand Packshots (Gold Bond Rado, Denik, Enhanced, GHRP Kits, etc.)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('pn_products_v9_brand_images');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_PRODUCTS.length) {
          return parsed.map((p: Product) => ({
            ...p,
            image: (!p.image || p.image.includes('unsplash')) 
              ? getBrandImage(p.brand, p.name, p.category) 
              : p.image
          }));
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_PRODUCTS;
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('pn_cart_v3');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [flatDiscountInr, setFlatDiscountInr] = useState<number>(0);

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('pn_orders_v3');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // COAs
  const [coas] = useState<BatchCOA[]>(INITIAL_COAS);
  // Guides & Quiz
  const [guides] = useState<GuideItem[]>(INITIAL_GUIDES);
  const [quizQuestions] = useState<QuizQuestion[]>(INITIAL_QUIZ);

  // User Auth
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pn_user');
    return saved ? JSON.parse(saved) : DEMO_USERS[0];
  });

  // Contact Messages
  const [messages, setMessages] = useState<ContactMessage[]>(() => {
    const saved = localStorage.getItem('pn_messages');
    return saved ? JSON.parse(saved) : [
      {
        id: 'msg-1',
        name: 'Suman Adhikari',
        email: 'suman@example.com',
        phone: '9841000000',
        subject: 'BPC-157 delivery from Delhi to Pokhara',
        message: 'Namaste! Does the 10-14 day delivery window include cold chain packaging all the way from Delhi?',
        createdAt: '2026-09-27T08:00:00Z',
        isRead: false
      }
    ];
  });

  // Navigation
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('pn_products_v9_brand_images', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pn_cart_v3', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('pn_orders_v3', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('pn_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('pn_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('pn_user');
    }
  }, [currentUser]);

  // Real-Time Firebase Firestore Synchronization
  useEffect(() => {
    // 1. Sync Orders Collection across all devices
    let unsubscribeOrders: (() => void) | undefined;
    try {
      const ordersCol = collection(db, 'orders');
      unsubscribeOrders = onSnapshot(ordersCol, (snapshot) => {
        if (!snapshot.empty) {
          const remoteOrders: Order[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Order;
            if (data && data.id) {
              remoteOrders.push(data);
            }
          });
          if (remoteOrders.length > 0) {
            remoteOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(remoteOrders);
          }
        }
      }, (err) => {
        console.warn('Orders Firestore sync note:', err.message);
      });
    } catch (e) {
      console.warn('Could not initialize orders listener:', e);
    }

    // 2. Sync Products / Inventory Collection across all devices
    let unsubscribeProducts: (() => void) | undefined;
    try {
      const productsCol = collection(db, 'products');
      unsubscribeProducts = onSnapshot(productsCol, (snapshot) => {
        if (!snapshot.empty) {
          const remoteProducts: Product[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Product;
            if (data && data.id) {
              remoteProducts.push(data);
            }
          });
          if (remoteProducts.length > 0) {
            const normalized = remoteProducts.map(p => ({
              ...p,
              image: (!p.image || p.image.includes('unsplash')) 
                ? getBrandImage(p.brand, p.name, p.category) 
                : p.image
            }));
            setProducts(normalized);
          }
        } else {
          // Initialize first-time products to Firestore cloud if empty
          INITIAL_PRODUCTS.forEach(async (p) => {
            try {
              await setDoc(doc(db, 'products', p.id), p);
            } catch (err) {
              // ignore offline/quota errors
            }
          });
        }
      }, (err) => {
        console.warn('Products Firestore sync note:', err.message);
      });
    } catch (e) {
      console.warn('Could not initialize products listener:', e);
    }

    // 3. Sync Messages Collection across all devices
    let unsubscribeMessages: (() => void) | undefined;
    try {
      const messagesCol = collection(db, 'messages');
      unsubscribeMessages = onSnapshot(messagesCol, (snapshot) => {
        if (!snapshot.empty) {
          const remoteMsgs: ContactMessage[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as ContactMessage;
            if (data && data.id) {
              remoteMsgs.push(data);
            }
          });
          if (remoteMsgs.length > 0) {
            remoteMsgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setMessages(remoteMsgs);
          }
        }
      }, (err) => {
        console.warn('Messages Firestore sync note:', err.message);
      });
    } catch (e) {
      console.warn('Could not initialize messages listener:', e);
    }

    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeProducts) unsubscribeProducts();
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, []);

  // Handle URL hash navigation for deep linking
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;
      if (hash.startsWith('product/')) {
        const slug = hash.replace('product/', '');
        navigateTo('product-detail', { slug });
      } else if (hash.startsWith('guide/')) {
        const id = hash.replace('guide/', '');
        navigateTo('guide-detail', { id });
      } else if (hash.startsWith('batch/')) {
        const batch = hash.replace('batch/', '');
        navigateTo('lab-results', { batch });
      } else if (['shop', 'guides', 'lab-results', 'calculator', 'quiz', 'cart', 'checkout', 'account', 'admin', 'contact', 'privacy', 'support'].includes(hash)) {
        navigateTo(hash);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (view: string, params?: { slug?: string; id?: string; batch?: string; order?: Order }) => {
    setCurrentView(view);
    if (params?.slug) setSelectedProductSlug(params.slug);
    if (params?.id) setSelectedGuideId(params.id);
    if (params?.batch) setSelectedBatch(params.batch);
    if (params?.order) setLastOrder(params.order);

    try {
      if (view === 'product-detail' && params?.slug) {
        window.location.hash = `product/${params.slug}`;
      } else if (view !== 'home') {
        window.location.hash = view;
      } else if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } catch {
      // safe fallback
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Product management
  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    try {
      setDoc(doc(db, 'products', updated.id), updated).catch(err => console.warn('Product sync error:', err));
    } catch (e) {
      console.warn('Product sync error:', e);
    }
  };

  const addProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
    try {
      setDoc(doc(db, 'products', newProduct.id), newProduct).catch(err => console.warn('Product sync error:', err));
    } catch (e) {
      console.warn('Product sync error:', e);
    }
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      deleteDoc(doc(db, 'products', id)).catch(err => console.warn('Product delete error:', err));
    } catch (e) {
      console.warn('Product delete error:', e);
    }
  };

  // Cart operations
  const addToCart = (product: Product, vialMg: number, quantity: number = 1) => {
    const selectedOption = product.vialOptions.find(o => o.mg === vialMg) || product.vialOptions[0];
    const unitPriceInr = selectedOption ? selectedOption.priceInr : product.priceInr;
    const unitPriceNpr = selectedOption?.priceNpr || (product.priceNpr || Math.round(unitPriceInr * 1.6));
    const cartItemId = `${product.id}-${vialMg}`;

    setCart(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        return prev.map(item => 
          item.id === cartItemId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id: cartItemId,
            productId: product.id,
            product,
            selectedVialMg: vialMg,
            unitPriceInr,
            unitPriceNpr,
            quantity
          }
        ];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
    setDiscountPercent(0);
    setFlatDiscountInr(0);
  };

  const applyCoupon = (code: string) => {
    const cleaned = code.trim().toUpperCase();
    if (cleaned === 'NEPAL10') {
      setCouponCode('NEPAL10');
      setDiscountPercent(10);
      setFlatDiscountInr(0);
      return { success: true, message: '10% partner discount applied to your order!' };
    }
    if (cleaned === 'DELHI500' || cleaned === 'FIRSTORDER') {
      setCouponCode(cleaned);
      setDiscountPercent(0);
      setFlatDiscountInr(500);
      return { success: true, message: '₹ 500 INR flat partner discount applied!' };
    }
    return { success: false, message: 'Invalid promo code. Try NEPAL10 or DELHI500.' };
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountPercent(0);
    setFlatDiscountInr(0);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Pricing in INR (Primary & Fixed)
  const cartSubtotalInr = cart.reduce((sum, item) => sum + (item.unitPriceInr * item.quantity), 0);
  // Cross-border shipping + handling fee directly from Delhi partner company: Flat ₹ 4,500 INR (~ रू 7,200 NPR)
  const cartDeliveryFeeInr = cartSubtotalInr === 0 ? 0 : 4500;
  
  const percentDiscountAmountInr = Math.round((cartSubtotalInr * discountPercent) / 100);
  const cartDiscountInr = percentDiscountAmountInr + flatDiscountInr;
  const cartTotalInr = Math.max(0, cartSubtotalInr + cartDeliveryFeeInr - cartDiscountInr);

  // Aliases for compatibility
  const cartSubtotal = cartSubtotalInr;
  const cartDeliveryFee = cartDeliveryFeeInr;
  const cartDiscount = cartDiscountInr;
  const cartTotal = cartTotalInr;

  // NPR Conversions (Fixed 1.60 peg rate)
  const cartSubtotalNpr = Math.round(cartSubtotalInr * 1.6);
  const cartTotalNpr = Math.round(cartTotalInr * 1.6);

  // Orders
  const placeOrder = (orderData: {
    customerName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    deliveryNotes?: string;
    paymentMethod: Order['paymentMethod'];
    transactionRef?: string;
  }): Order => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `DEL-PN-${Date.now().toString().slice(-4)}${randomSuffix}`;
    const trackingNumber = `DEL-NP-${orderData.city.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderItems = cart.map(item => ({
      productId: item.productId,
      productName: `${item.product.name} (${item.selectedVialMg}mg)`,
      vialMg: item.selectedVialMg,
      unitPriceInr: item.unitPriceInr,
      unitPriceNpr: item.unitPriceNpr || Math.round(item.unitPriceInr * 1.6),
      quantity: item.quantity,
      totalInr: item.unitPriceInr * item.quantity,
      totalNpr: (item.unitPriceNpr || Math.round(item.unitPriceInr * 1.6)) * item.quantity
    }));

    const isDigitalPayment = orderData.paymentMethod === 'esewa' || orderData.paymentMethod === 'khalti';

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: orderData.customerName,
      email: orderData.email,
      phone: orderData.phone,
      address: orderData.address,
      city: orderData.city,
      district: orderData.district,
      deliveryNotes: orderData.deliveryNotes,
      items: orderItems,
      subtotalInr: cartSubtotalInr,
      deliveryFeeInr: cartDeliveryFeeInr,
      discountInr: cartDiscountInr,
      totalInr: cartTotalInr,
      subtotalNpr: cartSubtotalNpr,
      deliveryFeeNpr: Math.round(cartDeliveryFeeInr * 1.6),
      discountNpr: Math.round(cartDiscountInr * 1.6),
      totalNpr: cartTotalNpr,
      currency: 'INR',
      deliveryTimeline: '10–14 days (Transit from Delhi partner company)',
      paymentMethod: orderData.paymentMethod,
      paymentStatus: isDigitalPayment ? 'verified' : 'pending',
      orderStatus: 'processing',
      transactionRef: orderData.transactionRef || (isDigitalPayment ? `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}` : undefined),
      trackingNumber,
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);
    setLastOrder(newOrder);
    clearCart();

    // Persist to Firebase Firestore for multi-device live sync
    try {
      setDoc(doc(db, 'orders', newOrder.id), newOrder).catch(err => {
        console.warn('Firestore order sync warning:', err.message);
      });
    } catch (e) {
      console.warn('Firestore order sync error:', e);
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: status } : o));
    try {
      updateDoc(doc(db, 'orders', orderId), { orderStatus: status }).catch(err => {
        console.warn('Firestore order status sync warning:', err.message);
      });
    } catch (e) {
      console.warn('Firestore order status sync error:', e);
    }
  };

  const updatePaymentStatus = (orderId: string, status: PaymentStatus, txnRef?: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { 
      ...o, 
      paymentStatus: status,
      ...(txnRef ? { transactionRef: txnRef } : {})
    } : o));
    try {
      updateDoc(doc(db, 'orders', orderId), { 
        paymentStatus: status,
        ...(txnRef ? { transactionRef: txnRef } : {})
      }).catch(err => {
        console.warn('Firestore payment status sync warning:', err.message);
      });
    } catch (e) {
      console.warn('Firestore payment status sync error:', e);
    }
  };

  const getOrderById = (orderId: string) => orders.find(o => o.id === orderId);
  const getOrderByNumber = (orderNumber: string) => 
    orders.find(o => o.orderNumber.toLowerCase() === orderNumber.trim().toLowerCase());

  const getCOAByBatch = (batchNumber: string) => 
    coas.find(c => c.batchNumber.toLowerCase() === batchNumber.trim().toLowerCase());

  // Auth
  const login = (email: string, role?: 'customer' | 'admin') => {
    const existing = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setCurrentUser(existing);
      return true;
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email,
      phone: '98XXXXXXXX',
      role: role || (email.includes('admin') ? 'admin' : 'customer')
    };
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = (name: string, email: string, phone: string, address?: string) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone,
      role: 'customer',
      address
    };
    setCurrentUser(newUser);
  };

  const switchUserRole = (role: 'customer' | 'admin') => {
    const target = DEMO_USERS.find(u => u.role === role) || {
      id: `user-${role}`,
      name: role === 'admin' ? 'Anup Katuwal (Store Administrator)' : 'Verified Client',
      email: role === 'admin' ? 'katuwalanup@gmail.com' : 'katuwalanup@gmail.com',
      phone: '9808318864',
      role
    };
    setCurrentUser(target);
  };

  // Messages
  const sendMessage = (msg: { name: string; email: string; phone: string; subject: string; message: string }) => {
    const newMsg: ContactMessage = {
      id: `msg-${Date.now()}`,
      name: msg.name,
      email: msg.email,
      phone: msg.phone,
      subject: msg.subject,
      message: msg.message,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setMessages(prev => [newMsg, ...prev]);

    // Persist to Firestore
    try {
      setDoc(doc(db, 'messages', newMsg.id), newMsg).catch(err => {
        console.warn('Firestore message sync note:', err.message);
      });
    } catch (e) {
      console.warn('Firestore message sync error:', e);
    }
  };

  const markMessageRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
    try {
      updateDoc(doc(db, 'messages', id), { isRead: true }).catch(err => {
        console.warn('Firestore mark read sync note:', err.message);
      });
    } catch (e) {
      console.warn('Firestore mark read error:', e);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        updateProduct,
        addProduct,
        deleteProduct,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        cartDeliveryFee,
        cartDiscount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        couponCode,
        applyCoupon,
        removeCoupon,
        orders,
        placeOrder,
        updateOrderStatus,
        updatePaymentStatus,
        getOrderById,
        getOrderByNumber,
        coas,
        getCOAByBatch,
        guides,
        quizQuestions,
        currentUser,
        login,
        logout,
        register,
        switchUserRole,
        messages,
        sendMessage,
        markMessageRead,
        currentView,
        selectedProductSlug,
        selectedGuideId,
        selectedBatch,
        lastOrder,
        navigateTo
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
