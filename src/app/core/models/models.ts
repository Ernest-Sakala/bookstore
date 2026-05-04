
export interface AuthPayload {
  token:  string;
  userId: string;
  name:   string;
  email:  string;
  role:   'CUSTOMER' | 'ADMIN';
}

export interface CurrentUser {
  token:  string;
  userId: string;
  name:   string;
  email:  string;
  role:   'CUSTOMER' | 'ADMIN';
}

export interface Book {
  id:           string;
  title:        string;
  author:       string;
  category:     string;
  price:        number;
  coverImageUrl?: string;
  description?: string;
}

export interface CartItem {
  id:           string;
  bookId:       string;
  bookTitle:    string;
  bookAuthor:   string;
  bookPrice:    number;
  coverImageUrl?: string;
  quantity:     number;
  lineTotal:    number;
}

export interface Cart {
  items:      CartItem[];
  totalItems: number;
  totalPrice: number;
  itemCount:  number;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
}

export interface OrderItem {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface MyOrder {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingAddress: string;
  itemCount: number;
  items: OrderItem[];
}
