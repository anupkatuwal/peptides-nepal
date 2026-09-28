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
export type OrderStatus = "Pending" | "Paid" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export type Order = {
  id: number;
  total_price: number;
  payment_method: PaymentMethod;
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
