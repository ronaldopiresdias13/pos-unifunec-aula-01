export type Product = {
  id: number;
  name: string;
  price: number;
  emoji: string;
};

export type ProductsByCategory = {
  recommended: Product[];
  newProducts: Product[];
};

const stub: ProductsByCategory = {
  recommended: [
    { id: 1, name: "Wireless Headphones", price: 129.9, emoji: "🎧" },
    { id: 2, name: "Running Shoes", price: 89.5, emoji: "👟" },
    { id: 3, name: "Backpack", price: 59.0, emoji: "🎒" },
    { id: 4, name: "Smart Watch", price: 199.99, emoji: "⌚" },
  ],
  newProducts: [
    { id: 5, name: "Mechanical Keyboard", price: 149.0, emoji: "⌨️" },
    { id: 6, name: "Desk Lamp", price: 39.9, emoji: "💡" },
    { id: 7, name: "Coffee Maker", price: 74.0, emoji: "☕" },
    { id: 8, name: "Sunglasses", price: 45.0, emoji: "🕶️" },
  ],
};

export function getProducts(): Promise<ProductsByCategory> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(stub), 200);
  });
}
