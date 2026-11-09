export type Category = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  /** lucide-react icon name used by the IconFor helper */
  icon: string;
  /** hex used for gradients/placeholders */
  accent: string;
};

export type Spec = { label: string; value: string };

export type Product = {
  createdAt?: string;
  version?: number;
  id: string;
  slug: string;
  name: string;
  brand: string;
  categorySlug: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  featured?: boolean;
  isNew?: boolean;
  bestSeller?: boolean;
  tags: string[];
  shortDescription: string;
  description: string;
  specs: Spec[];
  /** optional real image urls; when empty a themed placeholder is rendered */
  images: string[];
  /** two hex colors used to generate the placeholder gradient */
  swatch: [string, string];
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  categorySlug: string;
  swatch: [string, string];
  quantity: number;
  stock: number;
};

export type OrderItem = {
  productId: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
};

export type OrderStatus =
  "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export type Order = {
  id: string;
  userId: string | null;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zip: string;
  };
  paymentMethod: string;
  paymentStatus?: string;
  trackingNumber?: string;
  createdAt: string;
};

export type Role = "customer" | "admin";

export type SortKey =
  "featured" | "price-asc" | "price-desc" | "rating" | "newest";
