import http from "./httpService";
import {apiUrl} from "../config";
import { headerWithUserAuthToken } from "./authService";
const apiEndPoint = apiUrl + "/web/customer/getall/category";

export function fetchCustomerTypes() {
  return http.get(apiEndPoint);
}

export function getprofileByCustomer(user) {
  console.log("user1 --------> ", user);
  return http.get(
    apiUrl + `/web/customer/getprofile/${user.uid}/${user.username}`,
    {
      headers: {
        Authorization: user.token_id,
      },
    }
  );
}

export function updateprofileByCustomer(data) {
  return http.post(apiUrl + `/web/customer/update/${data.uid}`, data, {
    headers: {
      Authorization: data.token_id,
    },
  });
}

export function updateprofilePicture(data, user) {
  return http.post(
    apiUrl + `/web/customer/upload-profile-image/${user.uid}`,
    data,
    {
      headers: {
        Authorization: user.token_id,
      },
    }
  );
}

export function changeProfilePassword(data, user) {
  return http.post(
    apiUrl + `/web/customer/update-password/${user.uid}`,
    data,
    {
      headers: {
        Authorization: user.token_id,
      },
    }
  );
}

export function getOrderHistoryByCustomerId(customerId) {
  return http.get(
    apiUrl + `/web/customer/order/getall/${customerId}`,
    headerWithUserAuthToken()
  );
}

export function getCartDetailsByCustomerId(customerId) {
  return http.get(
    apiUrl + `/web/customer/shopping-cart/getall/${customerId}`,
    headerWithUserAuthToken()
  );
}

export function placeOrder(payload) {
  console.log(payload)
  return http.post(
    apiUrl + `/web/customer/order/add`,
    payload,
    headerWithUserAuthToken()
  );
}

export function createShoppingCart(payload) {
  console.log(payload)
  return http.post(
    apiUrl + `/web/customer/shopping-cart/add`,
    payload,
    headerWithUserAuthToken()
  );
}

export function clearShoppingCart(customerId) {
  return http.get(
    apiUrl + `/web/customer/shopping-cart/delete/${customerId}`,
    headerWithUserAuthToken()
  );
}
