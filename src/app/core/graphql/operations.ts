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

export const BOOKS_QUERY = gql`
  query Books($search: String) {
    books(search: $search) {
      id
      title
      author
      category
      price
      coverImageUrl
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




export const SEARCH_BOOKS = gql`
  query SearchBooks($search: String) {
    books(search: $search) {
      id
      title
      author
      category
      price
    }
  }
`;
