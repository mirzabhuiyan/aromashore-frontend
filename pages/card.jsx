import React,{useState, useMemo} from "react";
import {loadStripe} from "@stripe/stripe-js";
import {Elements, CardElement, useStripe, useElements} from "@stripe/react-stripe-js";
import axios from "axios";
import Router from "next/router";
import Cookies from "js-cookie";

const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": { color: "#aab7c4" }
    },
    invalid: { color: "#9e2146", iconColor: "#9e2146" }
  },
  hidePostalCode: true
};

function CardForm() {
  const stripe = useStripe();
  const elements = useElements();

  Cookies.set("Card_visited", false);
  const cardDataCookie = Cookies.get("card_data");
  const [ini_card_name, ini_card_number, ini_card_cvc, ini_card_expiry] = cardDataCookie ? JSON.parse(cardDataCookie) : [null, null, null, null];
  const [name, setName] = useState(ini_card_name  || "");
  const [number, setNumber] = useState(ini_card_number  || "");
  const [cvc, setCvc] = useState(ini_card_cvc || "");
  const [expiry, setExpiry] = useState(ini_card_expiry  || "");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setIsLoading(true);
    setMessage(null);
    try {
      // Minimal client-side validation; real payment confirmation happens on checkout page
      const card = elements.getElement(CardElement);
      if (!card) throw new Error("Card element not ready");
      // Just demo navigate back home
      Router.push("/");
    } catch (err) {
      setMessage(err.message || "Payment form error");
    }
    setIsLoading(false);
  };

  return (
    <div className="card-div">
      <form className="card-form" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Card Information</label>
          <div className="border rounded p-3">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        <input
          type="tel"
          name="number"
          className="card-input"
          value={number}
          placeholder={"Enter Number"}
          onChange={e => setNumber(e.target.value)}
        /><br/>

        <input
          type="tel"
          name="name"
          className="card-input"
          value={name}
          placeholder={"Enter Name"}
          onChange={e => setName(e.target.value)}
        /><br/>
        <input
          type="tel"
          name="expiry"
          className="card-input"
          value={expiry}
          placeholder={"Enter Expiry date"}
          onChange={e => setExpiry(e.target.value)}
        /><br/>
        <input
          type="tel"
          name="cvc"
          className="card-input"
          value={cvc}
          placeholder={"Enter Cvc"}
          onChange={e => setCvc(e.target.value)}
        /><br/>
        {message && <div className="alert alert-danger">{message}</div>}
        <button className="btn -red" type="submit" disabled={!stripe || isLoading}>
          {isLoading ? "Processing..." : "Pay now"}
        </button>
      </form>
    </div>
  );
}

export default function CardPage() {
  const stripePromise = useMemo(
    () => loadStripe("pk_test_51Rdb3oIAIc3GSTDYeIvAayHBig6fRvOos4VmhtT4L9azBJgRTyGqinTFI18qBIG0ZGirRYTP6VlYoFBVt5hfrMAy007RvMrZne"),
    []
  );
  return (
    <Elements stripe={stripePromise}>
      <CardForm />
    </Elements>
  );
}

