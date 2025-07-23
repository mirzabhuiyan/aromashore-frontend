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
} from "../../services/utilityService";
import { validate, validateProperty } from "../../models/shippingAddress";
import {
  getCitiesByStateId,
  getCountriesList,
  getStatesByCountryId,
  createPaymentIntent,
} from "../../services/publicContentsService";
import {
  placeOrder,
  getprofileByCustomer,
} from "../../services/webCustomerService";
import PlacesAutocomplete, {
  geocodeByAddress,
} from "react-places-autocomplete";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";

const stripePromise = loadStripe(
  "pk_test_51Rdb3oIAIc3GSTDYeIvAayHBig6fRvOos4VmhtT4L9azBJgRTyGqinTFI18qBIG0ZGirRYTP6VlYoFBVt5hfrMAy007RvMrZne"
);

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
  // Cookies.set("Card_visited", true);
  const router = useRouter();
  const { cart, clearCart } = useContext(AppStore);
  console.log(cart);
  let { totalAmount } = calculateCart(cart);
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

  const [clientSecret, setClientSecret] = useState("pi_3Ro7ukIAIc3GSTDY04in50dO_secret_1Oc6nJYrCxzgDP1QY9DwEJiGJ");

  // const options = {
  //   clientSecret,
  //   theme: "stripe",
  // };
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
      setShippingAddress({
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
      });

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
  }, [profileCountryList]);

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
      console.log("shippingAddress --------> ", shippingAddress);
      console.log("totalAmount --------> ", totalAmount);
      createPaymentIntent({
        amount: totalAmount,
        currency: "usd",
      })
        .then((res) => {
          console.log("res --------> ", res);
          return res.data;
        })
        .then((data) => {
          console.log("data --------> ", data);
          if (data.appStatus && data.appData?.clientSecret) {
            setClientSecret(data.appData.clientSecret);
          }
        })
        .catch((error) => {
          console.error("Error fetching client secret:", error);
        });
    }
  }, [shippingAddress, totalAmount]);
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

  const handleSubmit = async (e) => {
    if (cart.length > 0) {
      e.preventDefault();
      // console.log("cart", cart);
      // console.log("shipping", shippingAddress);
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
        // console.log(cartItem.quantity)
        cartProducts.push(cartData);
      });
      let shippingAddressCopy = { ...shippingAddress };
      shippingAddressCopy.products = JSON.stringify(cartProducts);
      shippingAddressCopy.amount = totalAmount;
      shippingAddressCopy.total_weight = totalWeight;
      shippingAddressCopy.customer_name =
        shippingAddressCopy.firstname + " " + shippingAddressCopy.lastname;
      // setShippingAddress(shippingAddressCopy);

      // console.log("all info", shippingAddressCopy);

      const errorsCopy = validate({
        customer_id: shippingAddressCopy.customer_id,
        customer_name: shippingAddressCopy.customer_name,
        firstname: shippingAddressCopy.firstname,
        lastname: shippingAddressCopy.lastname,
        address_line_one: shippingAddressCopy.address_line_one,
        city_name: shippingAddressCopy.city_name,
        state_name: shippingAddressCopy.state_name,
        zipcode: shippingAddressCopy.zipcode,
        country_name: shippingAddressCopy.country_name,
      });
      console.log(errorsCopy);
      setErrors(errorsCopy);
      if (errorsCopy) return;

      // console.log("all info validated", shippingAddressCopy);

      try {
        let data = await placeOrder(shippingAddressCopy);
        toast(data.appMessage);
        if (data.appStatus == false) return;
        clearCart();
        router.push("/");
      } catch (error) {
        console.log(error);
      }
    }
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
                                  <div>Please enter your delivery address</div>
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
                                          value={shippingAddress.firstname}
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
                                          value={shippingAddress.lastname}
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
                                            shippingAddress.address_line_one
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
                                            <div>
                                              <input
                                                {...getInputProps({
                                                  placeholder: "Street address",
                                                  className: "form-control",
                                                  onBlur:
                                                    handleAddressLineOneBlur,
                                                })}
                                              />
                                              <div className="autocomplete-dropdown-container">
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
                                            shippingAddress.address_line_two
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
                                        {shippingAddress.country !== "" &&
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
                                            value={shippingAddress.state_name}
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
                                        {shippingAddress.state !== "" &&
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
                                            value={shippingAddress.city_name}
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
                                          value={shippingAddress.zipcode}
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
                                        <label>Phone number</label>
                                        <input
                                          type="text"
                                          name="phone"
                                          placeholder="Phone number"
                                          value={shippingAddress.phone}
                                          onChange={handleChange}
                                          className="form-control"
                                        />
                                      </div>
                                    </div>
                                    <div className="col-12 col-md-12 mb-2">
                                      <div className="form-group">
                                        <label>Order Note</label>
                                        <input
                                          type="text"
                                          name="remarks"
                                          placeholder="Note about your order, e.g, special note for delivery"
                                          value={shippingAddress.remarks}
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
                            <div className="card-header">Shipping method</div>
                            <div className="card-body">
                              <div className="shipping-method-options">
                                <div
                                  className={`shipping-method-option card mb-2 ${
                                    shippingMethod === "standard"
                                      ? "border-primary bg-light"
                                      : ""
                                  }`}
                                  style={{
                                    border: "1px solid #d1d5db",
                                    borderRadius: 8,
                                  }}
                                >
                                  <label
                                    className="d-flex align-items-center p-3 w-100"
                                    style={{ cursor: "pointer" }}
                                  >
                                    <input
                                      type="radio"
                                      name="shippingMethod"
                                      value="standard"
                                      checked={shippingMethod === "standard"}
                                      onChange={() =>
                                        setShippingMethod("standard")
                                      }
                                      style={{ marginRight: 12 }}
                                    />
                                    <div className="flex-grow-1">
                                      <div>
                                        <strong>Standard</strong>
                                      </div>
                                      <div
                                        style={{ color: "#888", fontSize: 14 }}
                                      >
                                        (2 - 5 Business Days)
                                      </div>
                                    </div>
                                    <div
                                      style={{ fontWeight: 600, fontSize: 16 }}
                                    >
                                      $33.93
                                    </div>
                                  </label>
                                </div>
                                <div
                                  className={`shipping-method-option card ${
                                    shippingMethod === "expedited"
                                      ? "border-primary bg-light"
                                      : ""
                                  }`}
                                  style={{
                                    border: "1px solid #d1d5db",
                                    borderRadius: 8,
                                  }}
                                >
                                  <label
                                    className="d-flex align-items-center p-3 w-100"
                                    style={{ cursor: "pointer" }}
                                  >
                                    <input
                                      type="radio"
                                      name="shippingMethod"
                                      value="expedited"
                                      checked={shippingMethod === "expedited"}
                                      onChange={() =>
                                        setShippingMethod("expedited")
                                      }
                                      style={{ marginRight: 12 }}
                                    />
                                    <div className="flex-grow-1">
                                      <div>
                                        <strong>Expedited</strong>
                                      </div>
                                      <div
                                        style={{ color: "#888", fontSize: 14 }}
                                      >
                                        <span
                                          style={{
                                            fontWeight: 600,
                                            color: "#222",
                                          }}
                                        >
                                          Arriving by Thu, Jul 24
                                        </span>
                                        <br />
                                        <span style={{ color: "#1976d2" }}>
                                          If you order in the next 11 hours and
                                          59 minutes.
                                        </span>
                                      </div>
                                    </div>
                                    <div
                                      style={{ fontWeight: 600, fontSize: 16 }}
                                    >
                                      $88.23
                                    </div>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            {clientSecret && (
                              <Elements
                                stripe={stripePromise}
                                options={{
                                  clientSecret: clientSecret,
                                  theme: "stripe",
                                }}
                              >
                                <PaymentSection shippingAddress={shippingAddress} />
                              </Elements>
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
                                  <th>Product</th>
                                  <th className="text-right">Unit Price</th>
                                  <th className="text-right">Total Price</th>
                                </tr>
                              </thead>
                              <tbody>
                                {cart.map((product, i) => (
                                  <tr key={i}>
                                    <td>
                                      <span>
                                        {product.quantity}&nbsp;x&nbsp;
                                      </span>
                                      {product.name} ({product.size}-
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
                                    <td>Total</td>
                                    <td className="text-end">
                                      $&nbsp;{totalAmount}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                          {cart.length > 0 ? (
                            <button
                              onClick={(evt) => handleSubmit(evt)}
                              className="btn -red"
                            >
                              Place Order
                            </button>
                          ) : (
                            <></>
                          )}
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
