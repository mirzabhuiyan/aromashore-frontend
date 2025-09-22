import Cookies from "js-cookie";
import {apiUrl} from "../config";
import http from "./httpService";
const apiEndPoint = apiUrl + "/web/customer/login";

export async function login({username, password}) {
  const {data} = await http.post(apiEndPoint, {username, password});
  if (data && data.appStatus && data.appData) {
    saveUserSession(data.appData);
  }
  return data;
}

export async function verifyOTP({username, code}) {
  const {data} = await http.post(apiUrl + "/web/customer/login/2fa-verify", {username, code});
  if (data && data.appStatus && data.appData) {
    saveUserSession(data.appData);
  }
  return data;
}

export function saveUserSession(user) {
  try {
    const normalized = {
      ...user,
      username: user.username || user.contact || user.name || "",
    };
    const payload = JSON.stringify(normalized);
    // Keep both keys for backward compatibility across the app
    Cookies.set("userInfo", payload, { path: "/", sameSite: "lax" });
    Cookies.set("user", payload, { path: "/", sameSite: "lax" });
  } catch (_) {}
}

export function clearUserSession() {
  Cookies.remove("userInfo", { path: "/" });
  Cookies.remove("user", { path: "/" });
}

export function logout() {
  clearUserSession();
}

export function getCurrentUser() {
  try {
    const fromUserInfo = Cookies.get("userInfo");
    if (fromUserInfo) return JSON.parse(fromUserInfo);
    const fromUser = Cookies.get("user");
    if (fromUser) return JSON.parse(fromUser);
    return null;
  } catch (ex) {
    return null;
  }
}

export function headerWithUserAuthToken() {
  try {
    const raw = Cookies.get("userInfo") || Cookies.get("user");
    if (!raw) return null;
    const user = JSON.parse(raw);
    return {
      headers: {
        Authorization: user.token_id,
      },
    };
  } catch (ex) {
    return null;
  }
}
