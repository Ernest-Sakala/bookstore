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
      price
      description
    }
  }
`;

// FR15 - Updated books query with category filter
export const BOOKS_QUERY = gql`
  query Books($search: String, $category: String, $page: Int, $size: Int) {
    books(search: $search, category: $category, page: $page, size: $size) {
      books { id title author category imageSlug price description }
      totalElements totalPages currentPage pageSize
    }
  }
`;

export const UPDATE_BOOK_MUTATION = gql`
  mutation UpdateBook(
    $id: ID!, $title: String, $author: String, $category: String,
    $price: Float, $description: String, $image: Upload
  ) {
    updateBook(id: $id, title: $title, author: $author, category: $category,
               price: $price, description: $description, image: $image) {
      id title author category price description imageSlug
    }
  }
`;

export const CATEGORIES_QUERY = gql`
  query Categories {
    categories
  }
`;

export const AUTHORS_QUERY = gql`
  query Authors {
    authors
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

// FR17+FR21 - Updated checkout with shipping address
export const CHECKOUT_MUTATION = gql`
  mutation Checkout($shippingAddress: String!) {
    checkout(shippingAddress: $shippingAddress) {
      id
      totalAmount
      status
      createdAt
      shippingAddress
    }
  }
`;

// FR21 - Payment
export const PROCESS_PAYMENT_MUTATION = gql`
  mutation ProcessPayment($method: String!, $cardNumber: String, $expiryDate: String, $cvv: String) {
    processPayment(method: $method, cardNumber: $cardNumber, expiryDate: $expiryDate, cvv: $cvv) {
      success
      transactionId
      message
    }
  }
`;

// FR9 - Customer order history
export const MY_ORDERS_QUERY = gql`
  query MyOrders {
    myOrders {
      id
      totalAmount
      status
      createdAt
      shippingAddress
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

// FR13 - Profile management
export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      token
      userId
      name
      email
      role
    }
  }
`;

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;

// FR12 - Password recovery
export const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;

// FR16 - Admin user management
export const ADMIN_USERS_QUERY = gql`
  query AdminUsers {
    adminUsers {
      id
      name
      email
      role
      active
      createdAt
    }
  }
`;

export const BLOCK_USER_MUTATION = gql`
  mutation BlockUser($id: ID!) {
    blockUser(id: $id) { id active }
  }
`;

export const UNBLOCK_USER_MUTATION = gql`
  mutation UnblockUser($id: ID!) {
    unblockUser(id: $id) { id active }
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

// FR18 - Category management
export const ADD_CATEGORY_MUTATION = gql`
  mutation AddCategory($name: String!) {
    addCategory(name: $name)
  }
`;

export const UPDATE_CATEGORY_MUTATION = gql`
  mutation UpdateCategory($oldName: String!, $newName: String!) {
    updateCategory(oldName: $oldName, newName: $newName)
  }
`;

export const DELETE_CATEGORY_MUTATION = gql`
  mutation DeleteCategory($name: String!) {
    deleteCategory(name: $name)
  }
`;

// FR19 - Author management
export const ADD_AUTHOR_MUTATION = gql`
  mutation AddAuthor($name: String!) {
    addAuthor(name: $name)
  }
`;

export const UPDATE_AUTHOR_MUTATION = gql`
  mutation UpdateAuthor($oldName: String!, $newName: String!) {
    updateAuthor(oldName: $oldName, newName: $newName)
  }
`;

export const DELETE_AUTHOR_MUTATION = gql`
  mutation DeleteAuthor($name: String!) {
    deleteAuthor(name: $name)
  }
`;
