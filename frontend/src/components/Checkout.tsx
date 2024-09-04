import React, { /*useEffect,*/ useState } from "react";
import { useMutation /*useQuery*/ } from "@apollo/client";
import {
  loadStripe,
  PaymentMethod,
  StripeElementsOptionsMode,
} from "@stripe/stripe-js";

import {
  SET_BILLING_ADDRESS,
  SET_PAYMENT_METHOD,
  PLACE_ORDER,
  GET_AVAILABLE_PAYMENT_METHODS,
  SET_GUEST_EMAIL_ON_CART,
} from "../graphql/queries";

import StripeCheckoutForm from "./StripeChekoutForm";
import { Elements } from "@stripe/react-stripe-js";
import AccountModal from "./AccountModal";
import AddressForm from "./AddressForm";

const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLIC_KEY || "");

interface CheckoutProps {
  cartId: string;
}
interface Address {
  firstname: string;
  lastname: string;
  street: string[];
  city: string;
  region: string;
  postcode: string;
  country_code: string;
  telephone: string;
}

const Checkout: React.FC<CheckoutProps> = ({ cartId }) => {
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState<Address>({
    firstname: "",
    lastname: "",
    street: [""],
    city: "",
    region: "",
    postcode: "",
    country_code: "",
    telephone: "",
  });
  const [setBillingAddress] = useMutation(SET_BILLING_ADDRESS);
  const [email, setEmail] = useState("");
  const [setGuestEmailOnCart] = useMutation(SET_GUEST_EMAIL_ON_CART);
  const [setPaymentMethodMutation] = useMutation(SET_PAYMENT_METHOD);
  const [placeOrder] = useMutation(PLACE_ORDER);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlaceOrder = async () => {
    try {
      const result = await placeOrder({ variables: { cartId } });
      console.log(
        "Order placed:",
        JSON.stringify(result.data.placeOrder.order, null, 2)
      );
      setSuccessMessage("Order placed successfully!");
    } catch (error: unknown) {
      debugger;
      setErrorMessage("Failed to place order. Please try again.");
      console.error("Error placing order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentMethodReceived = async (paymentMethod: PaymentMethod) => {
    try {
      const result = await setPaymentMethodMutation({
        variables: {
          cartId,
          paymentMethod: {
            code: "stripe_payments",
            stripe_payments: {
              payment_method: paymentMethod.id,
              payment_element: true,
              save_payment_method: true,
            },
          },
        },
      });
      console.log(result);
      // Call handlePlaceOrder after setting the payment method
      await handlePlaceOrder();
      // Handle success (e.g., navigate to confirmation page)
    } catch (error) {
      setErrorMessage("Failed to set payment method. Please try again.");
      console.error(error);
      setIsLoading(false);
    }
  };
  // const {
  //   data: paymentMethodsData,
  //   // loading: paymentMethodsLoading,
  //   error: paymentMethodsError,
  // } = useQuery(GET_AVAILABLE_PAYMENT_METHODS, {
  //   variables: { cartId },
  //   skip: step < 2,
  // });
  //   async function createPaymentIntent(items: { id: string }) {
  //     try {
  //       const response = await fetch(
  //         "http://localhost:3001/create-payment-intent",
  //         {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({ items }),
  //         }
  //       );
  //
  //       if (!response.ok) {
  //         throw new Error("Network response was not ok");
  //       }
  //
  //       const data = await response.json();
  //       // Handle the data
  //       return data;
  //     } catch (error) {
  //       debugger;
  //       // Handle the error
  //       console.error("There was a problem with the fetch operation:", error);
  //     }
  //   }

  const options: StripeElementsOptionsMode = {
    mode: "payment",
    amount: 100, //If not hard coded the PaymentElemnt is not loaded properly
    currency: "eur", //If not hard coded the PaymentElemnt is not loaded properly
    //NOTE: calling stripe.createPaymentMethod() with a PaymentElement only worked if payment creation method was set to manual
    paymentMethodCreation: "manual",
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmitEmail = async () => {
    if (!email) {
      alert("Please enter your email.");
      return;
    }
    try {
      const result = await setGuestEmailOnCart({
        variables: {
          cartId,
          email,
        },
      });
      console.log("Set guest email result:", JSON.stringify(result, null, 2));
      setStep(2);
    } catch (error: unknown) {
      setErrorMessage("Failed to set guest email. Please try again.");
      console.error("Error setting guest email:", error);
    }
  };

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAddress((prev) => {
      if (name.includes("[")) {
        const [parent, index] = name.split(/[[\]]/);
        const updatedArray = [...prev[parent as keyof typeof prev]];
        updatedArray[Number(index)] = value;
        return { ...prev, [parent]: updatedArray };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmitAddress = async () => {
    setErrorMessage(null);
    try {
      const result = await setBillingAddress({
        variables: {
          cartId,
          address: {
            ...address,
          },
        },
      });
      console.log(
        "Set billing address result:",
        JSON.stringify(result, null, 2)
      );
      setStep(3);
    } catch (error: unknown) {
      setErrorMessage("Failed to set billing address. Please try again.");
      console.error("Error setting billing address:", error);
    }
  };

  return (
    <div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {step === 1 && (
        <div>
          <h2>Checkout</h2>
          <h3>Enter Your Email</h3>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Email"
          />
          <button onClick={handleSubmitEmail}>Next</button>
        </div>
      )}
      {step === 2 && (
        <AddressForm
          address={address}
          onAddressChange={handleAddressChange}
          onSubmitAddress={handleSubmitAddress}
        />
      )}
      {showModal && (
        <AccountModal
          onClose={handleCloseModal}
          onAccountModalSuccess={handleAccountModalSuccess}
          onUpdateCartId={onUpdateCartId}
          cartId={cartId}
          firstname={address.firstname}
          lastname={address.lastname}
          email={email}
        />
      )}


          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            {/* Add more country options as needed */}
          </select>
          <button onClick={handleSubmitAddress}>Next</button>
        </div>
      )}
      <div>
        {step === 3 && (
          <div className="checkout">
            {isLoading ? (
              <div>Loading...</div>
            ) : (
              !successMessage && (
                <div>
                  <h3>Complete your purchase</h3>
                  {/* Stripe recommend using an Stripe Element (https://docs.stripe.com/stripe-js/react) to render a payment form.*/}
                  <Elements options={options} stripe={stripePromise}>
                    <StripeCheckoutForm
                      onPaymentMethodReceived={handlePaymentMethodReceived}
                      setIsLoading={setIsLoading}
                    />
                    {isLoading && <div>Loading...</div>}
                  </Elements>
                </div>
              )
            )}
          </div>
        )}
        {/* {orderPlaced && (
          <div>Payment successful! Your order has been placed.</div>
        )} */}
      </div>
      {/* {step === 4 && (
        <div>
          <h3>Payment Method</h3>
          {paymentMethodsLoading && <p>Loading payment methods...</p>}
          {paymentMethodsError && (
            <p>Error loading payment methods: {paymentMethodsError.message}</p>
          )}
          {paymentMethodsData && (
            <select
              onChange={(e) => setPaymentMethod(e.target.value)}
              value={paymentMethod}
            >
              <option value="">Select Payment Method</option>

              {paymentMethodsData.cart.available_payment_methods.map(
                (method: { code: string; title: string }) => (
                  <option key={method.code} value={method.code}>
                    {method.title}
                  </option>
                )
              )}
            </select>
          )}
          <div id="payment-element"></div>
          <button onClick={handleSetPaymentMethod}>Next</button>
        </div>
      )} */}
      {/* {step === 5 && (
        <div>
          <h3>Place Order</h3>
          <button onClick={handlePlaceOrder}>Place Order</button>
        </div>
      )}
      {step === 5 && <div>Order placed successfully!</div>} */}
    </div>
  );
};

export default Checkout;
