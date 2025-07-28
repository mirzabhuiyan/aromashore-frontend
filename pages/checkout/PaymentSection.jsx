import React, { useState, useEffect } from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { PaymentElement } from "@stripe/react-stripe-js";

const PaymentSection = ({ shippingAddress }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);
    const [billingAddress, setBillingAddress] = useState({
      country: shippingAddress?.country_name || "",
      firstname: shippingAddress?.firstname || "",
      lastname: shippingAddress?.lastname || "",
      company: shippingAddress?.customer_company || "",
      address: shippingAddress?.address_line_one || "",
    });
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      console.log("elements --------> ", elements);
      console.log("useShippingAsBilling --------> ", useShippingAsBilling);
      console.log("shippingAddress --------> ", shippingAddress);
      if (useShippingAsBilling && shippingAddress) {
        setBillingAddress({
          country: shippingAddress.country_name || "",
          firstname: shippingAddress.firstname || "",
          lastname: shippingAddress.lastname || "",
          company: shippingAddress.customer_company || "",
          address: shippingAddress.address_line_one || "",
        });
      }
    }, [useShippingAsBilling, shippingAddress]);

    const handleBillingChange = (e) => {
      setBillingAddress({ ...billingAddress, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!stripe || !elements) return;
      setIsLoading(true);
      setMessage(null);
      try {
        const response = await stripe.confirmPayment({
          elements,
          confirmParams: {
            payment_method_data: {
              billing_details: {
                name: `${billingAddress.firstname} ${billingAddress.lastname}`.trim(),
                address: {
                  line1: billingAddress.address,
                  country: billingAddress.country,
                },
              },
            },
            // return_url: window.location.origin + '/order-complete',
          },
        });
        console.log("PAYMENTresponse --------> ", response);
        if (response.error) {
          setMessage(response.error.message);
        } else {
          setMessage("Payment successful!");
        }
      } catch (error) {
        console.log("error --------> ", error);
      }
      setIsLoading(false);
    };

    return (
      <div className="card mt-4">
        <div className="card-header">Payment</div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="d-block mb-2">
                <strong>Credit card</strong>
              </label>
              <div className="mb-2">
                <img
                  src="https://img.icons8.com/color/32/000000/visa.png"
                  alt="Visa"
                  style={{ marginRight: 4 }}
                />
                <img
                  src="https://img.icons8.com/color/32/000000/mastercard-logo.png"
                  alt="Mastercard"
                  style={{ marginRight: 4 }}
                />
                <img
                  src="https://img.icons8.com/color/32/000000/amex.png"
                  alt="Amex"
                  style={{ marginRight: 4 }}
                />
                <img
                  src="https://img.icons8.com/color/32/000000/discover.png"
                  alt="Discover"
                  style={{ marginRight: 4 }}
                />
                <span style={{ fontWeight: 600, fontSize: 14, marginLeft: 8 }}>
                  +3
                </span>
              </div>
            </div>
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="useShippingAsBilling"
                checked={useShippingAsBilling}
                onChange={() => setUseShippingAsBilling(!useShippingAsBilling)}
              />
              <label
                className="form-check-label"
                htmlFor="useShippingAsBilling"
              >
                Use shipping address as billing address
              </label>
            </div>
            {!useShippingAsBilling && (
              <div
                className="mb-3 p-3"
                style={{ background: "#f7f7f7", borderRadius: 8 }}
              >
                <div className="mb-2">
                  <strong>Billing address</strong>
                </div>
                <div className="row">
                  <div className="col-12 col-md-6 mb-2">
                    <input
                      className="form-control"
                      name="firstname"
                      placeholder="First name (optional)"
                      value={billingAddress.firstname}
                      onChange={handleBillingChange}
                    />
                  </div>
                  <div className="col-12 col-md-6 mb-2">
                    <input
                      className="form-control"
                      name="lastname"
                      placeholder="Last name (optional)"
                      value={billingAddress.lastname}
                      onChange={handleBillingChange}
                    />
                  </div>
                  <div className="col-12 mb-2">
                    <input
                      className="form-control"
                      name="company"
                      placeholder="Company (optional)"
                      value={billingAddress.company}
                      onChange={handleBillingChange}
                    />
                  </div>
                  <div className="col-12 mb-2">
                    <input
                      className="form-control"
                      name="address"
                      placeholder="Address"
                      value={billingAddress.address}
                      onChange={handleBillingChange}
                    />
                  </div>
                  <div className="col-12 mb-2">
                    <input
                      className="form-control"
                      name="country"
                      placeholder="Country/Region"
                      value={billingAddress.country}
                      onChange={handleBillingChange}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="mb-3">
              <PaymentElement options={{ layout: "tabs" }} />
            </div>
            {message && <div className="alert alert-info">{message}</div>}
            <button
              className="btn btn-primary w-100"
              type="submit"
              disabled={isLoading || !stripe}
            >
              {isLoading ? "Processing..." : "Pay now"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  export default PaymentSection;