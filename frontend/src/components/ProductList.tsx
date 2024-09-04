import { useCallback, useEffect, useMemo, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { GET_PRODUCTS } from "../graphql/queries";
import { Product } from "../types";
import ProductItem from "./Product";

interface ProductListProps {
  onAddToCart: (
    product: Product,
    quantity: number,
    selectedOptions?: Record<string, string>
  ) => void;
  searchQuery: string;
}

const ProductList: React.FC<ProductListProps> = ({
  onAddToCart,
  searchQuery,
}) => {
  const [getProducts, { loading, data }] = useLazyQuery(GET_PRODUCTS);

  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: Record<string, string>;
  }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    getProducts({ variables: { search: searchQuery } });
  }, [searchQuery, getProducts]);

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

  if (loading) return <p>Loading......</p>;
  if (data?.error) return <p>Error loading products: {data.error.message}</p>;
  return (
    <div>
      <h2>Products</h2>
      <div className="product-grid">
        {products?.length === 0 ? (
          <p>No results found</p>
        ) : (
          products?.map((product: Product) => (
            <div key={product.id} className="product-item">
              <ProductItem
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
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductList;
