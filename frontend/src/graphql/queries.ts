import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query GetProducts($search: String!) {
    products(
      search: $search
      pageSize: 20
      currentPage: 1
      sort: { name: DESC }
    ) {
      items {
        id
        name
        sku
        __typename
        ... on ConfigurableProduct {
          configurable_options {
            attribute_code
            id
            label
            use_default
            values {
              value_index
              label
              swatch_data {
                value
              }
            }
            product_id
          }
          variants {
            product {
              id
              name
              sku
              ... on PhysicalProductInterface {
                weight
              }
              price_range {
                minimum_price {
                  regular_price {
                    value
                    currency
                  }
                }
              }
            }
            attributes {
              label
              code
              value_index
            }
          }
        }
        thumbnail {
          url
          label
        }
        price {
          regularPrice {
            amount {
              value
              currency
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
  mutation AddConfigurableProductsToCart(
    $input: AddConfigurableProductsToCartInput
  ) {
    addConfigurableProductsToCart(input: $input) {
      cart {
        items {
          product {
            name
            sku
          }
          quantity
          ... on ConfigurableCartItem {
            configurable_options {
              id
              option_label
              value_label
              value_id
            }
          }
        }
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
