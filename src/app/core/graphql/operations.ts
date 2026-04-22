import { gql } from 'apollo-angular';

// ── Auth ──────────────────────────────────────────────────────────────

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      userId
      name
      email
      role
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      userId
      name
      email
      role
    }
  }
`;

// ── Books ─────────────────────────────────────────────────────────────

export const BOOK_BY_ID_QUERY = gql`
  query BookById($id: ID!) {
    book(id: $id) {
      id
      title
      author
      category
      imageSlug
      filePath
      price
      description
    }
  }
`;

export const BOOKS_QUERY = gql`
  query Books($search: String) {
    books(search: $search) {
      id
      title
      author
      category
      imageSlug
      filePath
      price
      description
    }
  }
`;

// ── Cart ──────────────────────────────────────────────────────────────

export const CART_QUERY = gql`
  query Cart {
    cart {
      items {
        id
        bookId
        bookTitle
        bookAuthor
        bookPrice
        coverImageUrl
        quantity
        lineTotal
      }
      totalItems
      totalPrice
      itemCount
    }
  }
`;

export const ADD_TO_CART_MUTATION = gql`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      items {
        id
        bookId
        bookTitle
        bookAuthor
        bookPrice
        coverImageUrl
        quantity
        lineTotal
      }
      totalItems
      totalPrice
      itemCount
    }
  }
`;

export const UPDATE_CART_ITEM_MUTATION = gql`
  mutation UpdateCartItem($itemId: ID!, $quantity: Int!) {
    updateCartItem(itemId: $itemId, quantity: $quantity) {
      items {
        id
        bookId
        bookTitle
        bookAuthor
        bookPrice
        coverImageUrl
        quantity
        lineTotal
      }
      totalItems
      totalPrice
      itemCount
    }
  }
`;

export const REMOVE_CART_ITEM_MUTATION = gql`
  mutation RemoveCartItem($itemId: ID!) {
    removeCartItem(itemId: $itemId) {
      items {
        id
        bookId
        bookTitle
        bookAuthor
        bookPrice
        coverImageUrl
        quantity
        lineTotal
      }
      totalItems
      totalPrice
      itemCount
    }
  }
`;

export const CLEAR_CART_MUTATION = gql`
  mutation ClearCart {
    clearCart
  }
`;

// ── Orders ────────────────────────────────────────────────────────────

export const CHECKOUT_MUTATION = gql`
  mutation Checkout {
    checkout {
      id
      totalAmount
      status
      createdAt
    }
  }
`;




// ── Admin Order operations ────────────────────────────────────────────

export const ADMIN_ORDERS_QUERY = gql`
  query AdminOrders($status: String) {
    orders(status: $status) {
      id
      customerName
      customerEmail
      totalAmount
      status
      createdAt
      itemCount
      items {
        id
        bookTitle
        bookAuthor
        bookPrice
        quantity
        lineTotal
      }
    }
  }
`;

export const UPDATE_ORDER_STATUS_MUTATION = gql`
  mutation UpdateOrderStatus($id: ID!, $status: String!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const SEARCH_BOOKS = gql`
  query SearchBooks($search: String) {
    books(search: $search) {
      id
      title
      author
      category
      imageSlug
      filePath
    }
  }
`;
