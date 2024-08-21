export interface Product {
  id: string;
  name: string;
  sku: string;
  thumbnail: {
    url: string;
    label: string;
  };
  __typename: string;
  price: {
    regularPrice: {
      amount: {
        value: number;
        currency: string;
      };
    };
  };
  configurable_options?: Array<{
    attribute_code: string;
    label: string;
    values: Array<{
      value_index: number;
      label: string;
    }>;
  }>;
  variants?: Array<{
    product: {
      sku: string;
      price: {
        regularPrice: {
          amount: {
            value: number;
            currency: string;
          };
        };
      };
    };
    attributes: Array<{
      code: string;
      value_index: number;
    }>;
  }>;
}
