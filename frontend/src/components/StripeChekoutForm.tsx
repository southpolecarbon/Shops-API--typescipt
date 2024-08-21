import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { PaymentMethod } from "@stripe/stripe-js";

interface StripeCheckoutFormProps {
  onPaymentMethodReceived: (paymentMethod: PaymentMethod) => void;
  setIsLoading: (isLoading: boolean) => void;
}
export default function StripeCheckoutForm({
  onPaymentMethodReceived,
  setIsLoading,
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // setIsLoading(true);
    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      setIsLoading(false);
      return;
    }

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      console.error(submitError);
      setIsLoading(false);
      return;
    }
    // Tokenize the PaymentMethod using the details collected by the Payment Element
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      elements,
    });
    console.log(paymentMethod);
    setIsLoading(true);
    if (error) {
      console.error(error);
      setIsLoading(false);
      return;
    } else {
      // Call the callback function with the tokenized payment method
      onPaymentMethodReceived(paymentMethod);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      {/* Ref: https://docs.stripe.com/stripe-js/react
      NOTE: using CardElement was not behaving as expected, hence I used PaymentElement.
      NOTE: If you're rendering the Element before creating the payment intent, no need to provide client_secret */}
      <PaymentElement />
      <button disabled={!stripe || !elements} id="submit">
        <span id="button-text">
          "Pay now"
          {/* {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"} */}
        </span>
      </button>
      {/* Show any error or success messages */}
      {/* {message && <div id="payment-message">{message}</div>} */}
    </form>
  );
}
