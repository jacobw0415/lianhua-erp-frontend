/**
 * 個人資料頁快取：避免主題切換時閃爍；刪除當前帳號後需清除，避免個人資料頁顯示舊資料。
 */
export type ProfileCacheRecord = {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  jobTitle?: string;
  position?: string;
  roles?: string[];
  lastLoginAt?: string;
  createdAt?: string;
};

let profileCache: ProfileCacheRecord | null = null;

export function getProfileCache(): ProfileCacheRecord | null {
  return profileCache;
}

export function setProfileCache(value: ProfileCacheRecord | null): void {
  profileCache = value;
}

/** 清除個人資料快取（例如當前帳號被刪除後，避免個人資料頁顯示舊資料或閃爍） */
export function clearProfileCache(): void {
  profileCache = null;
}
