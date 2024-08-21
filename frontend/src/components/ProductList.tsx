import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS } from "../graphql/queries";
import { Product } from "../types";
import ProductItem from "./Product";

interface ProductListProps {
  onAddToCart: (
    product: Product,
    quantity: number,
    selectedOptions?: Record<string, string>
  ) => void;
}

function ProductList({ onAddToCart }: ProductListProps) {
  const { loading, error, data } = useQuery(GET_PRODUCTS);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: Record<string, string>;
  }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading products: {error.message}</p>;

  const handleQuantityChange = (sku: string, value: string) => {
    const quantity = parseInt(value, 10) || 0;
    setQuantities((prev) => ({ ...prev, [sku]: quantity }));
  };

  const handleOptionChange = (
    productSku: string,
    attributeCode: string,
    valueIndex: string
  ) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [productSku]: {
        ...prev[productSku],
        [attributeCode]: valueIndex,
      },
    }));
    setErrors((prev) => ({ ...prev, [productSku]: "" }));
  };

  const validateOptions = (product: Product): string => {
    if (
      product.__typename !== "ConfigurableProduct" ||
      !product.configurable_options
    ) {
      return "";
    }

    const missingOptions = product.configurable_options
      .filter(
        (option) => !selectedOptions[product.sku]?.[option.attribute_code]
      )
      .map((option) => option.label);

    if (missingOptions.length > 0) {
      return `Please select: ${missingOptions.join(", ")}`;
    }

    return "";
  };

  return (
    <div>
      <h2>Products</h2>
      <ul>
        {data.products.items.map((product: Product) => (
          <ProductItem
            key={product.id}
            product={product}
            quantity={quantities[product.sku] || 1}
            selectedOptions={selectedOptions[product.sku] || {}}
            error={errors[product.sku] || validateOptions(product)}
            onQuantityChange={(value) =>
              handleQuantityChange(product.sku, value)
            }
            onOptionChange={(attributeCode, valueIndex) =>
              handleOptionChange(product.sku, attributeCode, valueIndex)
            }
            onAddToCart={() => {
              const validationError = validateOptions(product);
              if (validationError) {
                setErrors((prev) => ({
                  ...prev,
                  [product.sku]: validationError,
                }));
              } else {
                onAddToCart(
                  product,
                  quantities[product.sku] || 1,
                  selectedOptions[product.sku]
                );
              }
            }}
          />
        ))}
      </ul>
    </div>
  );
}

export default ProductList;
