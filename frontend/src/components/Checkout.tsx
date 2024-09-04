import React, { useState } from "react";
import { useMutation, useQuery, ApolloError } from "@apollo/client";
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
  SET_CERTIFICATE_NAME,
} from "../graphql/queries";

import StripeCheckoutForm from "./StripeChekoutForm";
import { Elements } from "@stripe/react-stripe-js";
import AccountModal from "./AccountModal";
import AddressForm from "./AddressForm";

const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLIC_KEY || "");

interface CheckoutProps {
  cartId: string;
  onUpdateCartId: (newCartId: string) => void;
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

const Checkout: React.FC<CheckoutProps> = ({ cartId, onUpdateCartId }) => {
  const [step, setStep] = useState(1);

  const [selectedPaymentType, setSelectedPaymentType] = useState("");

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
  const [setGuestEmailOnCart] = useMutation(SET_GUEST_EMAIL_ON_CART);
  const [setPaymentMethodMutation] = useMutation(SET_PAYMENT_METHOD);
  const [placeOrder] = useMutation(PLACE_ORDER);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [email, setEmail] = useState("f.rashidi@southpole.com");
  const [certName, setCertName] = useState("");
  const [certNotes, setCertNotes] = useState("");
  const [setCertificateName] = useMutation(SET_CERTIFICATE_NAME);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const paymentOptions: StripeElementsOptionsMode = {
    mode: "payment",
    amount: 100, //If not hard coded the PaymentElemnt is not loaded properly
    currency: "eur", //If not hard coded the PaymentElemnt is not loaded properly
    //NOTE: calling stripe.createPaymentMethod() with a PaymentElement only worked if payment creation method was set to manual
    paymentMethodCreation: "manual",
  };

  const {
    data: paymentMethodsData,
    loading: paymentMethodsLoading,
    error: paymentMethodsError,
  } = useQuery(GET_AVAILABLE_PAYMENT_METHODS, {
    variables: { cartId },
    skip: step < 4,
  });

  const handleSubmitCertificateForm = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    try {
      const result = await setCertificateName({
        variables: {
          cartId,
          certificateName: certName,
          specialInstructions: certNotes,
        },
      });
      console.log(result);
      console.log("Certificate details submitted successfully");
      setShowModal(true);
    } catch (error) {
      console.error("Error submitting certificate details:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleAccountModalSuccess = () => {
    setShowModal(false);

    setStep(4);
  };

  const handlePaymentStep = async () => {
    setErrorMessage(null);
    if (selectedPaymentType === "purchaseorder") {
      await handlePaymentMethodReceived({ id: "" } as PaymentMethod);
    } else {
      setStep(5);
    }
  };

  const handlePaymentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    //available values at the moment: "stripe_payments" for handling online payments and "purchaseorder" for handling offline payments
    setSelectedPaymentType(e.target.value);
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email) {
      setErrorMessage("Email is required.");
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
      if (error instanceof ApolloError) {
        const message = error.graphQLErrors[0].message;
        setErrorMessage(
          message ||
            "An error occurred while setting the guest email. Please try again."
        );
      } else {
        setErrorMessage("Failed to set guest email. Please try again.");
        console.error("Error setting guest email:", error);
      }
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

  const handlePlaceOrder = async () => {
    setErrorMessage(null);
    try {
      // Ref: https://developer.adobe.com/commerce/webapi/graphql/schema/cart/mutations/place-order/
      const result = await placeOrder({ variables: { cartId } });
      console.log(
        "Order placed:",
        JSON.stringify(result.data.placeOrder.order, null, 2)
      );
      setIsLoading(false);
      setSuccessMessage("Order placed successfully!");
    } catch (error: unknown) {
      setErrorMessage("Failed to place order. Please try again.");
      console.error("Error placing order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentMethodReceived = async (paymentMethod: PaymentMethod) => {
    setErrorMessage(null);
    setStep(6);
    setIsLoading(true);
    try {
      let paymentMethodVariables;

      if (selectedPaymentType === "stripe_payments") {
        paymentMethodVariables = {
          code: "stripe_payments",
          stripe_payments: {
            payment_method: paymentMethod.id,
            payment_element: true,
            save_payment_method: true,
          },
        };
      } else if (selectedPaymentType === "purchaseorder") {
        paymentMethodVariables = {
          code: selectedPaymentType,
        };
      } else {
        setErrorMessage("Invalid payment method selected. Please try again.");
        setIsLoading(false);
        return;
      }

      // Ref: https://developer.adobe.com/commerce/webapi/graphql/schema/cart/mutations/set-payment-method/
      await setPaymentMethodMutation({
        variables: {
          cartId,
          paymentMethod: paymentMethodVariables,
        },
      });

      // Call handlePlaceOrder after setting the payment method
      await handlePlaceOrder();
    } catch (error) {
      setErrorMessage("Failed to set payment method. Please try again.");
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {step === 1 && (
        <div>
          <h2>Checkout</h2>
          <h3>Enter Your Email</h3>
          <form onSubmit={handleSubmitEmail}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
            <button onClick={handleSubmitEmail}>Next</button>
          </form>
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
      {step === 3 && (
        <div className="certificate-section">
          <h3>Certificate Details</h3>
          <form
            className="certificate-form"
            onSubmit={handleSubmitCertificateForm}
          >
            <label>
              Name:
              <input
                type="text"
                value={certName}
                onChange={(e) => setCertName(e.target.value)}
                required
              />
            </label>
            <label>
              Notes:
              <textarea
                value={certNotes}
                onChange={(e) => setCertNotes(e.target.value)}
                required
              />
            </label>
            <button type="submit">Submit</button>
          </form>
          <img src="/certificate-explainer.png" alt="Certificate Explainer" />
        </div>
      )}
      {step === 4 && (
        <div>
          <h3>Payment Method</h3>
          {paymentMethodsLoading && <p>Loading payment methods...</p>}
          {paymentMethodsError && (
            <p>Error loading payment methods: {paymentMethodsError.message}</p>
          )}
          {paymentMethodsData && (
            <div>
              <select onChange={handlePaymentTypeChange}>
                <option value="">Select Payment Method</option>

                {paymentMethodsData.cart.available_payment_methods.map(
                  (method: { code: string; title: string }) => (
                    <option key={method.code} value={method.code}>
                      {method.title}
                    </option>
                  )
                )}
              </select>
              <button onClick={handlePaymentStep}>Next</button>
            </div>
          )}
        </div>
      )}
      {step === 5 && selectedPaymentType === "stripe_payments" && (
        <div className="checkout">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            !successMessage && (
              <div>
                <h3>Complete your purchase</h3>
                {/* Stripe recommend using an Stripe Element (https://docs.stripe.com/stripe-js/react) to render a payment form.*/}
                <Elements options={paymentOptions} stripe={stripePromise}>
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
      {step === 6 && (
        <div>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            successMessage && (
              <div>Your order has been placed successfully!</div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Checkout;
