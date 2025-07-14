import Cookies from "js-cookie";
import {apiUrl} from "../config";
import http from "./httpService";
const apiEndPoint = apiUrl + "/web/customer/login";
const api2FAEndPoint = apiUrl + "/web/customer/login/2fa-verify";

export async function login({username, password, code, twofa}) {
  console.log('login called')
  Cookies.set("login", true)
  if (twofa) {
    // OTP verification step
    return await http.post(api2FAEndPoint, { username, code });
  } else {
    // Normal login step
    const {data} = await http.post(apiEndPoint, {username, password});
    return data;
  }
}

export function logout() {
  Cookies.remove("user");
}

export function getCurrentUser() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user;
  } catch (ex) {
    return null;
  }
}

export function headerWithUserAuthToken() {
  try {
    const user = JSON.parse(Cookies.get("user")); //

    return {
      headers: {
        Authorization: user.token_id,
      },
    };
  } catch (ex) {
    console.error('No Auth Token found.')
    return null;
  }
}
