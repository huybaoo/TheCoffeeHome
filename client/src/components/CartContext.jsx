import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartCount, setCartCount] = useState(0);
    const [cartItems, setCartItems] = useState([]);

    const sizePrices = {
        S: 0,
        M: 10000,
        L: 16000,
    };

    const updateCartCount = (count) => {
        setCartCount(count);
        localStorage.setItem('cartCount', count);
    };

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(storedCart);
        const totalCount = storedCart.reduce((acc, item) => acc + item.quantity, 0);
        updateCartCount(totalCount);
    }, []);

    const addToCart = (product, quantity, selectedSize, selectedToppings) => {
        const cart = [...cartItems];
        const existingProduct = cart.find(item => item.productId === product._id && item.selectedSize === selectedSize);
        
        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            cart.push({
                productId: product._id,
                productName: product.Name,
                price: parseInt(product.Price) + sizePrices[selectedSize] + selectedToppings.reduce((total, topping) => total + 10000, 0), // Cập nhật giá
                image: product.Img,
                quantity: quantity,
                selectedSize: selectedSize,
                selectedToppings: selectedToppings
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        setCartItems(cart);
        const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
        updateCartCount(totalCount);
    };

    const increaseQuantity = (productId) => {
        const updatedCart = cartItems.map(item => {
            if (item.productId === productId) {
                return { ...item, quantity: item.quantity + 1 };
            }
            return item;
        });
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        updateCartCount(updatedCart.reduce((acc, item) => acc + item.quantity, 0));
    };
    
    const decreaseQuantity = (productId) => {
        const updatedCart = cartItems.map(item => {
            if (item.productId === productId && item.quantity > 1) {
                return { ...item, quantity: item.quantity - 1 };
            }
            return item;
        });
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        updateCartCount(updatedCart.reduce((acc, item) => acc + item.quantity, 0));
    };

    const removeFromCart = (productId) => {
        const updatedCart = cartItems.filter(item => item.productId !== productId);
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        const totalCount = updatedCart.reduce((acc, item) => acc + item.quantity, 0);
        updateCartCount(totalCount);
    };

    return (
        <CartContext.Provider value={{ cartCount, updateCartCount, addToCart, removeFromCart, increaseQuantity, decreaseQuantity }}>
            {children}
        </CartContext.Provider>
    );
};