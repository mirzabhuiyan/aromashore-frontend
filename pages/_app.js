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
import { createShoppingCart, clearShoppingCart, getprofileByCustomer, getCartDetailsByCustomerId } from "../services/webCustomerService";
import { calculateCart } from "../services/utilityService";
import { toast, ToastContainer } from "react-toastify";
import Script from 'next/script';

function MyApp({
  Component,
  pageProps: { userInfo, ...pageProps },
}) {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(userInfo);
  const [customerData, setCustomerData] = useState(null);
  // const [companyInfo, setCompanyInfo] = useState(null);

  useEffect(() => {
    if (user) {
      profieData(user);
    } else {
      if (JSON.parse(localStorage.getItem("cart"))) {
        let loadCart = JSON.parse(localStorage.getItem("cart"));
        setCart(loadCart);
      }
    }
  }, []);

  const getCartFromDB = async () => {
    console.log(userInfo);
    if (userInfo) {
      const cartData = await getCartDetailsByCustomerId(userInfo.uid);
      console.log("getCartFromDB cartData --------> ", cartData);
      if (cartData.status == 200 && cartData.data.appStatus) {
        let loadCart = cartData.data.appData ? cartData.data.appData.salesorderdetail.products : null;
        setCart(loadCart ? JSON.parse(loadCart) : []);
        localStorage.setItem("cart", loadCart);
      }
    }
  }

  const profieData = async (userInfo) => {
    console.log('profieData ---->', userInfo);
    const { data: profileData } = await getprofileByCustomer(userInfo);
    console.log("profileData.appData --------> ", profileData.appData);


    // let customCartData = {
    //   "variation_id": cartItem.units.id,
    //   "price": cartItem.units.price,
    //   "size": cartItem.units.size,
    //   "size_unit": cartItem.units.size_unit,
    //   "quantity": cartItem.units.quantity,
    //   "weight": cartItem.units.weight,
    //   "category_id": cartItem.productcategory.id,
    //   "product_id": cartItem.id,
    //   "product_no": cartItem.product_no,
    //   "product_name": cartItem.name
    // };

    setCustomerData(profileData.appData);
    console.log(localStorage.getItem("cart"));
    let cart = JSON.parse(localStorage.getItem("cart"));
    if (cart) {
      saveCartToDB(cart, profileData.appData);
    } else {
      getCartFromDB();
    }
  }

  const saveCartToDB = async (cart, customerDataX) => {
    console.log('saveCartToDB ------>', cart);
    if (cart.length > 0) {
      console.log('saveCartToDB customerData------>', customerDataX);
      if (customerDataX) {
        let { totalAmount } = calculateCart(cart);
        // console.log("cart", cart);
        // console.log("shipping", shippingAddress);
        let totalWeight = 0;
        const cartProducts = [];
        cart.forEach(cartItem => {
          const cartData = {
            "variation_id": cartItem.variation_id,
            "price": cartItem.price,
            "size": cartItem.size,
            "size_unit": cartItem.size_unit,
            "quantity": cartItem.quantity,
            "weight": cartItem.weight,
            "category_id": cartItem.category_id,
            "product_id": cartItem.product_id,
            "product_no": cartItem.product_no,
            "product_name": cartItem.product_name,
            "product_image": cartItem.product_image,
            "bundle_id": cartItem.bundle_id
          };
          totalWeight += cartItem.quantity * Number(cartItem.weight);
          // console.log(cartItem.quantity)
          cartProducts.push(cartData);
        });
        let shippingAddressCopy = {
          products: JSON.stringify(cartProducts),
          amount: totalAmount,
          total_weight: totalWeight,
          customer_id: customerDataX.id,
          customer_type: customerDataX?.customercategory?.title || '',
          customer_type_id: customerDataX?.customercategory?.id || '',
          customer_no: customerDataX.customer_no,
          customer_name: customerDataX.firstname + customerDataX.lastname,
          dial_code: customerDataX.dial_code,
          customer_contact: customerDataX.contact,
          customer_email: customerDataX.email,
          customer_company: customerDataX.company,
          status: 99
        }

        console.log("all info validated", shippingAddressCopy);

        try {
          let data = await createShoppingCart(shippingAddressCopy);
          toast(data.appMessage);
          if (data.appStatus == false) return;
          console.log('added to db cart');
          localStorage.setItem("cart", JSON.stringify(cart));
        } catch (error) {
          console.log(error)
        }
      } else {
        localStorage.setItem("cart", JSON.stringify(cart));
      }
    } else {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
    setCart(cart);
  };

  const add_TO_CART = ({ productDetails, unit, bundleId = null }) => {
    console.log('_app add_TO_CART ----> ', productDetails, unit, bundleId);
    // console.log('old cart', cart);
    if (bundleId != null) {
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
          "product_image": pd.productimages.length > 0 ? pd.productimages[0].image_link : "",
          "bundle_id": bundleId
        }
        const findCartItems = copyCart.filter((item) => pd.id === item.product_id);
        console.log('findCartItem', findCartItems);
        const updatedCart = [];
        if (findCartItems.length > 0) {
          let noDuplicateVariation = true;
          findCartItems.forEach((findCartItem) => {
            console.log('fuck', findCartItem);
            if (findCartItem.variation_id == unit[indx].id) {
              console.log('same variation with new quantity', findCartItem, unit[indx].qty);
              const duplicateProductVariationIndx = copyCart.indexOf(findCartItem);
              console.log(duplicateProductVariationIndx);
              copyCart[duplicateProductVariationIndx].quantity = unit[indx].qty;
              noDuplicateVariation = false;
            }
          });
          console.log('no Duplicate Variation', noDuplicateVariation);
          if (noDuplicateVariation) {
            console.log(newCart);
            updatedCart = [newCart];
            // saveCartToDB(updatedCart, customerData);
          }
        } else {
          console.log('notun cart item');
          updatedCart = [newCart];
          // saveCartToDB(updatedCart, customerData);
        }
        allCartItems = [...copyCart, ...updatedCart];
      });
      saveCartToDB(allCartItems, customerData);
    } else {
      const copyCart = [...cart];
      const updatedCart = [];
      console.log('copyCart ------->', copyCart);
      const newCart = {
        "variation_id": unit.id,
        "price": unit.sale_price && unit.sale_price > 0 ? unit.sale_price : unit.price,
        "size": unit.size,
        "size_unit": unit.size_unit,
        "quantity": unit.qty,
        "weight": unit.weight,
        "category_id": productDetails.productcategoryId,
        "product_id": productDetails.id,
        "product_no": productDetails.product_no,
        "product_name": productDetails.name,
        "product_image": productDetails.productimages.length > 0 ? productDetails.productimages[0].image_link : "",
        "bundle_id": bundleId
      }
      const findCartItems = copyCart.filter((item) => productDetails.id === item.product_id);
      console.log('findCartItem', findCartItems);
      if (findCartItems.length > 0) {
        let noDuplicate = true;
        findCartItems.forEach((findCartItem) => {
          console.log('fuck', findCartItem);
          if (findCartItem.variation_id == unit.id) {
            console.log('same variation with new quantity', findCartItem, unit.qty);
            const duplicateProductVariationIndx = copyCart.indexOf(findCartItem);
            console.log(duplicateProductVariationIndx);
            copyCart[duplicateProductVariationIndx].quantity = findCartItem.quantity + unit.qty;
            noDuplicate = false;
          }
        });
        console.log('noDuplicate', noDuplicate);
        if (noDuplicate) {
          console.log(newCart);
          updatedCart = [...copyCart, newCart];
          // saveCartToDB(updatedCart, customerData);
        } else {
          // saveCartToDB(copyCart, customerData);
          updatedCart = copyCart
        }
      } else {
        console.log('notun cart item');
        updatedCart = [...copyCart, newCart];
        // saveCartToDB(updatedCart, customerData);
      }
      saveCartToDB(updatedCart, customerData);
    }
  };

  const delete_ITEM_FROM_CART = ({ product }) => {
    console.log(product);
    console.log(cart);
    // let copyCart = [...cart];
    const filteredCart = cart.filter(item => {
      console.log(item);
      return (product.bundle_id ? item.bundle_id != product.bundle_id : item.variation_id != product.variation_id)
    });
    // copyCart = [...filteredCart];
    console.log(filteredCart);
    saveCartToDB(filteredCart, customerData);
  };

  const increment_TO_CART_ITEM = ({ product }) => {
    console.log(product);
    let copyCart = [...cart];
    const findCartItem = copyCart.find((item) => item.variation_id == product.variation_id && item.product_id == product.product_id && product.bundle_id == null);
    if (findCartItem) {
      findCartItem.quantity += 1;
    }
    saveCartToDB(copyCart, customerData);
  };

  const decrement_TO_CART_ITEM = ({ product }) => {
    console.log(product);
    let copyCart = [...cart];
    const findCartItem = copyCart.find((item) => item.variation_id == product.variation_id && item.product_id == product.product_id && product.bundle_id == null);
    if (findCartItem && findCartItem.quantity > 1) {
      findCartItem.quantity -= 1;
    }
    saveCartToDB(copyCart, customerData);
  };

  const removeFromDB = async () => {
    try {
      let data = await clearShoppingCart(userInfo.uid);
      toast(data.appMessage);
      if (data.appStatus == false) return;
      console.log('db cart cleared');
    } catch (error) {
      console.log(error)
    }
  }

  const clearCart = useCallback(() => {
    removeFromDB();
    setCart([]);
    localStorage.removeItem("cart");
  }, []);

  const setUSER = useCallback((user) => {
    Cookies.set("user", JSON.stringify(user));
    setUser(user);
    // Router.push('/');
    window.location = "/";
  }, []);

  const logout = useCallback(() => {
    Cookies.remove("user");
    setUser(null);
    window.location = "/";
    // Router.push('/');
    // setCompanyInfo(null);
    // window.location = "/";
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
    // companyInfo,
    logout,
    customerData,
  };

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`}
        strategy="beforeInteractive"
      />
      <ToastContainer />
      <AppStore.Provider value={storeValue}>
        <Component {...pageProps} />
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
