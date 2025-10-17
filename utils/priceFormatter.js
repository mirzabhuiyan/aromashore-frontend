// Price formatting utility functions
export const formatPrice = (price, options = {}) => {
  if (price === null || price === undefined || price === '') {
    return '0.00';
  }
  
  const numPrice = parseFloat(price);
  if (isNaN(numPrice)) {
    return '0.00';
  }
  
  const {
    showCurrency = true,
    currency = '$',
    decimals = 2,
    prefix = '',
    suffix = ''
  } = options;
  
  const formattedPrice = numPrice.toFixed(decimals);
  
  if (showCurrency) {
    return `${prefix}${currency}${formattedPrice}${suffix}`;
  }
  
  return `${prefix}${formattedPrice}${suffix}`;
};

// Common price formatting functions
export const formatPriceWithCurrency = (price) => formatPrice(price, { showCurrency: true });
export const formatPriceWithoutCurrency = (price) => formatPrice(price, { showCurrency: false });
export const formatPriceWithSpaces = (price) => formatPrice(price, { showCurrency: true, prefix: '$ ' });

// For displaying prices in JSX
export const PriceDisplay = ({ price, className = '', showCurrency = true, ...props }) => {
  const formattedPrice = showCurrency ? formatPriceWithCurrency(price) : formatPriceWithoutCurrency(price);
  return <span className={className} {...props}>{formattedPrice}</span>;
};

export default formatPrice;
