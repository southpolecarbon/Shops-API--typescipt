import React from 'react';
import { Product } from '../types';

interface ProductItemProps {
  product: Product;
  quantity: number;
  selectedOptions: Record<string, string>;
  error: string;
  onQuantityChange: (value: string) => void;
  onOptionChange: (attributeCode: string, valueIndex: string) => void;
  onAddToCart: () => void;
}

function ProductItem({
  product,
  quantity,
  selectedOptions,
  error,
  onQuantityChange,
  onOptionChange,
  onAddToCart
}: ProductItemProps) {
  return (
    <li>
      {product.name} - {product.price.regularPrice.amount.value} {product.price.regularPrice.amount.currency}
      <input 
        type="number" 
        min="1" 
        value={quantity} 
        onChange={(e) => onQuantityChange(e.target.value)}
        style={{ width: '50px', marginLeft: '10px' }}
      />
      {product.__typename === 'ConfigurableProduct' && product.configurable_options && (
        <div>
          {product.configurable_options.map(option => (
            <div key={option.attribute_code}>
              <label>{option.label}: </label>
              <select
                value={selectedOptions[option.attribute_code] || ''}
                onChange={(e) => onOptionChange(option.attribute_code, e.target.value)}
                style={{ borderColor: error && !selectedOptions[option.attribute_code] ? 'red' : undefined }}
              >
                <option value="">Select {option.label}</option>
                {option.values.map(value => (
                  <option key={value.value_index} value={value.value_index}>
                    {value.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
      <button onClick={onAddToCart}>Add to Cart</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </li>
  );
}

export default ProductItem;