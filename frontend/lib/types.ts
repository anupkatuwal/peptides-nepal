export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  product_count: number;
};

export type CategoryRef = Pick<Category, "id" | "name" | "slug">;

export type ProductSummary = {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock_level: number;
  purity_percentage: number | null;
  image_url: string | null;
  coa_image_url: string | null;
  category: CategoryRef;
};

export type ProductDetail = ProductSummary & {
  description: string;
  created_at: string;
};

export type ProductPage = {
  items: ProductSummary[];
  total: number;
  page: number;
  page_size: number;
};

export type User = {
  id: number;
  full_name: string;
  email: string;
  role: "Customer" | "Admin";
  created_at: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  user: User;
};

export type PaymentMethod = "eSewa" | "Khalti" | "COD";
export type PaymentStatus = "Unpaid" | "Initiated" | "Paid" | "Failed" | "Refunded";
export type DeliveryZone = "inside_valley" | "outside_valley";

export type DeliveryOptions = {
  options: { zone: DeliveryZone; label: string; fee: number }[];
  free_delivery_threshold: number | null;
};
export type OrderStatus = "Pending" | "Paid" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export type Order = {
  id: number;
  total_price: number;
  delivery_fee: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  order_date: string;
  shipping_name: string;
  phone: string;
  shipping_address: string;
  city: string;
  notes: string | null;
  items: {
    product_id: number;
    product_name: string;
    product_slug: string;
    quantity: number;
    unit_price: number;
  }[];
};

export type CartLine = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  maxQuantity: number;
};

export type AdminOrder = Order & {
  customer_name: string;
  customer_email: string;
  payment_reference: string | null;
  paid_at: string | null;
};

export type AdminProduct = ProductDetail & { is_active: boolean };

export type AdminSummary = {
  orders_by_status: Partial<Record<OrderStatus, number>>;
  revenue_30d: number;
  orders_30d: number;
  unread_messages: number;
  low_stock: AdminProduct[];
  missing_lab_results: number;
};

export type ContactMessage = {
  id: number;
  sender_name: string;
  sender_email: string;
  subject: string;
  message_body: string;
  submitted_at: string;
  is_read: boolean;
};

export type UploadedMedia = {
  id: number;
  url: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
};
