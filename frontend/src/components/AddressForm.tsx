import React from "react";

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

interface AddressFormProps {
  address: Address;
  onAddressChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmitAddress: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onAddressChange,
  onSubmitAddress,
}) => {
  return (
    <div className="form-container">
      <h3>Enter Billing Address</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmitAddress();
        }}
      >
        <label>
          First Name:<span style={{ color: "red" }}>*</span>
          <input
            type="text"
            name="firstname"
            value={address.firstname}
            onChange={onAddressChange}
            required
          />
        </label>
        <label>
          Last Name:<span style={{ color: "red" }}>*</span>
          <input
            type="text"
            name="lastname"
            value={address.lastname}
            onChange={onAddressChange}
            required
          />
        </label>
        <label>
          Street:<span style={{ color: "red" }}>*</span>
          <input
            type="text"
            name="street[0]"
            value={address.street[0]}
            onChange={onAddressChange}
            required
          />
        </label>
        <label>
          City:<span style={{ color: "red" }}>*</span>
          <input
            type="text"
            name="city"
            value={address.city}
            onChange={onAddressChange}
            required
          />
        </label>
        <label>
          State/Province:<span style={{ color: "red" }}>*</span>
          <input
            type="text"
            name="region"
            placeholder="State/Province"
            value={address.region}
            onChange={onAddressChange}
            required
          />
        </label>
        <label>
          Postcode: <span style={{ color: "red" }}>*</span>
          <input
            type="text"
            name="postcode"
            value={address.postcode}
            onChange={onAddressChange}
            required
          />
        </label>
        <label>
          Country: <span style={{ color: "red" }}>*</span>
          <select
            name="country_code"
            value={address.country_code}
            onChange={onAddressChange}
            required
          >
            <option value="">Select Country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
          </select>
        </label>
        <label>
          Telephone:
          <input
            type="text"
            name="telephone"
            value={address.telephone}
            onChange={onAddressChange}
          />
        </label>
        <button type="submit">Submit Address</button>
      </form>
    </div>
  );
};

export default AddressForm;
