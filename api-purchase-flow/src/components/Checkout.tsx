import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  SET_BILLING_ADDRESS,
  SET_PAYMENT_METHOD,
  PLACE_ORDER,
  GET_AVAILABLE_PAYMENT_METHODS
} from '../graphql/queries';

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
    firstname: '',
    lastname: '',
    street: [''],
    city: '',
    region: '',
    postcode: '',
    country_code: 'GB',
    telephone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('');

  const [setBillingAddress] = useMutation(SET_BILLING_ADDRESS);
  const [setPaymentMethodMutation] = useMutation(SET_PAYMENT_METHOD);
  const [placeOrder] = useMutation(PLACE_ORDER);

  const { data: paymentMethodsData, loading: paymentMethodsLoading, error: paymentMethodsError } = useQuery(GET_AVAILABLE_PAYMENT_METHODS, {
    variables: { cartId },
    skip: step < 2
  });

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddress(prev => {
      if (name.includes('[')) {
        const [parent, index] = name.split(/[\[\]]/);
        const updatedArray = [...prev[parent as keyof typeof prev]];
        updatedArray[Number(index)] = value;
        return { ...prev, [parent]: updatedArray };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmitAddress = async () => {
    try {
      console.log('Submitting billing address:', JSON.stringify(address, null, 2));
      const result = await setBillingAddress({
        variables: {
          cartId,
          address: {
            firstname: address.firstname,
            lastname: address.lastname,
            street: address.street,
            city: address.city,
            region: {
              region: address.region,
              region_code: '', // You may need to provide a valid region_code
            },
            postcode: address.postcode,
            country_code: address.country_code,
            telephone: address.telephone,
            same_as_billing: true, // Set this to true if shipping address is the same as billing address
          },
        },
      });
      console.log('Set billing address result:', JSON.stringify(result, null, 2));
      setStep(2);
    } catch (error: any) {
      console.error('Error setting billing address:', error);
      if (error.graphQLErrors) {
        console.error('GraphQL errors:', JSON.stringify(error.graphQLErrors, null, 2));
      }
      if (error.networkError) {
        console.error('Network error:', JSON.stringify(error.networkError, null, 2));
      }
    }
  };

  const handleSetPaymentMethod = async () => {
    try {
      const result = await setPaymentMethodMutation({
        variables: {
          cartId,
          paymentMethod: { code: paymentMethod }
        }
      });
      console.log('Set payment method result:', JSON.stringify(result, null, 2));
      setStep(3);
    } catch (error: any) {
      console.error('Error setting payment method:', error);
      if (error.graphQLErrors) {
        console.error('GraphQL errors:', JSON.stringify(error.graphQLErrors, null, 2));
      }
      if (error.networkError) {
        console.error('Network error:', JSON.stringify(error.networkError, null, 2));
      }
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const result = await placeOrder({ variables: { cartId } });
      console.log('Order placed:', JSON.stringify(result.data.placeOrder.order, null, 2));
      // Here you would typically redirect to an order confirmation page
    } catch (error: any) {
      console.error('Error placing order:', error);
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
      <h2>Checkout</h2>
      {step === 1 && (
        <div>
          <h3>Billing Address</h3>
          <input name="firstname" placeholder="First Name" onChange={handleAddressChange} value={address.firstname} />
          <input name="lastname" placeholder="Last Name" onChange={handleAddressChange} value={address.lastname} />
          <input name="street[0]" placeholder="Street" onChange={handleAddressChange} value={address.street[0]} />
          <input name="city" placeholder="City" onChange={handleAddressChange} value={address.city} />
          <input name="region" placeholder="State/Province" onChange={handleAddressChange} value={address.region} />
          <input name="postcode" placeholder="Zip/Postal Code" onChange={handleAddressChange} value={address.postcode} />
          <input name="telephone" placeholder="Phone Number" onChange={handleAddressChange} value={address.telephone} />
          <select name="country_code" onChange={handleAddressChange} value={address.country_code}>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            {/* Add more country options as needed */}
          </select>
          <button onClick={handleSubmitAddress}>Next</button>
        </div>
      )}
      {step === 2 && (
        <div>
          <h3>Payment Method</h3>
          {paymentMethodsLoading && <p>Loading payment methods...</p>}
          {paymentMethodsError && <p>Error loading payment methods: {paymentMethodsError.message}</p>}
          {paymentMethodsData && (
            <select onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod}>
              <option value="">Select Payment Method</option>
              {paymentMethodsData.cart.available_payment_methods.map((method: any) => (
                <option key={method.code} value={method.code}>
                  {method.title}
                </option>
              ))}
            </select>
          )}
          <button onClick={handleSetPaymentMethod}>Next</button>
        </div>
      )}
      {step === 3 && (
        <div>
          <h3>Place Order</h3>
          <button onClick={handlePlaceOrder}>Place Order</button>
        </div>
      )}
    </div>
  );
};

export default Checkout;