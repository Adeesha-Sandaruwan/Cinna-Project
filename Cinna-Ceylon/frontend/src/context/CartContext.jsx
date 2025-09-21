import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItemCount, setCartItemCount] = useState(0);

  const fetchCartCount = async (userId = 'default') => {
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const productCount = data.items ? data.items.reduce((sum, item) => sum + (item.qty || 0), 0) : 0;
        const offerCount = data.offerItems ? data.offerItems.reduce((sum, item) => sum + (item.qty || 0), 0) : 0;
        setCartItemCount(productCount + offerCount);
      }
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
    }
  };

  useEffect(() => {
    fetchCartCount(); // Initial fetch

    const handleCartUpdate = () => fetchCartCount();
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  return (
    <CartContext.Provider value={{ cartItemCount, fetchCartCount }}>
      {children}
    </CartContext.Provider>
  );
};
