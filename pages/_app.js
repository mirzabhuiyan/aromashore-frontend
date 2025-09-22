import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import App from "next/app";
// import Router from "next/router";
import { AppStore } from "../store/AppStore";
import "../styles/Home.module.css";
import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getprofileByCustomer } from "../services/webCustomerService";
import { calculateCart } from "../services/utilityService";
import { toast, ToastContainer } from "react-toastify";
import Script from 'next/script';
import { globalProductImageAddress } from '../config';
import PromotionalPopup from '../components/common/PromotionalPopup';
import { saveUserSession, getCurrentUser, clearUserSession } from "../services/authService";

function MyApp({
  Component,
  pageProps: { userInfo, ...pageProps },
}) {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(userInfo);
  const [customerData, setCustomerData] = useState(null);

  // Helper function to get proper product image URL
  const getProductImageUrl = (imageData) => {
    if (!imageData) return "";
    
    // Handle both old base64 and new file-based images
    if (imageData.startsWith('data:')) {
      return imageData; // Base64 image
    } else if (imageData.startsWith('http')) {
      return imageData; // Already a full URL
    } else {
      return `${globalProductImageAddress}${imageData}`; // File-based image
    }
  };

  // Load cart from localStorage on app initialization
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      localStorage.removeItem("cart"); // Clear corrupted data
    }
  }, []);

  useEffect(() => {
    // Only make API calls in browser environment, not during build
    if (typeof window !== 'undefined' && user) {
      profieData(user);
    }
  }, [user]);

  // Hydrate user from cookies on mount if not provided
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!user) {
      const u = getCurrentUser();
      if (u) setUser(u);
    }
  }, []);

  const profieData = async (userInfo) => {
    try {
      console.log('profieData ---->', userInfo);
      const { data: profileData } = await getprofileByCustomer(userInfo);
      console.log("profileData.appData --------> ", profileData.appData);
      setCustomerData(profileData.appData);
    } catch (error) {
      console.warn('Failed to fetch profile data:', error.message);
      setCustomerData(null);
    }
  }

  // Helper function to save cart to localStorage and update state
  const saveCart = useCallback((newCart) => {
    try {
      localStorage.setItem("cart", JSON.stringify(newCart));
      setCart(newCart);
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
      toast.error("Failed to save cart");
    }
  }, []);

  const add_TO_CART = ({ productDetails, unit, bundleId = null }) => {
    console.log('_app add_TO_CART ----> ', productDetails, unit, bundleId);
    const existingItemIndex = cart.findIndex(
      (item) => item.id === productDetails.id && item.bundleId === bundleId
    );

    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += unit;
      saveCart(updatedCart);
    } else {
      const newItem = {
        id: productDetails.id,
        name: productDetails.name,
        price: productDetails.price,
        quantity: unit,
        image: getProductImageUrl(productDetails.image),
        bundleId: bundleId,
        bundleName: bundleId ? productDetails.bundleName : null,
      };
      saveCart([...cart, newItem]);
    }
  };

  const remove_FROM_CART = (productId, bundleId = null) => {
    const updatedCart = cart.filter(
      (item) => !(item.id === productId && item.bundleId === bundleId)
    );
    saveCart(updatedCart);
  };

  const update_CART_QUANTITY = (productId, quantity, bundleId = null) => {
    if (quantity <= 0) {
      remove_FROM_CART(productId, bundleId);
      return;
    }

    const updatedCart = cart.map((item) =>
      item.id === productId && item.bundleId === bundleId
        ? { ...item, quantity }
        : item
    );
    saveCart(updatedCart);
  };

  const clear_CART = () => {
    saveCart([]);
  };

  const get_CART_TOTAL = () => {
    return calculateCart(cart);
  };

  const get_CART_ITEMS_COUNT = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const add_TO_WISHLIST = (productDetails) => {
    try {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const existingItem = wishlist.find((item) => item.id === productDetails.id);

      if (!existingItem) {
        const newItem = {
          id: productDetails.id,
          name: productDetails.name,
          price: productDetails.price,
          image: getProductImageUrl(productDetails.image),
        };
        wishlist.push(newItem);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        toast.success("Added to wishlist!");
      } else {
        toast.info("Already in wishlist!");
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Failed to add to wishlist");
    }
  };

  const remove_FROM_WISHLIST = (productId) => {
    try {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const updatedWishlist = wishlist.filter((item) => item.id !== productId);
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      toast.success("Removed from wishlist!");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    }
  };

  const get_WISHLIST = () => {
    try {
      return JSON.parse(localStorage.getItem("wishlist") || "[]");
    } catch (error) {
      console.error("Error getting wishlist:", error);
      return [];
    }
  };

  const is_IN_WISHLIST = (productId) => {
    try {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      return wishlist.some((item) => item.id === productId);
    } catch (error) {
      console.error("Error checking wishlist:", error);
      return false;
    }
  };

  return (
    <AppStore.Provider
      value={{
        cart,
        user,
        setUSER: (u) => {
          if (u) {
            saveUserSession(u);
            setUser(u);
          } else {
            clearUserSession();
            setUser(null);
          }
        },
        logout: () => {
          clearUserSession();
          setUser(null);
        },
        customerData,
        add_TO_CART,
        remove_FROM_CART,
        update_CART_QUANTITY,
        clear_CART,
        get_CART_TOTAL,
        get_CART_ITEMS_COUNT,
        add_TO_WISHLIST,
        remove_FROM_WISHLIST,
        get_WISHLIST,
        is_IN_WISHLIST,
      }}
    >
      <Script
        src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=USD"
        strategy="afterInteractive"
      />
      <Component {...pageProps} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <PromotionalPopup />
    </AppStore.Provider>
  );
}

MyApp.getInitialProps = async (context) => {
  console.log("_APP -- getServerSideProps ----->>>", context);
  const pageProps = await App.getInitialProps(context);
  
  // Only fetch user data in browser environment, not during build
  if (typeof window !== 'undefined') {
    try {
      const userInfo = Cookies.get("userInfo");
      if (userInfo) {
        return {
          ...pageProps,
          userInfo: JSON.parse(userInfo),
        };
      }
    } catch (error) {
      console.warn('Failed to parse user info:', error.message);
    }
  }
  
  return {
    ...pageProps,
    userInfo: null,
  };
};

export default MyApp;
