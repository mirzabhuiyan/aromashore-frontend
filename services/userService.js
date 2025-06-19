import http from "./httpService";
import {apiUrl} from "../config";

const apiRegisterEndPoint = apiUrl + "/web/customer/register";
const apiForgotPasswordEndPoint = apiUrl + "/web/customer/forgot-password";
const apiResetPasswordEndPoint = apiUrl + "/web/customer/reset-password";
const apiValidateUsernameEndPoint = apiUrl + "/web/customer/check/username/";
const apiVerifyOTPAndResetPasswordEndPoint = apiUrl + "/web/sms/verifyOTPAndResetPassword";

export function register(user) {
  return http.post(apiRegisterEndPoint, {
    ...user,
  });
}

export function validateUsername(username) {
  return http.get(`${apiValidateUsernameEndPoint}${username}`);
}

export function forgotPassword(forgotForm) {
  return http.post(apiForgotPasswordEndPoint, forgotForm);
}

export function resetPassword(resetForm) {
  console.log(resetForm)
  return http.post(apiResetPasswordEndPoint, resetForm);
}

export function verifyOTPAndResetPassword(resetForm) {
  return http.post(apiVerifyOTPAndResetPasswordEndPoint, resetForm);
}
