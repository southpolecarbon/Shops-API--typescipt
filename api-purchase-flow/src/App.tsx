import React, { useState, useEffect } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, useMutation, useQuery, HttpLink } from '@apollo/client';
import ProductList from './components/ProductList';
import Checkout from './components/Checkout';
import { CREATE_EMPTY_CART, ADD_TO_CART, GET_CART_TOTAL } from './graphql/queries';
import { Product } from './types';

const client = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:3001/graphql' }),
  cache: new InMemoryCache(),
});

function App() {
  const [cartId, setCartId] = useState<string | null>(null);
  const [createEmptyCart] = useMutation(CREATE_EMPTY_CART);
  const [addToCart] = useMutation(ADD_TO_CART);
  const { data: cartData, refetch: refetchCart, error: cartError } = useQuery(GET_CART_TOTAL, {
    variables: { cartId },
    skip: !cartId,
  });

  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    async function initCart() {
      try {
        console.log("Initiating cart creation...");
        const { data } = await createEmptyCart();
        if (data && data.createEmptyCart) {
          setCartId(data.createEmptyCart);
          console.log("Cart created with ID:", data.createEmptyCart);
        } else {
          console.error("Failed to create cart: No cart ID received");
        }
      } catch (error) {
        console.error('Error creating cart:', error);
      }
    }
    initCart();
  }, [createEmptyCart]);

  const handleAddToCart = async (product: Product, quantity: number, selectedOptions?: Record<string, string>) => {
    if (!cartId) {
      console.error("No cart ID available");
      return;
    }
    
    console.log(`Attempting to add to cart - Product:`, JSON.stringify(product, null, 2));
    console.log(`Quantity:`, quantity);
    console.log(`Selected Options:`, JSON.stringify(selectedOptions, null, 2));
    console.log(`CartID:`, cartId);
    
    try {
      let sku = product.sku;
      let parentSku = null;
      let selectedOptionIds: string[] = [];

      if (product.__typename === 'ConfigurableProduct' && selectedOptions) {
        console.log('Configurable product detected. Variants:', JSON.stringify(product.variants, null, 2));
        
        const variant = product.variants?.find(v => 
          v.attributes.every(attr => selectedOptions[attr.code] === attr.value_index.toString())
        );
        
        if (variant) {
          console.log('Matching variant found:', JSON.stringify(variant, null, 2));
          sku = variant.product.sku;
          parentSku = product.sku;
          selectedOptionIds = Object.entries(selectedOptions).map(([code, value_index]) => {
            const option = product.configurable_options?.find(o => o.attribute_code === code);
            return `${option?.attribute_code}_${value_index}`;
          });
        } else {
          console.error("Unable to find matching variant for selected options");
          console.log("Available variants:", JSON.stringify(product.variants, null, 2));
          console.log("Selected options:", JSON.stringify(selectedOptions, null, 2));
          throw new Error("Unable to find matching variant for selected options");
        }
      }

      console.log(`Final cart item data:`, JSON.stringify({
        sku,
        quantity,
        parentSku,
        selectedOptions: selectedOptionIds
      }, null, 2));

      const result = await addToCart({
        variables: {
          cartId,
          sku,
          quantity,
          parentSku,
          selectedOptions: selectedOptionIds
        },
      });
      console.log("Add to cart result:", JSON.stringify(result, null, 2));
      refetchCart();
    } catch (error: any) {
      console.error('Error adding to cart:', error.message);
      if (error.graphQLErrors) {
        console.error('GraphQL errors:', JSON.stringify(error.graphQLErrors, null, 2));
      }
      if (error.networkError) {
        console.error('Network error:', JSON.stringify(error.networkError, null, 2));
      }
    }
  };

  return (
    <div>
      <h1>Magento Store MVP</h1>
      {!showCheckout ? (
        <>
          <ProductList onAddToCart={handleAddToCart} />
          {cartData && cartData.cart && (
            <div>
              <h2>Cart Total</h2>
              <p>{cartData.cart.prices.grand_total.value} {cartData.cart.prices.grand_total.currency}</p>
              <button 
                onClick={() => setShowCheckout(true)}
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          )}
          {cartError && <p>Error loading cart: {cartError.message}</p>}
        </>
      ) : (
        cartId && <Checkout cartId={cartId} />
      )}
    </div>
  );
}

function AppWithProvider() {
  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
}

export default AppWithProvider;