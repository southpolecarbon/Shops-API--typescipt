import {
  useState,
  useEffect,
  useCallback,
  lazy,
  useMemo,
  Suspense,
} from "react";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useMutation,
  useQuery,
  HttpLink,
  ApolloLink,
  ApolloError,
} from "@apollo/client";
import {
  CREATE_EMPTY_CART,
  ADD_TO_CART,
  GET_CART_TOTAL,
} from "./graphql/queries";
import { Product } from "./types";

const ProductList = lazy(() => import("./components/ProductList"));
const Cart = lazy(() => import("./components/Cart"));
const Checkout = lazy(() => import("./components/Checkout"));

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

const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

function App() {
  const [cartId, setCartId] = useState<string | null>(null);
  const [createEmptyCart] = useMutation(CREATE_EMPTY_CART);
  const [addToCart] = useMutation(ADD_TO_CART);
  const [showCheckout, setShowCheckout] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");

  const { refetch: refetchCart } = useQuery(GET_CART_TOTAL, {
    variables: { cartId },
    skip: !cartId,
  });

  const handleLinkClick = async () => {
    localStorage.clear();
    await initCart();
    setShowCheckout(false);
    setSearchQuery("");
  };

  const initCart = useCallback(async () => {
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
  }, [createEmptyCart]);

  const handleUpdateCartId = useCallback((newCartId: string) => {
    setCartId(newCartId);
  }, []);

  const handleAddToCart = useCallback(
    async (
      product: Product,
      quantity: number,
      selectedOptions?: Record<string, string>
    ) => {
      setErrorMessage(null);
      if (!cartId) {
        console.error("No cart ID available");
        return;
      }

      console.log(
        `Attempting to add to cart - Product:`,
        JSON.stringify(product, null, 2)
      );
      console.log(`Quantity:`, quantity);
      console.log(
        `Selected Options:`,
        JSON.stringify(selectedOptions, null, 2)
      );
      console.log(`CartID:`, cartId);

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
              (attr) =>
                selectedOptions[attr.code] === attr.value_index.toString()
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
            console.error(
              "Unable to find matching variant for selected options"
            );
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
        if (result.data?.addProductsToCart?.user_errors?.length > 0) {
          console.error(
            "Error adding to cart:",
            result.data?.addProductsToCart?.user_errors
          );
          const userError = result.data.addProductsToCart.user_errors[0];
          setErrorMessage(userError.message);
        } else {
          refetchCart();
        }
      } catch (error: unknown) {
        if (error instanceof ApolloError) {
          const message = error.graphQLErrors[0].message;
          setErrorMessage(
            message ||
              "An error occurred while adding item to the cart. Please try again."
          );
        } else {
          console.error("Error adding to cart:", error);
          setErrorMessage("An unexpected error occurred. Please try again.");
        }
      }
    },
    [addToCart, cartId, refetchCart]
  );

  const debouncedSetSearchQuery = useMemo(
    () => debounce((query: string) => setDebouncedSearchQuery(query), 1000),
    []
  );

  useEffect(() => {
    // Clear local storage when the component mounts
    localStorage.clear();
  }, []);

  useEffect(() => {
    debouncedSetSearchQuery(searchQuery);
  }, [searchQuery, debouncedSetSearchQuery]);

  useEffect(() => {
    initCart();
  }, [initCart]);

  const handleSearchChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const query = event.target.value;
    setSearchQuery(query);
  };

  const productListProps = useMemo(
    () => ({
      onAddToCart: handleAddToCart,
      searchQuery: debouncedSearchQuery,
    }),
    [handleAddToCart, debouncedSearchQuery]
  );

  return (
    <div>
      <h1>
        <Link to="/" onClick={handleLinkClick}>
          Magento Store MVP
        </Link>
      </h1>
      {!showCheckout ? (
        <>
          <Suspense fallback={<div>Loading...</div>}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <ProductList {...productListProps} />
            <Cart cartId={cartId} onCheckout={() => setShowCheckout(true)} />
          </Suspense>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </>
      ) : (
        cartId && (
          <Suspense fallback={<div>Loading...</div>}>
            <Checkout cartId={cartId} onUpdateCartId={handleUpdateCartId} />
          </Suspense>
        )
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
