export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export const formatPriceSigned = (n: number) => {
  if (n === 0) return "Included";
  const sign = n > 0 ? "+" : "−";
  return `${sign}${formatPrice(Math.abs(n))}`;
};