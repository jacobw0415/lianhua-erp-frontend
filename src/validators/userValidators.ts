import {
  required,
  minLength,
  maxLength,
  regex,
  email as emailValidator,
} from "react-admin";

import { PASSWORD_MIN_LENGTH, PASSWORD_STRENGTH_REGEX, PASSWORD_POLICY_HELPER } from "@/constants/passwordPolicy";

export const usernameValidators = [
  required("請輸入帳號"),
  minLength(4, "帳號長度至少需 4 碼"),
  maxLength(20, "帳號長度不可超過 20 碼"),
  regex(/^[A-Za-z0-9._-]+$/, "僅可使用英數字與 . - _"),
];

export const createPasswordValidators = [
  required("請輸入登入密碼"),
  minLength(PASSWORD_MIN_LENGTH, `密碼長度至少需 ${PASSWORD_MIN_LENGTH} 碼`),
  regex(PASSWORD_STRENGTH_REGEX, PASSWORD_POLICY_HELPER),
];

export const createConfirmPasswordValidator = (
  value?: string,
  allValues?: any
) => {
  if (!value || !allValues) return undefined;
  return value !== allValues.password ? "兩次輸入的密碼不一致" : undefined;
};

export const editNewPasswordValidators = [
  (value?: string) =>
    value && value.length < PASSWORD_MIN_LENGTH ? `密碼長度至少需 ${PASSWORD_MIN_LENGTH} 碼` : undefined,
  (value?: string) =>
    value && !PASSWORD_STRENGTH_REGEX.test(value) ? PASSWORD_POLICY_HELPER : undefined,
];

export { PASSWORD_POLICY_HELPER };

export const emailValidators = [emailValidator("請輸入有效的 Email 格式")];

