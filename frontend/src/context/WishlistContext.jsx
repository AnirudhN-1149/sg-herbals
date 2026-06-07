import React, { createContext, useContext, useState } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const addToWishlist = (product) => {
    const identifier = product.cartId || product.id;
    setWishlistItems(prev => {
      const exists = prev.find(item => (item.cartId || item.id) === identifier);
      if (exists) {
        return prev.map(item =>
          (item.cartId || item.id) === identifier
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, cartId: identifier }];
    });
  };

  const removeFromWishlist = (identifier) => {
    setWishlistItems(prev => prev.filter(item => (item.cartId || item.id) !== identifier));
  };

  const updateQuantity = (identifier, qty) => {
    if (qty < 1) {
      removeFromWishlist(identifier);
      return;
    }
    setWishlistItems(prev =>
      prev.map(item => (item.cartId || item.id) === identifier ? { ...item, quantity: qty } : item)
    );
  };

  const clearWishlist = () => setWishlistItems([]);

  const totalItems = wishlistItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = wishlistItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      updateQuantity,
      clearWishlist,
      totalItems,
      subtotal,
      isDrawerOpen,
      setIsDrawerOpen
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
