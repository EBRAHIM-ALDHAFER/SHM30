import { Product } from "../../../types";

export const formatMoney = (n: number) => {
  return n.toLocaleString("ar-SA") + " ر.س";
};

export const getProductHealth = (prod: Product) => {
  let score = 90;
  if (prod.stock === 0) {
    score -= 85; // Critical
  } else if (prod.stock < 15) {
    score -= 40; // low stock warning
  }
  
  // profit margin ratio
  const profitMargin = prod.price - prod.cost;
  if (profitMargin <= 0) {
    score -= 50; // zero or loss margin
  } else if (profitMargin < 20) {
    score -= 15; // thin margin
  }
  
  return Math.max(5, Math.min(score, 100));
};
