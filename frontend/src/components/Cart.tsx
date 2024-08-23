import { useQuery } from "@apollo/client";
import { GET_CART_TOTAL } from "../graphql/queries";

interface CartProps {
  cartId: string | null;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({ cartId, onCheckout }) => {
  const { data: cartData, error: cartError } = useQuery(GET_CART_TOTAL, {
    variables: { cartId },
    skip: !cartId,
  });

  return (
    <div>
      {cartData && cartData.cart && (
        <div>
          <h2>Cart Total</h2>
          <p>
            {cartData.cart.prices.grand_total.value}{" "}
            {cartData.cart.prices.grand_total.currency}
          </p>
          <button
            onClick={onCheckout}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              backgroundColor:
                cartData.cart.prices.grand_total.value <= 0
                  ? "#d3d3d3"
                  : "#4CAF50",
            }}
            disabled={cartData.cart.prices.grand_total.value <= 0}
          >
            Proceed to Checkout
          </button>
        </div>
      )}
      {cartError && <p>Error loading cart: {cartError.message}</p>}
    </div>
  );
};

export default Cart;
