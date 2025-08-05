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
    if (user) {
      profieData(user);
    }
  }, [user]);

  const profieData = async (userInfo) => {
    console.log('profieData ---->', userInfo);
    const { data: profileData } = await getprofileByCustomer(userInfo);
    console.log("profileData.appData --------> ", profileData.appData);
    setCustomerData(profileData.appData);
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
    
    if (bundleId != null) {
      // Handle bundle products
      const allCartItems = [];
      productDetails.forEach((pd, indx) => {
        const copyCart = allCartItems.length > 0 ? [...allCartItems] : [...cart];
        console.log('copyCart ------->', copyCart);
        
        const newCart = {
          "variation_id": unit[indx].id,
          "price": unit[indx].sale_price && unit[indx].sale_price > 0 ? unit[indx].sale_price : unit[indx].price,
          "size": unit[indx].size,
          "size_unit": unit[indx].size_unit,
          "quantity": unit[indx].qty,
          "weight": unit[indx].weight,
          "category_id": pd.productcategoryId,
          "product_id": pd.id,
          "product_no": pd.product_no,
          "product_name": pd.name,
          "product_image": pd.productimages.length > 0 ? getProductImageUrl(pd.productimages[0].image) : "",
          "bundle_id": bundleId,
          "measure_unit": unit[indx].measure_unit
        }
        
        const findCartItems = copyCart.filter((item) => pd.id === item.product_id);
        console.log('findCartItem', findCartItems);
        
        let updatedCart = [];
        if (findCartItems.length > 0) {
          let noDuplicateVariation = true;
          findCartItems.forEach((findCartItem) => {
            if (findCartItem.variation_id == unit[indx].id && findCartItem.bundle_id == bundleId) {
              console.log('same variation with new quantity', findCartItem, unit[indx].qty);
              const duplicateProductVariationIndx = copyCart.indexOf(findCartItem);
              copyCart[duplicateProductVariationIndx].quantity = unit[indx].qty;
              noDuplicateVariation = false;
            }
          });
          
          if (noDuplicateVariation) {
            updatedCart = [newCart];
          }
        } else {
          console.log('new cart item');
          updatedCart = [newCart];
        }
        
        allCartItems.push(...copyCart, ...updatedCart);
      });
      
      saveCart(allCartItems);
    } else {
      // Handle single product
      const copyCart = [...cart];
      const newCart = {
        "variation_id": unit.id,
        "price": unit.sale_price && unit.sale_price > 0 ? unit.sale_price : unit.price,
        "size": unit.size,
        "size_unit": unit.size_unit,
        "quantity": unit.qty,
        "weight": unit.weight,
        "category_id": productDetails.productcategory?.id,
        "product_id": productDetails.id,
        "product_no": productDetails.product_no,
        "product_name": productDetails.name,
        "product_image": productDetails.productimages.length > 0 ? getProductImageUrl(productDetails.productimages[0].image) : "",
        "bundle_id": 0
      }
      
      console.log('_app add_TO_CART', newCart);
      const findCartItems = copyCart.filter((item) => productDetails.id === item.product_id);
      console.log('findCartItem', findCartItems);
      
      let updatedCart = [];
      if (findCartItems.length > 0) {
        let noDuplicate = true;
        findCartItems.forEach((findCartItem) => {
          if (findCartItem.variation_id == unit.id && findCartItem.bundle_id == 0) {
            console.log('same variation with new quantity', findCartItem, unit.qty);
            const duplicateProductVariationIndx = copyCart.indexOf(findCartItem);
            copyCart[duplicateProductVariationIndx].quantity = findCartItem.quantity + unit.qty;
            noDuplicate = false;
          }
        });
        
        if (noDuplicate) {
          updatedCart = [...copyCart, newCart];
        } else {
          updatedCart = copyCart;
        }
      } else {
        console.log('new cart item');
        updatedCart = [...copyCart, newCart];
      }
      
      saveCart(updatedCart);
    }
  };

  const delete_ITEM_FROM_CART = ({ product }) => {
    console.log('delete_ITEM_FROM_CART', product);
    console.log('current cart', cart);
    
    const filteredCart = cart.filter(item => {
      if (product.bundle_id) {
        return item.bundle_id !== product.bundle_id;
      } else {
        return item.variation_id !== product.variation_id;
      }
    });
    
    console.log('filtered cart', filteredCart);
    saveCart(filteredCart);
  };

  const increment_TO_CART_ITEM = ({ product }) => {
    console.log('increment_TO_CART_ITEM', product);
    let copyCart = [...cart];
    const findCartItem = copyCart.find((item) => 
      item.variation_id == product.variation_id && 
      item.product_id == product.product_id && 
      item.bundle_id == (product.bundle_id || 0)
    );
    
    if (findCartItem) {
      findCartItem.quantity += 1;
      saveCart(copyCart);
    }
  };

  const decrement_TO_CART_ITEM = ({ product }) => {
    console.log('decrement_TO_CART_ITEM', product);
    let copyCart = [...cart];
    const findCartItem = copyCart.find((item) => 
      item.variation_id == product.variation_id && 
      item.product_id == product.product_id && 
      item.bundle_id == (product.bundle_id || 0)
    );
    
    if (findCartItem && findCartItem.quantity > 1) {
      findCartItem.quantity -= 1;
      saveCart(copyCart);
    } else if (findCartItem && findCartItem.quantity === 1) {
      // Remove item if quantity would become 0
      delete_ITEM_FROM_CART({ product });
    }
  };

  const clearCart = useCallback(() => {
    console.log("clearCart function called");
    console.log("Cart before clearing:", cart);
    setCart([]);
    localStorage.removeItem("cart");
    console.log("Cart after clearing:", []);
    toast.success("Cart cleared successfully");
  }, []);

  const setUSER = useCallback((user) => {
    Cookies.set("user", JSON.stringify(user));
    setUser(user);
    window.location = "/";
  }, []);

  const logout = useCallback(() => {
    Cookies.remove("user");
    setUser(null);
    window.location = "/";
  }, []);

  const storeValue = {
    cart,
    add_TO_CART,
    delete_ITEM_FROM_CART,
    increment_TO_CART_ITEM,
    decrement_TO_CART_ITEM,
    clearCart,
    user,
    setUSER,
    logout,
    customerData,
  };

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyCe92gBOWPXDIKSNCwI9RfYZEtJffQpaT8&libraries=places`}
        strategy="beforeInteractive"
      />
      <ToastContainer />
      <AppStore.Provider value={storeValue}>
        <Component {...pageProps} />
        <PromotionalPopup />
      </AppStore.Provider>
    </>
  );
}

export default MyApp;

MyApp.getInitialProps = async (context) => {
  console.log("_APP -- getServerSideProps ----->>>", context);
  const pageProps = await App.getInitialProps(context);
  let userInfo = null;
  try {
    userInfo = context.ctx.req?.cookies?.user
      ? JSON.parse(context.ctx.req?.cookies?.user)
      : null;

    console.log("userInfo ------>>", userInfo);
    return {
      pageProps: { userInfo, ...pageProps },
    };
  } catch (error) {
    console.log("eTTTrror", error);
    return {
      pageProps: {
        userInfo, pageProps
      },
    };
  }
};

