import React,{useState} from "react";
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import Cards from 'react-credit-cards-2';
import axios from "axios";
import Router from "next/router";
import Cookies from "js-cookie";

export default function App() {

  Cookies.set("Card_visited", false)
  const cardDataCookie = Cookies.get("card_data");
  const [ini_card_name, ini_card_number, ini_card_cvc, ini_card_expiry] = cardDataCookie ? JSON.parse(cardDataCookie) : [null, null, null, null];
  const [name, setName] = useState(ini_card_name  || null);
  const [number, setNumber] = useState(ini_card_number  || null); 
  const [cvc, setCvc] = useState(ini_card_cvc || null);
  const [expiry, setExpiry] = useState(ini_card_expiry  || null);
  
  const [focus, setFocus] = useState('');



  const handleSubmit = (event) => {
    Router.push("/")
    event.preventDefault()
    //axios.post("(postLink)", {
    //  number: number,
    //  name: name,
    //  expiry: expiry,
    //  cvc: cvc
    //})
  }

  return (
    <div className="card-div">
       <Cards
          cvc={cvc ? cvc : ""}
          expiry={expiry ? expiry : ""}
          focused={focus ? focus : ""}
          name={name ? name : ""}
          number={number ? number : ""}
        />
      <form className="card-form" onSubmit={handleSubmit}>

        <input
          type="tel"
          name="number"
          className="card-input"
          value={number}
          val={number}
          placeholder={"Enter Number"}
          onChange={e => setNumber(e.target.value)}
          onFocus={e=> setFocus(e.target.name)}
        /><br/>

        <input
          type="tel"
          name="name"
          className="card-input"
          value={name}
          val={name}
          placeholder={"Enter Name"}
          onChange={e => setName(e.target.value)}
          onFocus={e=>setFocus(e.target.name)}
        /><br/>
        <input
          type="tel"
          name="expiry"
          className="card-input"
          value={expiry}
          val={expiry}
          placeholder={"Enter Expiry date"}
          onChange={e => setExpiry(e.target.value)}
          onFocus={e=>setFocus(e.target.name)}
        /><br/>
        <input
          type="tel"
          name="cvc"
          className="card-input"
          value={cvc}
          val={cvc}
          placeholder={"Enter Cvc"}
          onChange={e => setCvc(e.target.value)}
          onFocus={e=>setFocus(e.target.name)}
        /><br/>
        <button className="btn -red" type="submit">
          Pay now
        </button>
      </form>
    </div>
  );
}

