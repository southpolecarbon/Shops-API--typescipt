import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useMutation,
  useQuery,
  HttpLink,
  ApolloLink,
} from "@apollo/client";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import {
  CREATE_EMPTY_CART,
  ADD_TO_CART,
  GET_CART_TOTAL,
} from "./graphql/queries";
import { Product } from "./types";

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem("authToken");
  const isGetProductsQuery = operation.operationName === "GetProducts";

  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
      // NOTE: the required header's name is different for GetProductsQuery vs the rest of queries/mutations
      ...(isGetProductsQuery
        ? { "Magento-Store-View-Code": process.env.VITE_STORE_VIEW_CODE }
        : { Store: process.env.VITE_STORE_VIEW_CODE }),
    },
  });
  return forward(operation);
});

const httpLink = new HttpLink({ uri: process.env.VITE_SERVER_GQL_URL });

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  const [cartId, setCartId] = useState<string | null>(null);
  const [createEmptyCart] = useMutation(CREATE_EMPTY_CART);
  const [addToCart] = useMutation(ADD_TO_CART);
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
        console.error("Error creating cart:", error);
      }
    }
    initCart();
  }, [createEmptyCart]);

  const { refetch: refetchCart } = useQuery(GET_CART_TOTAL, {
    variables: { cartId },
    skip: !cartId,
  });

  const handleAddToCart = async (
    product: Product,
    quantity: number,
    selectedOptions?: Record<string, string>
  ) => {
    if (!cartId) {
      console.error("No cart ID available");
      return;
    }

  const handleUpdateCartId = useCallback((newCartId: string) => {
    setCartId(newCartId);
  }, []);

    try {
      let sku = product.sku;
      let parentSku = null;
      let selectedOptionIds: string[] = [];

      if (product.__typename === "ConfigurableProduct" && selectedOptions) {
        console.log(
          "Configurable product detected. Variants:",
          JSON.stringify(product.variants, null, 2)
        );

        const variant = product.variants?.find((v) =>
          v.attributes.every(
            (attr) => selectedOptions[attr.code] === attr.value_index.toString()
          )
        );

        if (variant) {
          console.log(
            "Matching variant found:",
            JSON.stringify(variant, null, 2)
          );
          sku = variant.product.sku;
          parentSku = product.sku;
          selectedOptionIds = Object.entries(selectedOptions).map(
            ([code, value_index]) => {
              const option = product.configurable_options?.find(
                (o) => o.attribute_code === code
              );
              return `${option?.attribute_code}_${value_index}`;
            }
          );
        } else {
          console.error("Unable to find matching variant for selected options");
          console.log(
            "Available variants:",
            JSON.stringify(product.variants, null, 2)
          );
          console.log(
            "Selected options:",
            JSON.stringify(selectedOptions, null, 2)
          );
          throw new Error(
            "Unable to find matching variant for selected options"
          );
        }
      }

      console.log(
        `Final cart item data:`,
        JSON.stringify(
          {
            sku,
            quantity,
            parentSku,
            selectedOptions: selectedOptionIds,
          },
          null,
          2
        )
      );

      const result = await addToCart({
        variables: {
          cartId,
          sku,
          quantity,
          parentSku,
          selectedOptions: selectedOptionIds,
        },
      });
      console.log("Add to cart result:", JSON.stringify(result, null, 2));
      refetchCart();
    } catch (error: unknown) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <div>
      <h1>
        <Link to="/" onClick={() => setShowCheckout(false)}>
          Magento Store MVP
        </Link>
      </h1>
      {!showCheckout ? (
        <>
          <ProductList onAddToCart={handleAddToCart} />
          <Cart cartId={cartId} onCheckout={() => setShowCheckout(true)} />
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
      <Router>
        <Routes>
          <Route path="/" Component={App} />
        </Routes>
      </Router>
    </ApolloProvider>
  );
}

export default AppWithProvider;
