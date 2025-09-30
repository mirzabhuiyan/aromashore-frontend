import React, { useContext, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "../../layouts/Layout";
import { AppStore } from "../../store/AppStore";
import PaymentSection from "./PaymentSection";
import {
  calculateCart,
  getFormatedDate,
  getFormatedTime,
  calculateWeight,
  calculateStripeFee,
} from "../../services/utilityService";
import { validate, validateProperty } from "../../models/shippingAddress";
import {
  getCitiesByStateId,
  getCountriesList,
  getStatesByCountryId,
  getAllShippingServices,
} from "../../services/publicContentsService";
import {
  placeOrder,
  getprofileByCustomer,
} from "../../services/webCustomerService";
import PlacesAutocomplete, {
  geocodeByAddress,
} from "react-places-autocomplete";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";

// Stripe promise will be memoized inside the component

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

function smartCityCase(name) {
  // If the name is all uppercase, convert to Title Case
  if (name === name.toUpperCase()) {
    return toTitleCase(name);
  }
  // Otherwise, return as-is
  return name;
}

function getUSCountryOption(countryList) {
  return countryList.find(
    (opt) =>
      opt.label.toLowerCase().includes("united states") ||
      opt.label.toLowerCase().includes("usa") ||
      opt.label.toLowerCase().includes("(us)")
  );
}

export default function Index({ user, customerData }) {
  console.log("[CHECKOUT] customerData --------> ", customerData);
  // Cookies.set("Card_visited", true);
  const router = useRouter();
  const { cart, clearCart } = useContext(AppStore);

  // Memoize the stripePromise so it is not recreated on every render
  const stripePromise = useMemo(
    () =>
      loadStripe(
        "pk_test_51Rdb3oIAIc3GSTDYeIvAayHBig6fRvOos4VmhtT4L9azBJgRTyGqinTFI18qBIG0ZGirRYTP6VlYoFBVt5hfrMAy007RvMrZne"
      ),
    []
  );

  // Debug: Check if clearCart function is available
  console.log("clearCart function available:", typeof clearCart === "function");
  console.log("Current cart length:", cart?.length || 0);
  console.log("Current cart items:", cart);

  const [availableShippingServices, setAvailableShippingServices] = useState(
    []
  );
  const [selectedShippingService, setSelectedShippingService] = useState(null);

  const [shippingAddress, setShippingAddress] = useState(null);
  const [errors, setErrors] = useState({});
  const [shippingMethod, setShippingMethod] = useState("standard");

  const [profileCountryList, setProfileCountryList] = useState([]);
  const [selectedProfileCountry, setSelectedProfileCountry] = useState({
    value: 0,
    label: "",
  });
  const [profileStateList, setProfileStateList] = useState([]);
  const [selectedProfileState, setSelectedProfileState] = useState({
    value: 0,
    label: "",
  });
  const [profileCityList, setProfileCityList] = useState([]);
  const [selectedProfileCity, setSelectedProfileCity] = useState({
    value: 0,
    label: "",
  });
  const [pendingState, setPendingState] = useState(null);
  const [pendingCity, setPendingCity] = useState(null);

  const [orderCreated, setOrderCreated] = useState(false);
  const [paymentConfirmationModalState, setPaymentConfirmationModalState] =
    useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentRetryCount, setPaymentRetryCount] = useState(0);

  let totalWeight = calculateWeight(cart);
  console.log("ShoppingCart Weight", totalWeight);
  const [clientSecret, setClientSecret] = useState(
    "pi_3Ro7ukIAIc3GSTDY04in50dO_secret_1Oc6nJYrCxzgDP1QY9DwEJiGJ"
  );
  let { totalAmount } = calculateCart(cart);

  const [stripeFeeCalculation, setStripeFeeCalculation] = useState({
    originalAmount: 0,
    feeAmount: 0,
    adjustedAmount: 0,
  });

  // Add state to track original shipping cost and markup
  const [shippingCostBreakdown, setShippingCostBreakdown] = useState({
    originalCost: 0,
    markupAmount: 0,
    totalCost: 0,
  });

  // Add state for discount code
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  // Recalculate fee when shipping service or total amount changes
  useEffect(() => {
    const originalShippingCost = selectedShippingService
      ? parseFloat(selectedShippingService.price)
      : 0;
    const markupAmount = originalShippingCost * 0.6; // 60% markup (1.6x total)
    const totalShippingCost = originalShippingCost + markupAmount;
    
    setShippingCostBreakdown({
      originalCost: originalShippingCost,
      markupAmount: markupAmount,
      totalCost: totalShippingCost,
    });
    
    const subtotalWithShipping = totalAmount + totalShippingCost;
    const taxAmount = shippingAddress?.tax_rate ? (subtotalWithShipping * parseFloat(shippingAddress.tax_rate) / 100) : 0;
    const subtotalAfterTax = subtotalWithShipping + taxAmount;
    const totalAfterDiscount = subtotalAfterTax - discountAmount;
    const feeCalc = calculateStripeFee(totalAfterDiscount);
    setStripeFeeCalculation(feeCalc);
  }, [totalAmount, selectedShippingService, shippingAddress?.tax_rate, discountAmount]);

  useEffect(() => {
    getCountriesList()
      .then(function (response) {
        if (response.status === 200 && !response.data["appStatus"]) {
          setProfileCountryList([]);
        } else {
          const tempCountryList = response.data["appData"];
          // console.log(tempCountryList);
          const customCountryList = [];
          tempCountryList.map((cl) => {
            const country = { value: cl.id, label: `${cl.name} (${cl.code})` };
            customCountryList.push(country);
            // console.log("customCountryList --------> ", customCountryList);
            return true;
          });
          setProfileCountryList(customCountryList);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);
  useEffect(() => {
    async function initializeLocation() {
      if (!profileCountryList.length) return;

      // 1. Country
      let countryOption = null;
      if (customerData?.customercontact?.country) {
        countryOption = profileCountryList.find(
          (opt) =>
            Number(opt.value) === Number(customerData.customercontact.country)
        );
      }
      if (!countryOption) {
        countryOption = getUSCountryOption(profileCountryList);
      }
      if (!countryOption) return;
      await handleProfileCountryInputChange(countryOption);
      setSelectedProfileCountry(countryOption);

      // Set initial shipping address with all customer info and selected country
      const initialShippingAddress = {
        order_date: getFormatedDate(new Date()),
        order_time: getFormatedTime(new Date()),
        amount: 0,
        is_paid: 0,
        customer_id: customerData.id,
        customer_type: customerData?.customercategory?.title || "",
        customer_type_id: customerData?.customercategory?.id || "",
        customer_no: customerData.customer_no,
        firstname: customerData.firstname,
        lastname: customerData.lastname,
        customer_name: customerData.firstname + " " + customerData.lastname,
        customer_contact: customerData.contact,
        customer_email: customerData.email,
        customer_company: customerData.company,
        status: 1,
        remarks: "",
        dial_code: customerData.dial_code,
        address_line_one: customerData?.customercontact?.address_line_one || "",
        address_line_two: customerData?.customercontact?.address_line_two || "",
        city: customerData?.customercontact?.city || "",
        city_name: customerData?.customercontact?.city_name || "",
        tax_rate: customerData?.customercontact?.tax_rate || 0,
        state: customerData?.customercontact?.state || "",
        state_code: customerData?.customercontact?.state_code || "",
        state_name: customerData?.customercontact?.state_name || "",
        zipcode: customerData?.customercontact?.zipcode || "",
        country: countryOption.value,
        country_code: countryOption.label.match(/\((.*)\)/)?.[1] || "",
        country_name: countryOption.label.split(" (")[0],
        billing_address: customerData?.customerprofile?.billing_address || "",
        location: customerData?.customerprofile?.location || "",
        zone: customerData?.customerprofile?.zone || "",
        carrier: customerData?.customerprofile?.carrier || "",
        terms: customerData?.customerprofile?.terms || "",
        products: "",
        length: "",
        width: "",
        height: "",
        service_code: "",
        service_name: "",
        measure_unit: "Lbs",
        total_weight: "",
        dial_code: customerData.dial_code || "+1",
        unit: "inch",
      };

      setShippingAddress(initialShippingAddress);
      console.log(
        "[CHECKOUT] Initial shipping address set:",
        initialShippingAddress
      );

      // 2. State
      if (customerData?.customercontact?.state) {
        const stateResp = await getStatesByCountryId(countryOption.value);
        if (
          stateResp &&
          stateResp.status === 200 &&
          stateResp.data &&
          stateResp.data["appStatus"]
        ) {
          const tempStateList = stateResp.data["appData"].map((cl) => ({
            value: cl.id,
            label: `${cl.name} (${cl.code})`,
          }));
          setProfileStateList(tempStateList);
          console.log("tempStateList ------->", customerData.customercontact);
          const stateOption = tempStateList.find(
            (opt) =>
              Number(opt.value) === Number(customerData.customercontact.state)
          );
          if (stateOption) {
            setSelectedProfileState(stateOption);

            // 3. City
            if (customerData?.customercontact?.city) {
              const cityResp = await getCitiesByStateId(stateOption.value);
              if (
                cityResp &&
                cityResp.status === 200 &&
                cityResp.data &&
                cityResp.data["appStatus"]
              ) {
                const tempCityList = cityResp.data["appData"].map((cl) => ({
                  value: cl.id,
                  label: smartCityCase(cl.name),
                  tax_rate: cl.tax_rate,
                }));
                setProfileCityList(tempCityList);

                const cityOption = tempCityList.find(
                  (opt) =>
                    Number(opt.value) ===
                    Number(customerData.customercontact.city)
                );
                if (cityOption) setSelectedProfileCity(cityOption);
              }
            }
          }
        }
      }
    }
    initializeLocation();
  }, [profileCountryList, customerData]);

  // Separate useEffect to log shipping address changes
  useEffect(() => {
    console.log(
      "[CHECKOUT] shippingAddress updated --------> ",
      shippingAddress
    );
  }, [shippingAddress]);

  // Redirect to home if cart is empty
  useEffect(() => {
    if (cart.length === 0 && !hasRedirected && !orderCreated) {
      setHasRedirected(true);
    }
  }, [cart, router, hasRedirected, orderCreated]);

  useEffect(() => {
    if (pendingState && profileStateList.length > 0) {
      const stateOption = profileStateList.find(
        (opt) =>
          opt.label.toLowerCase().includes(pendingState.name.toLowerCase()) ||
          opt.label.toLowerCase().includes(pendingState.code.toLowerCase())
      );
      if (stateOption) {
        setSelectedProfileState(stateOption);
        handleProfileStateInputChange(stateOption);
        setPendingState(null);
      }
    }
  }, [profileStateList, pendingState]);

  useEffect(() => {
    if (pendingCity && profileCityList.length > 0) {
      const cityOption = profileCityList.find((opt) =>
        opt.label.toLowerCase().includes(pendingCity.toLowerCase())
      );
      if (cityOption) {
        handleProfileCityInputChange(cityOption);
        setPendingCity(null);
      }
    }
  }, [profileCityList, pendingCity]);

  useEffect(() => {
    if (shippingAddress && totalAmount > 0) {
      // Calculate total amount including shipping (with 1.6x markup)
      const originalShippingCost = selectedShippingService
        ? parseFloat(selectedShippingService.price)
        : 0;
      const markupAmount = originalShippingCost * 0.6;
      const totalShippingCost = originalShippingCost + markupAmount;
      const totalWithShipping = totalAmount + totalShippingCost;

      console.log("shippingAddress --------> ", shippingAddress);
      console.log("totalAmount --------> ", totalAmount);
      console.log("originalShippingCost --------> ", originalShippingCost);
      console.log("markupAmount --------> ", markupAmount);
      console.log("totalShippingCost --------> ", totalShippingCost);
      console.log("totalWithShipping --------> ", totalWithShipping);
    }
  }, [shippingAddress, totalAmount, selectedShippingService]);

  useEffect(() => {
    console.log("shippingAddress totalweight---->", totalWeight.toString());
    if (shippingAddress && totalAmount > 0) {
      const payload = {
        ...shippingAddress,
        stateCode: shippingAddress?.state_code || "",
        total_weight: totalWeight.toString(),
        totalWeight: totalWeight,
        measure_unit: "Lbs",
      };
      const packageDimension = {
        length: shippingAddress?.length || "",
        width: shippingAddress?.width || "",
        height: shippingAddress?.height || "",
        unit: shippingAddress?.unit || "inch",
        weight: totalWeight.toString(),
        selectedDimension: `${shippingAddress?.length || ""}x${
          shippingAddress?.height || ""
        }x${shippingAddress?.width || ""}x${shippingAddress?.unit || "inch"}`,
      };
      payload.packages = [packageDimension];
      console.log("payload-------->", payload);
      getAllShippingServices(payload).then((res) => {
        if (res.data.appStatus && res.data.appData) {
          // Flatten all services into a single array with carrier info
          const allServices = [];
          console.log("get all shipping services --------> ", res.data.appData);
          res.data.appData.forEach((carrierData) => {
            const { carrier, rates } = carrierData;
            if (Array.isArray(rates)) {
              rates.forEach((rate) => {
                let service = {
                  carrier: carrier,
                  code: "",
                  name: "",
                  price: "",
                  currency: "USD",
                  deliveryTime: "",
                };

                // Handle different carrier response structures
                if (carrier === "UPS") {
                  service.code = rate.Service?.Code || "";
                  service.name = rate.Service?.Description || "";
                  service.price = rate.TotalCharges?.MonetaryValue || "0";
                  service.currency = rate.TotalCharges?.CurrencyCode || "USD";
                  service.deliveryTime =
                    rate.GuaranteedDelivery?.BusinessDaysInTransit +
                    " Business Days";
                } else if (carrier === "FedEx") {
                  service.code = rate.serviceDescription?.code || "";
                  service.name = rate.serviceName || "";
                  service.price =
                    rate.ratedShipmentDetails?.[0]?.totalNetFedExCharge || "0";
                  service.currency =
                    rate.ratedShipmentDetails?.[0]?.currency || "USD";

                  service.deliveryTime =
                    rate.GuaranteedDelivery || "2-5 Business Days";
                } else if (carrier === "USPS") {
                  service.code = rate.serviceDescription?.code || "";
                  service.name = rate.serviceName?.replace(/_/g, " ") || "";
                  service.price =
                    rate.ratedShipmentDetails?.[0]?.totalNetFedExCharge || "0";
                  service.currency =
                    rate.ratedShipmentDetails?.[0]?.currency || "USD";

                  // Set delivery time based on USPS service type
                  const uspsDeliveryTimes = {
                    USPS_GROUND_ADVANTAGE: "3-5 Business Days",
                    PRIORITY_MAIL: "2-3 Business Days",
                    PRIORITY_MAIL_EXPRESS: "1-2 Business Days",
                    FIRST_CLASS_MAIL: "3-5 Business Days",
                  };
                  service.deliveryTime =
                    uspsDeliveryTimes[rate.serviceType] || "2-5 Business Days";
                }

                allServices.push(service);
              });
            }
          });
          setAvailableShippingServices(allServices);
          // Optionally select the first as default
          if (allServices.length > 0)
            setSelectedShippingService(allServices[0]);
        }
      });
    }
  }, [shippingAddress]);

  const handleProfileCountryInputChange = (event) => {
    const value = event.value;
    const nameNCode = event.label.split("(");
    const label = nameNCode[0];
    const code = nameNCode[1].toString().slice(0, -1);

    // Only reset state/city/zip if country actually changed
    setShippingAddress((values) => {
      if (!values) {
        // If values is null, initialize with the new country and clear state/city/zip
        return {
          country: value,
          country_name: label,
          country_code: code,
          state: "",
          state_name: "",
          state_code: "",
          city: "",
          city_name: "",
          zipcode: "",
        };
      }
      if (values.country === value) {
        // Country did not change, keep state/city/zip
        return {
          ...values,
          country: value,
          country_name: label,
          country_code: code,
        };
      } else {
        // Country changed, reset state/city/zip
        return {
          ...values,
          country: value,
          country_name: label,
          country_code: code,
          state: "",
          state_name: "",
          state_code: "",
          city: "",
          city_name: "",
          zipcode: "",
        };
      }
    });

    setSelectedProfileCountry({ value: value, label: `${label} (${code})` });
    setSelectedProfileState({ value: 0, label: "" });
    setSelectedProfileCity({ value: 0, label: "" });
    if (value) {
      getStatesByCountryId(value)
        .then(function (response) {
          console.log("response --------> ", response);
          if (response.status === 200 && !response.data["appStatus"]) {
            setProfileStateList([]);
          } else {
            const tempStateList = response.data["appData"];
            const customStateList = [];
            tempStateList.map((cl) => {
              const state = { value: cl.id, label: `${cl.name} (${cl.code})` };
              customStateList.push(state);
              return true;
            });
            console.log("customStateList --------> ", customStateList);
            setProfileStateList(customStateList);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    } else {
      setProfileStateList([]);
    }
  };

  const handleProfileStateInputChange = (event) => {
    const value = event.value;
    const nameNCode = event.label.split("(");
    const label = nameNCode[0];
    const code = nameNCode[1].toString().slice(0, -1);
    if (value) {
      getCitiesByStateId(value)
        .then(function (response) {
          if (response.status === 200 && !response.data["appStatus"]) {
            setProfileCityList([]);
          } else {
            const tempCityList = response.data["appData"];
            const customCityList = [];
            tempCityList.map((cl) => {
              const city = {
                value: cl.id,
                label: smartCityCase(cl.name),
                tax_rate: cl.tax_rate,
              };
              customCityList.push(city);
              return true;
            });
            setProfileCityList(customCityList);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    } else {
      setProfileCityList([]);
    }
    setShippingAddress((values) => {
      if (values && values.state === value) {
        // State did not change, keep city/city_name
        return { ...values, state: value, state_name: label, state_code: code };
      } else {
        // State changed, reset city/city_name
        return {
          ...values,
          state: value,
          state_name: label,
          state_code: code,
          city: "",
          city_name: "",
          tax_rate: 0,
        };
      }
    });
    setSelectedProfileState({ value: value, label: `${label} (${code})` });
    setSelectedProfileCity({ value: 0, label: "" });
  };

  const handleProfileCityInputChange = (event) => {
    const value = event.value;
    const label = event.label;
    let selectedCityDetail = { value: 0, label: "", tax_rate: 0 };
    if (profileCityList.length > 0) {
      selectedCityDetail = profileCityList.find((cl) => cl.value === value);
    }
    // console.log(selectedCityDetail);
    setShippingAddress((values) => ({
      ...values,
      city: value,
      city_name: label,
      tax_rate:
        selectedCityDetail && selectedCityDetail.tax_rate !== undefined
          ? selectedCityDetail.tax_rate
          : 0,
    }));
    setSelectedProfileCity({ value: value, label: label });
  };

  const handleChange = (e) => {
    // var errorsCopy = { ...errors };
    // console.log("Validating field:", e.currentTarget.name);
    // const errorMessage = validateProperty({ name: e.currentTarget.name, value: e.currentTarget.value });
    // console.log(errorMessage);
    // if (errorMessage) errorsCopy[e.currentTarget.name] = errorMessage;
    // else delete errorsCopy[e.currentTarget.name];
    // setErrors(errorsCopy);
    let shippingAddressCopy = { ...shippingAddress };
    shippingAddressCopy[e.currentTarget.name] = e.currentTarget.value;
    setShippingAddress(shippingAddressCopy);
  };

  const handleChangeOptional = (e) => {
    let shippingAddressCopy = { ...shippingAddress };
    shippingAddressCopy[e.currentTarget.name] = e.currentTarget.value;
    setShippingAddress(shippingAddressCopy);
  };

  const handleSelect = (item, itemName) => {
    let shippingAddressCopy = { ...shippingAddress };
    shippingAddressCopy[itemName] = item;
    setShippingAddress(shippingAddressCopy);
  };

  const handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    var errorsCopy = { ...errors };
    const errorMessage = validateProperty({ name, value });
    if (errorMessage) errorsCopy[name] = errorMessage;
    else delete errorsCopy[name];
    setErrors(errorsCopy);
    let shippingAddressCopy = { ...shippingAddress };
    shippingAddressCopy[name] = value;
    setShippingAddress(shippingAddressCopy);
  };

  // Validation state
  const [isFormValid, setIsFormValid] = useState(false);

  // Validate form and update validation state
  useEffect(() => {
    if (cart.length === 0) {
      setIsFormValid(false);
      return;
    }

    // Validate shipping method selection
    if (!selectedShippingService) {
      setIsFormValid(false);
      return;
    }

    // Don't allow form submission while payment is processing
    if (isProcessingPayment) {
      setIsFormValid(false);
      return;
    }

    // Validate shipping address
    const errorsCopy = validate({
      customer_id: shippingAddress?.customer_id || "",
      customer_name: shippingAddress?.customer_name || "",
      firstname: shippingAddress?.firstname || "",
      lastname: shippingAddress?.lastname || "",
      address_line_one: shippingAddress?.address_line_one || "",
      city_name: shippingAddress?.city_name || "",
      state_name: shippingAddress?.state_name || "",
      zipcode: shippingAddress?.zipcode || "",
      country_name: shippingAddress?.country_name || "",
    });
    console.log(errorsCopy);
    setErrors(errorsCopy);

    if (errorsCopy) {
      setIsFormValid(false);
      return;
    }

    setIsFormValid(true);
  }, [
    cart.length,
    selectedShippingService,
    shippingAddress,
    isProcessingPayment,
  ]);

  // Utility function to force clear cart
  const forceClearCart = () => {
    try {
      localStorage.removeItem("cart");
      sessionStorage.removeItem("cart");
      console.log("Cart forcefully cleared from all storage");
      return true;
    } catch (error) {
      console.error("Failed to force clear cart:", error);
      return false;
    }
  };

  // Function to create order after successful payment
  const createOrderAfterPayment = async (paymentResult) => {
    try {
      console.log("Creating order after payment:", paymentResult);

      let totalWeight = 0;
      const cartProducts = [];
      cart.forEach((cartItem) => {
        console.log(cartItem);
        const cartData = {
          variation_id: cartItem.variation_id,
          price: cartItem.price,
          size: cartItem.size,
          size_unit: cartItem.size_unit,
          quantity: cartItem.quantity,
          weight: cartItem.weight,
          category_id: cartItem.category_id,
          product_id: cartItem.product_id,
          product_no: cartItem.product_no,
          product_name: cartItem.product_name,
          product_image: cartItem.product_image,
        };
        totalWeight += cartItem.quantity * Number(cartItem.weight);
        cartProducts.push(cartData);
      });

      // Calculate total with shipping (using the 1.6x markup)
      const originalShippingCost = parseFloat(selectedShippingService.price) || 0;
      const markupAmount = originalShippingCost * 0.6;
      const totalShippingCost = originalShippingCost + markupAmount;
      const subtotalWithShipping = totalAmount + totalShippingCost;
      const taxAmount = shippingAddress?.tax_rate ? (subtotalWithShipping * parseFloat(shippingAddress.tax_rate) / 100) : 0;
      const subtotalAfterTax = subtotalWithShipping + taxAmount;
      const totalAfterDiscount = subtotalAfterTax - discountAmount;
      const finalTotal = totalAfterDiscount;

      let shippingAddressCopy = { ...shippingAddress };
      shippingAddressCopy.products = JSON.stringify(cartProducts);
      shippingAddressCopy.amount = finalTotal;
      shippingAddressCopy.total_weight = totalWeight;
      shippingAddressCopy.tax_amount = taxAmount;
      shippingAddressCopy.discount_amount = discountAmount;
      shippingAddressCopy.discount_code = discountCode;
      shippingAddressCopy.customer_name =
        (shippingAddressCopy?.firstname || "") +
        " " +
        (shippingAddressCopy?.lastname || "");

      // Add shipping service information
      shippingAddressCopy.service_code = selectedShippingService.code;
      shippingAddressCopy.service_name = selectedShippingService.name;
      shippingAddressCopy.carrier = selectedShippingService.carrier;
      shippingAddressCopy.shipping_cost = totalShippingCost;
      shippingAddressCopy.original_shipping_cost = originalShippingCost;
      shippingAddressCopy.shipping_markup = markupAmount;

      // Add payment information
      shippingAddressCopy.payment_intent_id =
        paymentResult.paymentIntent?.id || paymentResult.id;
      shippingAddressCopy.payment_status =
        paymentResult.paymentIntent?.status || "succeeded";
      shippingAddressCopy.transaction_id =
        paymentResult.paymentIntent?.id || paymentResult.id;
      shippingAddressCopy.is_paid = 1;

      console.log("Order payload:", shippingAddressCopy);

      let data = await placeOrder(shippingAddressCopy);
      console.log("Order creation response:", data.data);

      if (data.data.appStatus) {
        toast.success("Order placed successfully! Redirecting to home...");

        // Clear cart with error handling
        try {
          console.log("Clearing cart...");
          console.log("Cart before clearing:", cart);

          if (typeof clearCart === "function") {
            clearCart();
            console.log("Cart cleared successfully via context function");
          } else {
            console.warn("clearCart function not available, using fallback");
            // Fallback: manually clear localStorage and force page reload
            forceClearCart();
          }
        } catch (error) {
          console.error("Error clearing cart:", error);
          // Fallback: manually clear localStorage
          try {
            forceClearCart();
          } catch (localStorageError) {
            console.error("Error clearing localStorage:", localStorageError);
          }
        }

        setOrderCreated(true);

        // Verify cart is cleared
        setTimeout(() => {
          const remainingCart = localStorage.getItem("cart");
          console.log("Cart verification after clearing:", remainingCart);
          if (remainingCart && remainingCart !== "[]") {
            console.warn("Cart may not have been cleared properly");
            // Force clear if verification fails
            forceClearCart();
          }
        }, 500);

        // Add a small delay to ensure the toast is visible before redirect
        setTimeout(() => {
          // Final verification before redirect
          const finalCartCheck = localStorage.getItem("cart");
          if (finalCartCheck && finalCartCheck !== "[]") {
            console.warn("Cart still has items, forcing clear before redirect");
            forceClearCart();
          }
          router.push("/");
        }, 1500);
      } else {
        toast.error(data.appMessage || "Failed to create order");
        // Revert payment state on order creation failure
        setIsProcessingPayment(false);
        setPaymentConfirmationModalState(false);
        setPaymentError("Order creation failed. Please try again.");
      }
    } catch (error) {
      console.log("[createOrderAfterPayment] Error creating order:", error);
      toast.error("Failed to create order after payment");
      // Revert payment state on error
      setIsProcessingPayment(false);
      setPaymentConfirmationModalState(false);
      setPaymentError("Order creation failed. Please try again.");
    }
  };

  // Function to handle payment failure and revert state
  const handlePaymentFailure = (error) => {
    console.error("Payment failed:", error);
    setIsProcessingPayment(false);
    setPaymentConfirmationModalState(false);
    setPaymentError(error);
    setPaymentRetryCount((prev) => prev + 1);

    // Show error toast
    toast.error(`Payment failed: ${error}`);

    // Clear error after 5 seconds
    setTimeout(() => {
      setPaymentError(null);
    }, 5000);
  };

  // Function to clear payment error and allow form modification
  const handleClearPaymentError = () => {
    setPaymentError(null);
    setPaymentRetryCount(0);
    setIsProcessingPayment(false);
    setPaymentConfirmationModalState(false);
  };

  // Function to apply discount code
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error("Please enter a discount code");
      return;
    }

    setIsApplyingDiscount(true);
    try {
      // This would typically call an API to validate the discount code
      // For now, we'll simulate a 10% discount
      const discountPercent = 10;
      const subtotalWithShipping = totalAmount + shippingCostBreakdown.totalCost;
      const taxAmount = shippingAddress?.tax_rate ? (subtotalWithShipping * parseFloat(shippingAddress.tax_rate) / 100) : 0;
      const subtotalAfterTax = subtotalWithShipping + taxAmount;
      const calculatedDiscount = (subtotalAfterTax * discountPercent) / 100;
      
      setDiscountAmount(calculatedDiscount);
      toast.success(`Discount code applied! You saved $${calculatedDiscount.toFixed(2)}`);
    } catch (error) {
      toast.error("Invalid discount code");
      setDiscountAmount(0);
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  // Function to remove discount
  const handleRemoveDiscount = () => {
    setDiscountCode("");
    setDiscountAmount(0);
    toast.info("Discount code removed");
  };

  const handleAddressLineOneBlur = async (e) => {
    const address = e.target.value;
    if (!address) return;
    try {
      const results = await geocodeByAddress(address);
      if (results && results[0]) {
        const addressComponents = results[0].address_components;
        let city = "",
          state = "",
          stateCode = "",
          zipcode = "",
          country = "",
          countryCode = "";
        addressComponents.forEach((component) => {
          if (component.types.includes("locality")) city = component.long_name;
          if (component.types.includes("administrative_area_level_1")) {
            state = component.long_name;
            stateCode = component.short_name;
          }
          if (component.types.includes("postal_code"))
            zipcode = component.long_name;
          if (component.types.includes("country")) {
            country = component.long_name;
            countryCode = component.short_name;
          }
        });

        // Find country option
        const countryOption = profileCountryList.find((opt) => {
          const match = opt.label.match(/^(.*)\s*\((.*)\)$/);
          let optName = opt.label,
            optCode = "";
          if (match) {
            optName = match[1].trim();
            optCode = match[2].trim();
          }
          if (
            countryCode &&
            optCode.toLowerCase() === countryCode.toLowerCase()
          )
            return true;
          if (
            country &&
            (optName.toLowerCase() === country.toLowerCase() ||
              (country.toLowerCase() === "usa" &&
                optName.toLowerCase().includes("united states")))
          )
            return true;
          if (opt.label.toLowerCase().includes(country.toLowerCase()))
            return true;
          return false;
        });

        if (countryOption) {
          await handleProfileCountryInputChange(countryOption);
          setSelectedProfileCountry(countryOption);
          setPendingState({ name: state, code: stateCode });
          setPendingCity(city);
          setShippingAddress((prev) => ({
            ...prev,
            country_name: country,
            country_code: countryCode,
            state_name: state,
            state_code: stateCode,
            city_name: city,
            zipcode,
          }));
        }
      }
    } catch (e) {
      console.error("Error geocoding address:", e);
    }
  };

  // Memoize the stripePromise so it is not recreated on every render
  return (
    <>
      <ToastContainer />

      <Layout>
        <div className="breadcrumb">
          <div className="container mt-3">
            <h2>Checkout</h2>
            <ul className="p-0">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/shop">Shop</Link>
              </li>
              <li className="active">Checkout</li>
            </ul>
          </div>
        </div>
        <div className="shop">
          <div className="container">
            <div className="checkout">
              <div className="container">
                <div className="row">
                  <div className="col-12 col-lg-7">
                    <form>
                      <div className="checkout__form">
                        <div className="checkout__form__shipping">
                          <div className="card">
                            <div className="card-header">Delivery</div>
                            <div className="card-body">
                              {shippingAddress === null ? (
                                <>
                                  <div className="text-center py-4">
                                    <div
                                      className="spinner-border"
                                      role="status"
                                    >
                                      <span className="visually-hidden">
                                        Loading...
                                      </span>
                                    </div>
                                    <div className="mt-2">
                                      Loading your address information...
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="row">
                                    <div className="form-group">
                                      <div className="mb-3">
                                        <label className="d-block">
                                          Country&nbsp;
                                          <span className="text-danger">*</span>
                                        </label>
                                        <Select
                                          options={profileCountryList}
                                          value={selectedProfileCountry}
                                          onChange={(event) =>
                                            handleProfileCountryInputChange(
                                              event
                                            )
                                          }
                                          required
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-12 col-md-6 mb-2">
                                      <div className="form-group">
                                        <label htmlFor="firstname">
                                          First Name&nbsp;
                                          <span className="text-danger">*</span>
                                        </label>
                                        <input
                                          id="firstname"
                                          name="firstname"
                                          placeholder="First name"
                                          value={
                                            shippingAddress?.firstname || ""
                                          }
                                          onChange={handleChange}
                                          className="form-control"
                                        />
                                        {errors && errors.firstname && (
                                          <div style={{ color: "red" }}>
                                            {errors.firstname}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="col-12 col-md-6 mb-2">
                                      <div className="form-group">
                                        <label>
                                          Last Name&nbsp;
                                          <span className="text-danger">*</span>
                                        </label>
                                        <input
                                          type="text"
                                          name="lastname"
                                          placeholder="Last name"
                                          value={
                                            shippingAddress?.lastname || ""
                                          }
                                          onChange={handleChange}
                                          className="form-control"
                                        />
                                        {errors && errors.lastname && (
                                          <div style={{ color: "red" }}>
                                            {errors.lastname}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="col-12 col-md-12 mb-2">
                                      <div className="form-group">
                                        <label>
                                          Address Line One&nbsp;
                                          <span className="text-danger">*</span>
                                        </label>
                                        <PlacesAutocomplete
                                          value={
                                            shippingAddress?.address_line_one ||
                                            ""
                                          }
                                          onChange={(val) =>
                                            setShippingAddress((prev) => ({
                                              ...prev,
                                              address_line_one: val,
                                            }))
                                          }
                                          onSelect={async (value) => {
                                            setShippingAddress((prev) => ({
                                              ...prev,
                                              address_line_one: value,
                                            }));
                                            try {
                                              const results =
                                                await geocodeByAddress(value);
                                              if (results && results[0]) {
                                                const addressComponents =
                                                  results[0].address_components;
                                                let city = "",
                                                  state = "",
                                                  stateCode = "",
                                                  zipcode = "",
                                                  country = "",
                                                  countryCode = "";
                                                addressComponents.forEach(
                                                  (component) => {
                                                    if (
                                                      component.types.includes(
                                                        "locality"
                                                      )
                                                    )
                                                      city =
                                                        component.long_name;
                                                    if (
                                                      component.types.includes(
                                                        "administrative_area_level_1"
                                                      )
                                                    ) {
                                                      state =
                                                        component.long_name;
                                                      stateCode =
                                                        component.short_name;
                                                    }
                                                    if (
                                                      component.types.includes(
                                                        "postal_code"
                                                      )
                                                    )
                                                      zipcode =
                                                        component.long_name;
                                                    if (
                                                      component.types.includes(
                                                        "country"
                                                      )
                                                    ) {
                                                      country =
                                                        component.long_name;
                                                      countryCode =
                                                        component.short_name;
                                                    }
                                                  }
                                                );

                                                // Find country/state/city options from lists
                                                const countryOption =
                                                  profileCountryList.find(
                                                    (opt) => {
                                                      // Extract name and code from label, e.g. "United States (US)"
                                                      const match =
                                                        opt.label.match(
                                                          /^(.*)\s*\((.*)\)$/
                                                        );
                                                      let optName = opt.label,
                                                        optCode = "";
                                                      if (match) {
                                                        optName =
                                                          match[1].trim();
                                                        optCode =
                                                          match[2].trim();
                                                      }
                                                      // Prefer code match
                                                      if (
                                                        countryCode &&
                                                        optCode.toLowerCase() ===
                                                          countryCode.toLowerCase()
                                                      )
                                                        return true;
                                                      // Accept 'USA' as 'United States'
                                                      if (
                                                        country &&
                                                        (optName.toLowerCase() ===
                                                          country.toLowerCase() ||
                                                          (country.toLowerCase() ===
                                                            "usa" &&
                                                            optName
                                                              .toLowerCase()
                                                              .includes(
                                                                "united states"
                                                              )))
                                                      )
                                                        return true;
                                                      // Fallback: partial match
                                                      if (
                                                        opt.label
                                                          .toLowerCase()
                                                          .includes(
                                                            country.toLowerCase()
                                                          )
                                                      )
                                                        return true;
                                                      return false;
                                                    }
                                                  );
                                                let stateOption = null,
                                                  cityOption = null;

                                                if (countryOption) {
                                                  await handleProfileCountryInputChange(
                                                    countryOption
                                                  );
                                                  setSelectedProfileCountry(
                                                    countryOption
                                                  );
                                                  // Wait for state list to load
                                                  setPendingState({
                                                    name: state,
                                                    code: stateCode,
                                                  });
                                                  setPendingCity(city);
                                                  setShippingAddress(
                                                    (prev) => ({
                                                      ...prev,
                                                      country_name: country,
                                                      country_code: countryCode,
                                                      state_name: state,
                                                      state_code: stateCode,
                                                      city_name: city,
                                                      zipcode,
                                                    })
                                                  );
                                                }
                                              }
                                            } catch (e) {
                                              console.error(
                                                "Error geocoding address:",
                                                e
                                              );
                                            }
                                          }}
                                          onBlur={handleAddressLineOneBlur}
                                        >
                                          {({
                                            getInputProps,
                                            suggestions,
                                            getSuggestionItemProps,
                                            loading,
                                          }) => (
                                            <div
                                              style={{ position: "relative" }}
                                            >
                                              <input
                                                {...getInputProps({
                                                  placeholder: "Street address",
                                                  className: "form-control",
                                                  onBlur:
                                                    handleAddressLineOneBlur,
                                                  style: {
                                                    color: "#333",
                                                    backgroundColor: "#fff",
                                                    border: "1px solid #ced4da",
                                                    borderRadius: "4px",
                                                    padding: "8px 12px",
                                                    fontSize: "14px",
                                                    width: "100%",
                                                  },
                                                })}
                                              />
                                              <div
                                                className="autocomplete-dropdown-container"
                                                style={{
                                                  border: "1px solid #ced4da",
                                                  borderTop: "none",
                                                  backgroundColor: "#fff",
                                                  maxHeight: "200px",
                                                  overflowY: "auto",
                                                  zIndex: 1000,
                                                  position: "absolute",
                                                  width: "100%",
                                                  borderRadius: "0 0 4px 4px",
                                                }}
                                              >
                                                {loading && (
                                                  <div>Loading...</div>
                                                )}
                                                {suggestions.map(
                                                  (suggestion) => {
                                                    const className =
                                                      suggestion.active
                                                        ? "suggestion-item--active"
                                                        : "suggestion-item";
                                                    const suggestionProps =
                                                      getSuggestionItemProps(
                                                        suggestion,
                                                        { className }
                                                      );
                                                    const {
                                                      key,
                                                      ...otherProps
                                                    } = suggestionProps;
                                                    return (
                                                      <div
                                                        key={key}
                                                        {...otherProps}
                                                        style={{
                                                          padding: "10px",
                                                          cursor: "pointer",
                                                          borderBottom:
                                                            "1px solid #f0f0f0",
                                                          backgroundColor:
                                                            suggestion.active
                                                              ? "#f8f9fa"
                                                              : "#fff",
                                                          color: "#333",
                                                        }}
                                                      >
                                                        <span>
                                                          {
                                                            suggestion.description
                                                          }
                                                        </span>
                                                      </div>
                                                    );
                                                  }
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </PlacesAutocomplete>
                                        {errors && errors.address && (
                                          <div style={{ color: "red" }}>
                                            {errors.address}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="col-12 col-md-12 mb-2">
                                      <div className="form-group">
                                        <label>
                                          Address Line Two&nbsp;
                                          <span className="text-danger">*</span>
                                        </label>
                                        <input
                                          type="text"
                                          name="address_line_two"
                                          placeholder="Steet address"
                                          value={
                                            shippingAddress?.address_line_two ||
                                            ""
                                          }
                                          onChange={handleChangeOptional}
                                          className="form-control"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-12 col-md-4 mb-2">
                                      <div className="mb-3">
                                        <label className="d-block">
                                          State/Division&nbsp;
                                          <span className="text-danger">*</span>
                                        </label>
                                        {shippingAddress?.country !== "" &&
                                        profileStateList.length > 0 ? (
                                          <Select
                                            options={profileStateList}
                                            value={selectedProfileState}
                                            onChange={(event) =>
                                              handleProfileStateInputChange(
                                                event
                                              )
                                            }
                                            required
                                          />
                                        ) : (
                                          <input
                                            className="form-control"
                                            type="text"
                                            name="state_name"
                                            value={
                                              shippingAddress?.state_name || ""
                                            }
                                            onChange={handleChange}
                                          />
                                        )}
                                      </div>
                                    </div>
                                    <div className="col-12 col-md-4 mb-2">
                                      <div className="mb-3">
                                        <label className="d-block">
                                          City&nbsp;
                                          <span className="text-danger">*</span>
                                        </label>
                                        {shippingAddress?.state !== "" &&
                                        profileCityList.length > 0 ? (
                                          <Select
                                            options={profileCityList}
                                            value={selectedProfileCity}
                                            onChange={(event) =>
                                              handleProfileCityInputChange(
                                                event
                                              )
                                            }
                                            required
                                          />
                                        ) : (
                                          <input
                                            className="form-control"
                                            type="text"
                                            name="city_name"
                                            value={
                                              shippingAddress?.city_name || ""
                                            }
                                            onChange={handleChange}
                                          />
                                        )}
                                      </div>
                                    </div>
                                    <div className="col-12 col-md-4 mb-2">
                                      <div className="form-group">
                                        <label>
                                          Postcode/ZIP&nbsp;
                                          <span className="text-danger">*</span>
                                        </label>
                                        <input
                                          type="text"
                                          name="zipcode"
                                          placeholder="Postcode/ZIP"
                                          value={shippingAddress?.zipcode || ""}
                                          onChange={handleChange}
                                          className="form-control"
                                        />
                                        {errors && errors.zipcode && (
                                          <div style={{ color: "red" }}>
                                            {errors.zipcode}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="col-12 col-md-12 mb-2">
                                      <div className="form-group">
                                        <label>Order Note</label>
                                        <input
                                          type="text"
                                          name="remarks"
                                          placeholder="Note about your order, e.g, special note for delivery"
                                          value={shippingAddress?.remarks || ""}
                                          onChange={handleChangeOptional}
                                          className="form-control"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          {/* Shipping Method Card - Added below Delivery Card */}
                          <div className="card mt-4">
                            <div className="card-header">
                              Shipping method
                              <small className="text-muted ms-2">
                                (Prices include service & handling fees)
                              </small>
                            </div>
                            <div className="card-body">
                              <div className="shipping-method-options">
                                {availableShippingServices.length === 0 ? (
                                  <div>Loading shipping methods...</div>
                                ) : (
                                  availableShippingServices.map((svc, idx) => (
                                    <div
                                      key={svc.carrier + svc.code}
                                      className={`shipping-method-option mb-3 ${
                                        selectedShippingService &&
                                        selectedShippingService.code ===
                                          svc.code &&
                                        selectedShippingService.carrier ===
                                          svc.carrier
                                          ? "selected"
                                          : ""
                                      }`}
                                      style={{
                                        border:
                                          selectedShippingService &&
                                          selectedShippingService.code ===
                                            svc.code &&
                                          selectedShippingService.carrier ===
                                            svc.carrier
                                            ? "2px solid #007bff"
                                            : "1px solid #e0e0e0",
                                        borderRadius: 8,
                                        backgroundColor:
                                          selectedShippingService &&
                                          selectedShippingService.code ===
                                            svc.code &&
                                          selectedShippingService.carrier ===
                                            svc.carrier
                                            ? "#f8f9ff"
                                            : "#ffffff",
                                        padding: "16px",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                      }}
                                      onClick={() =>
                                        setSelectedShippingService(svc)
                                      }
                                    >
                                      <div className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center">
                                          <input
                                            type="radio"
                                            name="shippingMethod"
                                            value={svc.code}
                                            checked={
                                              selectedShippingService &&
                                              selectedShippingService.code ===
                                                svc.code &&
                                              selectedShippingService.carrier ===
                                                svc.carrier
                                            }
                                            onChange={() =>
                                              setSelectedShippingService(svc)
                                            }
                                            style={{
                                              marginRight: 12,
                                              width: "18px",
                                              height: "18px",
                                              accentColor: "#007bff",
                                            }}
                                          />
                                          <div>
                                            <div
                                              style={{
                                                fontWeight: "bold",
                                                fontSize: "16px",
                                                color: "#333",
                                                marginBottom: "4px",
                                              }}
                                            >
                                              {svc.name}
                                            </div>
                                            <div
                                              style={{
                                                color: "#666",
                                                fontSize: "14px",
                                                fontStyle: "italic",
                                              }}
                                            >
                                              ({svc.carrier} -{" "}
                                              {svc.deliveryTime ||
                                                "2-5 Business Days"})
                                            </div>
                                            <div
                                              style={{
                                                color: "#888",
                                                fontSize: "12px",
                                              }}
                                            >
                                              Base: ${parseFloat(svc.price).toFixed(2)} + Service Fee
                                            </div>
                                          </div>
                                        </div>
                                        <div
                                          style={{
                                            fontWeight: "bold",
                                            fontSize: "18px",
                                            color: "#333",
                                          }}
                                        >
                                          ${(parseFloat(svc.price) * 1.6).toFixed(2)}
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Discount Code Card */}
                          <div className="card mt-4">
                            <div className="card-header">Discount Code</div>
                            <div className="card-body">
                              <div className="row">
                                <div className="col-md-8">
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter discount code"
                                    value={discountCode}
                                    onChange={(e) => setDiscountCode(e.target.value)}
                                    disabled={isApplyingDiscount}
                                  />
                                </div>
                                <div className="col-md-4">
                                  {discountAmount > 0 ? (
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger w-100"
                                      onClick={handleRemoveDiscount}
                                      disabled={isApplyingDiscount}
                                    >
                                      Remove
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      className="btn btn-primary w-100"
                                      onClick={handleApplyDiscount}
                                      disabled={isApplyingDiscount || !discountCode.trim()}
                                    >
                                      {isApplyingDiscount ? (
                                        <>
                                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                          Applying...
                                        </>
                                      ) : (
                                        "Apply"
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                              {discountAmount > 0 && (
                                <div className="mt-2 text-success">
                                  <i className="bi bi-check-circle me-1"></i>
                                  Discount applied: -${discountAmount.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            {!shippingAddress ? (
                              <div className="alert alert-info">
                                <i className="bi bi-info-circle me-2"></i>
                                <strong>
                                  Loading address information...
                                </strong>{" "}
                                Please wait while we load your shipping details.
                              </div>
                            ) : !clientSecret ? (
                              <div className="alert alert-warning">
                                <i className="bi bi-exclamation-triangle me-2"></i>
                                <strong>Loading payment system...</strong>{" "}
                                Please wait while we prepare your payment.
                              </div>
                            ) : !isFormValid ? (
                              <div className="alert alert-info">
                                <i className="bi bi-info-circle me-2"></i>
                                <strong>Complete the form above</strong> to
                                proceed with payment and place your order.
                              </div>
                            ) : (
                              <>
                                {isProcessingPayment && (
                                  <div className="alert alert-info mb-3">
                                    <div className="d-flex align-items-center">
                                      <div
                                        className="spinner-border spinner-border-sm me-2"
                                        role="status"
                                      >
                                        <span className="visually-hidden">
                                          Loading...
                                        </span>
                                      </div>
                                      <strong>Processing payment...</strong>{" "}
                                      Please wait while we complete your
                                      transaction.
                                    </div>
                                  </div>
                                )}
                                {paymentError && (
                                  <div className="alert alert-danger mb-3">
                                    <div className="d-flex align-items-center justify-content-between">
                                      <div>
                                        <i className="bi bi-exclamation-triangle me-2"></i>
                                        <strong>Payment Error:</strong>{" "}
                                        {paymentError}
                                        {paymentRetryCount > 0 && (
                                          <div className="mt-1 text-muted">
                                            Attempt {paymentRetryCount} failed
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <Elements
                                  stripe={stripePromise}
                                  options={{
                                    clientSecret: clientSecret,
                                    theme: "stripe",
                                  }}
                                >
                                  <PaymentSection
                                    shippingAddress={shippingAddress}
                                    clientSecret={clientSecret}
                                    amount={stripeFeeCalculation.adjustedAmount}
                                    onPaymentSuccess={(paymentResult) => {
                                      console.log(
                                        "Payment successful:",
                                        paymentResult
                                      );
                                      // setIsProcessingPayment(true);
                                      // setPaymentConfirmationModalState(true);
                                      // Create order after successful payment
                                      if (paymentResult && paymentResult.id)
                                        createOrderAfterPayment(paymentResult);
                                    }}
                                    onPaymentError={(error) => {
                                      handlePaymentFailure(error);
                                    }}
                                  />
                                </Elements>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                  <div className="col-12 col-lg-5">
                    <div className="row">
                      <div className="col-12 col-md-6 col-lg-12 ml-auto">
                        <div className="checkout__total">
                          <h5 className="checkout-title">Your order</h5>
                          <div className="checkout__total__price">
                            {/* <h5>Product</h5> */}
                            <table>
                              <thead>
                                <tr>
                                  <th colSpan={2}>Product</th>
                                  <th className="text-right">Unit Price</th>
                                  <th className="text-right">Total Price</th>
                                </tr>
                              </thead>
                              <tbody>
                                {cart.map((product, i) => (
                                  <tr key={i}>
                                    <td>
                                      {product.product_image ? (
                                        <img
                                          // crossorigin="anonymous"
                                          src={product.product_image}
                                          alt={product.product_name}
                                          height={75}
                                          width={75}
                                        />
                                      ) : (
                                        <img
                                          src="/app/assets/images/200.svg"
                                          alt="Placeholder"
                                          height={75}
                                          width={75}
                                        />
                                      )}
                                    </td>
                                    <td>
                                      <span>
                                        {product.quantity}&nbsp;x&nbsp;
                                      </span>
                                      {product.product_name} ({product.size}-
                                      {product.size_unit})
                                    </td>
                                    <td className="text-right">
                                      $&nbsp;{product.price}
                                    </td>
                                    <td className="text-right">
                                      $&nbsp;{product.price * product.quantity}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <div className="checkout__total__price__total-count">
                              <table>
                                <tbody>
                                  <tr>
                                    <td className="text-start">
                                      Subtotal:
                                    </td>
                                    <td className="text-end">
                                      $&nbsp;{totalAmount.toFixed(2)}
                                    </td>
                                  </tr>
                                  {selectedShippingService && (
                                    <>
                                      <tr>
                                        <td className="text-start">
                                          {selectedShippingService.carrier} {selectedShippingService.name}:
                                        </td>
                                        <td className="text-end">
                                          $&nbsp;{shippingCostBreakdown.originalCost.toFixed(2)}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td className="text-start">
                                          Service & Handling Fee:
                                        </td>
                                        <td className="text-end">
                                          $&nbsp;{shippingCostBreakdown.markupAmount.toFixed(2)}
                                        </td>
                                      </tr>
                                    </>
                                  )}
                                  {shippingAddress?.tax_rate !== undefined && (
                                    <tr>
                                      <td className="text-start">
                                        Sales Tax ({shippingAddress.tax_rate || 0}%):
                                      </td>
                                      <td className="text-end">
                                        $&nbsp;
                                        {((totalAmount + shippingCostBreakdown.totalCost) * parseFloat(shippingAddress.tax_rate || 0) / 100).toFixed(2)}
                                      </td>
                                    </tr>
                                  )}
                                  {discountAmount > 0 && (
                                    <tr>
                                      <td className="text-start">
                                        Discount:
                                      </td>
                                      <td className="text-end text-success">
                                        -$&nbsp;{discountAmount.toFixed(2)}
                                      </td>
                                    </tr>
                                  )}
                                  {stripeFeeCalculation.feeAmount > 0 && (
                                    <tr>
                                      <td className="text-start">
                                        Payment Processing Fee:
                                      </td>
                                      <td className="text-end">
                                        $&nbsp;
                                        {stripeFeeCalculation.feeAmount.toFixed(2)}
                                      </td>
                                    </tr>
                                  )}
                                  <tr
                                    style={{
                                      borderTop: "1px solid #ddd",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    <td className="text-start">Total:</td>
                                    <td className="text-end">
                                      $&nbsp;
                                      {stripeFeeCalculation.adjustedAmount.toFixed(2)}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export async function getServerSideProps(context) {
  try {
    const user = context.req.cookies.user
      ? JSON.parse(context.req.cookies.user)
      : null;

    if (!user) {
      return {
        redirect: {
          destination: "/login",
        },
      };
    }
    const { data: profileData } = await getprofileByCustomer(user);
    console.log("profileData.appData --------> ", profileData.appData);
    return {
      props: {
        customerData: profileData.appData,
        user: user,
      },
    };
  } catch (error) {
    return {
      props: {
        customerData: null,
        user: {},
      },
    };
  }
}
