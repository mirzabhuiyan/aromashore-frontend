import {apiUrl} from "../config";
import {headerWithUserAuthToken} from "./authService";
import httpService from "./httpService";

export function getCountriesList() {
  return httpService.get(
    apiUrl + `/public/country`,
  );
}
export function getStatesList() {
  return httpService.get(
    apiUrl + `/public/state`,
  );
}
export function getCitiesList() {
  return httpService.get(
    apiUrl + `/public/city`,
  );
}

export function getStatesByCountryId(countryId) {
  return httpService.get(
    apiUrl + `/public/state/${countryId}`,
  );
}

export function getCitiesByStateId(stateId) {
  return httpService.get(
    apiUrl + `/public/city/${stateId}`,
  );
}

export function updateCcProfile(customerId, payload) {
  return httpService.post(
    apiUrl + `/web/customer/update/ccprofile/${customerId}`,
    payload,
    headerWithUserAuthToken()
  );
}

export function createPaymentIntent(amount) {
  return httpService.post(
    apiUrl + `/web/customer/stripe/create-payment-intent`,
    { amount: amount },
    headerWithUserAuthToken()
  );
}

export function getAllShippingServices(payload) {
  return httpService.post(
    apiUrl + `/shipping/rates`,
    payload,
    headerWithUserAuthToken()
  );
}
