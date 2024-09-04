import React, { useState } from "react";
import { ApolloError, useMutation } from "@apollo/client";
import {
  CREATE_CUSTOMER,
  GENERATE_CUSTOMER_TOKEN,
  ASSIGN_CUSTOMER_TO_GUEST_CART,
} from "../graphql/queries";

interface AccountModalProps {
  onClose: () => void;
  onAccountModalSuccess: () => void;
  onUpdateCartId: (cartId: string) => void;
  cartId: string | null;
  firstname: string;
  lastname: string;
  email: string;
}

const AccountModal: React.FC<AccountModalProps> = ({
  onClose,
  onAccountModalSuccess,
  onUpdateCartId,
  cartId,
  firstname,
  lastname,
  email,
}) => {
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [createCustomer] = useMutation(CREATE_CUSTOMER);
  const [generateCustomerToken] = useMutation(GENERATE_CUSTOMER_TOKEN);
  const [assignCustomerToGuestCart] = useMutation(
    ASSIGN_CUSTOMER_TO_GUEST_CART
  );

  const handleCreateAccountSuccess = (token: string) => {
    localStorage.setItem("authToken", token);
  };

  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      let customerData;
      try {
        const response = await createCustomer({
          variables: { input: { email, password, firstname, lastname } },
        });
        customerData = response.data;
      } catch (error) {
        if (
          error instanceof ApolloError &&
          error.graphQLErrors.some((e) =>
            e.message.includes(
              "customer with the same email address already exists"
            )
          )
        ) {
          // Proceed if the error is due to the customer already existing
          customerData = { createCustomer: true };
        } else {
          throw error;
        }
      }
      if (customerData && customerData.createCustomer) {
        const { data: tokenData } = await generateCustomerToken({
          variables: { email, password },
        });

        if (tokenData && tokenData.generateCustomerToken) {
          const token = tokenData.generateCustomerToken.token;

          handleCreateAccountSuccess(token);

          const { data: assignCartData } = await assignCustomerToGuestCart({
            variables: { cart_id: cartId },
            context: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          });

          if (assignCartData && assignCartData.assignCustomerToGuestCart) {
            const newCartId = assignCartData.assignCustomerToGuestCart.id;
            // Update the cartId state with the new cart ID
            onUpdateCartId(newCartId);
            console.log("Cart ID updated to:", newCartId);
          }

          onAccountModalSuccess();
        }
      }
    } catch (error) {
      if (error instanceof ApolloError) {
        const message = error.graphQLErrors[0].message;
        setErrorMessage(
          message ||
            "An error occurred while creating the account. Please try again."
        );
      } else {
        console.error("Error creating account:", error);
      }
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <h2>Checkout Options</h2>
        <div className="modal-body">
          <div className="create-account">
            <form onSubmit={handleCreateAccountSubmit}>
              <div>
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  placeholder="Email"
                  required
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              <button type="submit">Create Account</button>
            </form>
          </div>
          <div className="guest-checkout">
            <button onClick={onAccountModalSuccess}>Checkout as Guest</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountModal;
