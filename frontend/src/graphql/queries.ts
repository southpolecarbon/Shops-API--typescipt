import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query GetProducts($search: String!) {
    products(search: $search, pageSize: 10, currentPage: 1) {
      items {
        id
        name
        sku
        thumbnail {
          url
          label
        }
        __typename
        price {
          regularPrice {
            amount {
              value
              currency
            }
          }
        }
        ... on ConfigurableProduct {
          configurable_options {
            attribute_code
            label
            values {
              value_index
              label
            }
          }
          variants {
            product {
              sku
              price {
                regularPrice {
                  amount {
                    value
                    currency
                  }
                }
              }
            }
            attributes {
              code
              value_index
            }
          }
        }
      }
    }
  }
`;

export const CREATE_EMPTY_CART = gql`
  mutation {
    createEmptyCart
  }
`;

export const ADD_TO_CART = gql`
  mutation AddToCart(
    $cartId: String!
    $sku: String!
    $quantity: Float!
    $parentSku: String
    $selectedOptions: [ID!]
  ) {
    addProductsToCart(
      cartId: $cartId
      cartItems: [
        {
          sku: $sku
          quantity: $quantity
          parent_sku: $parentSku
          selected_options: $selectedOptions
        }
      ]
    ) {
      cart {
        items {
          product {
            name
            sku
          }
          quantity
        }
      }
      user_errors {
        code
        message
      }
    }
  }
`;

export const GET_CART_TOTAL = gql`
  query GetCartTotal($cartId: String!) {
    cart(cart_id: $cartId) {
      prices {
        grand_total {
          value
          currency
        }
      }
    }
  }
`;

export const SET_BILLING_ADDRESS = gql`
  mutation SetBillingAddress($cartId: String!, $address: CartAddressInput!) {
    setBillingAddressOnCart(
      input: { cart_id: $cartId, billing_address: { address: $address } }
    ) {
      cart {
        billing_address {
          firstname
          lastname
          street
          city
          region {
            code
            label
          }
          postcode
          country {
            code
            label
          }
          telephone
        }
      }
    }
  }
`;

export const SET_PAYMENT_METHOD = gql`
  mutation SetPaymentMethod(
    $cartId: String!
    $paymentMethod: PaymentMethodInput!
  ) {
    setPaymentMethodOnCart(
      input: { cart_id: $cartId, payment_method: $paymentMethod }
    ) {
      cart {
        selected_payment_method {
          code
        }
      }
    }
  }
`;

export const PLACE_ORDER = gql`
  mutation PlaceOrder($cartId: String!) {
    placeOrder(input: { cart_id: $cartId }) {
      order {
        order_number
      }
    }
  }
`;

export const GET_AVAILABLE_PAYMENT_METHODS = gql`
  query GetAvailablePaymentMethods($cartId: String!) {
    cart(cart_id: $cartId) {
      available_payment_methods {
        code
        title
      }
    }
  }
`;

export const SET_GUEST_EMAIL_ON_CART = gql`
  mutation SetGuestEmailOnCart($cartId: String!, $email: String!) {
    setGuestEmailOnCart(input: { cart_id: $cartId, email: $email }) {
      cart {
        email
      }
    }
  }
`;

export const CREATE_CUSTOMER = gql`
  mutation createCustomer($input: CustomerInput!) {
    createCustomer(input: $input) {
      customer {
        id
        email
      }
    }
  }
`;

export const GENERATE_CUSTOMER_TOKEN = gql`
  mutation generateCustomerToken($email: String!, $password: String!) {
    generateCustomerToken(email: $email, password: $password) {
      token
    }
  }
`;

export const ASSIGN_CUSTOMER_TO_GUEST_CART = gql`
  mutation AssignCustomerToGuestCart($cart_id: String!) {
    assignCustomerToGuestCart(cart_id: $cart_id) {
      id
    }
  }
`;
export const SET_CERTIFICATE_NAME = gql`
  mutation SetCertificateName(
    $cartId: String!
    $certificateName: String!
    $specialInstructions: String!
  ) {
    setCertificateName(
      cartId: $cartId
      certificateName: $certificateName
      specialInstructions: $specialInstructions
    )
  }
`;
