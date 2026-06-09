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

  const changeItemSize = (oldCartId, newSizeLabel, newPrice) => {
    setWishlistItems(prev => {
      const oldItem = prev.find(item => item.cartId === oldCartId);
      if (!oldItem) return prev;
      
      const productId = oldItem.id;
      const newCartId = `${productId}-${newSizeLabel}`;
      
      const existingNewItem = prev.find(item => item.cartId === newCartId);
      if (existingNewItem) {
        // Merge: update quantity of existingNewItem and remove oldItem
        return prev.map(item => {
          if (item.cartId === newCartId) {
            return { ...item, quantity: item.quantity + oldItem.quantity };
          }
          return item;
        }).filter(item => item.cartId !== oldCartId);
      } else {
        // Swap: update size, price, and cartId
        return prev.map(item => {
          if (item.cartId === oldCartId) {
            return { ...item, size: newSizeLabel, price: newPrice, cartId: newCartId };
          }
          return item;
        });
      }
    });
  };

  const totalItems = wishlistItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = wishlistItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      updateQuantity,
      clearWishlist,
      changeItemSize,
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
