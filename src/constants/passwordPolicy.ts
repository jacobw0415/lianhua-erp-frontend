/**
 * 與後端密碼政策對齊：至少 8 碼，且需包含大寫、小寫字母與數字。
 */
export const PASSWORD_MIN_LENGTH = 8;

/** 密碼強度 regex：至少一大寫、一小寫、一數字 */
export const PASSWORD_STRENGTH_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/u;

export const PASSWORD_POLICY_HELPER =
  "密碼至少 8 碼，且需包含大寫、小寫字母與數字。";
