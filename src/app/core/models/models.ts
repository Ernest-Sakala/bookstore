
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
