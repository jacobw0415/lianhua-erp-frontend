import {
  required,
  minLength,
  maxLength,
  regex,
  email as emailValidator,
} from "react-admin";

export const usernameValidators = [
  required("請輸入帳號"),
  minLength(4, "帳號長度至少需 4 碼"),
  maxLength(20, "帳號長度不可超過 20 碼"),
  regex(/^[A-Za-z0-9._-]+$/, "僅可使用英數字與 . - _"),
];

export const createPasswordValidators = [
  required("請輸入登入密碼"),
  minLength(8, "密碼長度至少需 8 碼"),
  regex(/^(?=.*[A-Za-z])(?=.*\d).+$/u, "密碼需同時包含英文字母與數字"),
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
    value && value.length < 8 ? "密碼長度至少需 8 碼" : undefined,
  (value?: string) =>
    value && !/^(?=.*[A-Za-z])(?=.*\d).+$/u.test(value)
      ? "密碼需同時包含英文字母與數字"
      : undefined,
];

export const emailValidators = [emailValidator("請輸入有效的 Email 格式")];

