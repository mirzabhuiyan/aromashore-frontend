import React, { useState, useEffect } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { createPaymentIntent } from "../../services/publicContentsService";
// Enhanced Stripe Elements configuration
const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
      ":-webkit-autofill": {
        color: "#fce883",
      },
    },
    invalid: {
      color: "#9e2146",
      iconColor: "#9e2146",
    },
  },
  hidePostalCode: true, // We'll handle billing address separately
};

const PaymentSection = ({
  shippingAddress,
  onPaymentSuccess,
  onPaymentError,
  clientSecret,
  amount,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [hasMounted, setHasMounted] = useState(false);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorType, setErrorType] = useState(null);
  const [intendId, setIntendId] = useState("");
  console.log("[PaymentSection] Props received:", {
    clientSecret: clientSecret ? "Present" : "Missing",
    shippingAddress: shippingAddress ? "Present" : "Missing",
    amount: amount,
    hasStripe: !!stripe,
    hasElements: !!elements
  });
  
  if (shippingAddress) {
    console.log("[PaymentSection] shippingAddress details:", {
      firstname: shippingAddress.firstname,
      lastname: shippingAddress.lastname,
      address_line_one: shippingAddress.address_line_one,
      city: shippingAddress.city_name,
      state: shippingAddress.state_code,
      postal_code: shippingAddress.zipcode,
      country: shippingAddress.country_code
    });
  }

  useEffect(() => {
    setHasMounted(true);
    console.log("[PaymentSection] createPaymentIntent secret --------> ", amount, clientSecret, intendId);
    try {
      createPaymentIntent(amount).then(res => {
        console.log("[PaymentSection] createPaymentIntent response --------> ", res);
        if (res.data && res.data.appStatus && res.data.appData) {
          setIntendId(res.data.appData.clientSecret);
        } else {
          console.error("[PaymentSection] Invalid response format:", res.data);
        }
      }).catch(error => {
        console.log("[PaymentSection] createPaymentIntent error --------> ", error);
      });
    } catch (error) {
      console.log("[PaymentSection] createPaymentIntent error --------> ", error);
    }
  }, [amount]);

  // Reset form state when elements change (for retry attempts)
  useEffect(() => {
    if (elements) {
      setMessage(null);
      setErrorType(null);
      setIsLoading(false);
    }
  }, [elements]);

  // Handle card element changes
  const handleCardElementChange = (elementType) => (event) => {
    setCardComplete((prev) => ({
      ...prev,
      [elementType]: event.complete,
    }));
  };

  const handleSubmit = async (e) => {
    
    e.preventDefault();
    if (!stripe || !elements) {
      setMessage(
        "Payment system is not ready. Please wait a moment and try again."
      );
      setErrorType("system");
      return;
    }

    const currentClientSecret = intendId || clientSecret;
    if (!currentClientSecret) {
      setMessage(
        "Payment intent not ready. Please wait a moment and try again."
      );
      setErrorType("system");
      return;
    }

    if (!shippingAddress) {
      setMessage("Shipping address is required for payment processing.");
      setErrorType("validation");
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setErrorType(null);

    try {
      const response = await stripe.confirmCardPayment(currentClientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: `${shippingAddress?.firstname || ''} ${shippingAddress?.lastname || ''}`.trim(),
            address: {
              line1: shippingAddress?.address_line_one || '',
              line2: shippingAddress?.address_line_two || '',
              city: shippingAddress?.city_name || '',
              state: shippingAddress?.state_code || '',
              postal_code: shippingAddress?.zipcode || '',
              country: shippingAddress?.country_code || '',
            },
          },
        },
      });

      console.log("[PaymentSection] PAYMENTresponse --------> ", response);

      if (response.error) {
        // Categorize error types for better user experience
        let errorMessage = response.error.message;
        let errorCategory = "payment";

        if (
          response.error.type === "card_error" ||
          response.error.type === "validation_error"
        ) {
          errorCategory = "card";
          errorMessage = `Card Error: ${response.error.message}`;
        } else if (response.error.type === "authentication_error") {
          errorCategory = "authentication";
          errorMessage = "Payment authentication failed. Please try again.";
        } else if (response.error.type === "api_error") {
          errorCategory = "system";
          errorMessage = "Payment system error. Please try again in a moment.";
        }

        setMessage(errorMessage);
        setErrorType(errorCategory);
        onPaymentError(errorMessage);
      } else if (response.paymentIntent) {
        setMessage("Payment successful!");
        setErrorType("success");
        onPaymentSuccess({
          paymentIntent: response.paymentIntent,
          id: response.paymentIntent.id,
          status: response.paymentIntent.status,
        });
      }
    } catch (error) {
      console.log("[PaymentSection] error --------> ", error);
      const errorMessage =
        "An unexpected error occurred during payment processing. Please try again.";
      setMessage(errorMessage);
      setErrorType("system");
      onPaymentError(errorMessage);
    }
    setIsLoading(false);
  };

  const getMessageStyle = () => {
    if (errorType === "success") {
      return "alert alert-success";
    } else if (errorType === "card") {
      return "alert alert-warning";
    } else if (errorType === "authentication") {
      return "alert alert-info";
    } else if (errorType === "validation") {
      return "alert alert-warning";
    } else {
      return "alert alert-danger";
    }
  };

  if (!hasMounted) return null;

  if (!shippingAddress) {
    return (
      <div className="card mt-4">
        <div className="card-header">Payment</div>
        <div className="card-body">
          <div className="alert alert-warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <strong>Shipping address required</strong> - Please complete your shipping information above before proceeding with payment.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card mt-4">
      <div className="card-header">Payment</div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Card Information</label>
            <div className="border rounded p-3">
              <CardElement
                options={cardElementOptions}
                onChange={handleCardElementChange("card")}
              />
            </div>
          </div>
          {message && <div className={getMessageStyle()}>{message}</div>}
          <button
            // type="submit"
            className="btn btn-primary w-100"
            disabled={isLoading || !stripe}
            onClick={handleSubmit}
          >
            {isLoading ? "Processing..." : `Pay $${(amount || 0).toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentSection;
