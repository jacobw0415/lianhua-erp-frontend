import { useEffect, useState } from "react";
import { useDataProvider } from "react-admin";

/* =========================================================
 * 型別定義
 * ========================================================= */

export interface Employee {
  id: number;
  name: string; // 用於下拉選單顯示，對應 fullName
  phone?: string;
  position?: string;
  salary?: number; // 薪資
  active: boolean; // 用於相容性，對應 status === "ACTIVE"
}

interface ActiveEmployeeResponse {
  data: Array<{
    id: number;
    fullName: string;
    position?: string;
    salary?: number;
    hireDate?: string;
    status: "ACTIVE" | "INACTIVE";
    createdAt?: string;
    updatedAt?: string;
  }> | null;
}

/* =========================================================
 * Hook
 * ========================================================= */

export const useActiveEmployees = () => {
  const dataProvider = useDataProvider();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataProvider
      .get("employees/active")
      .then((res: ActiveEmployeeResponse) => {
        // dataProvider.get() 會返回 { data: ... } 格式
        // API 實際響應格式是 { status, message, data, timestamp }
        // 但 dataProvider 已經提取了 data 欄位
        
        // 處理可能的響應格式
        let responseData = res.data;
        
        // 如果 res.data 是 null 或 undefined，表示沒有資料
        if (responseData === null || responseData === undefined) {
          setEmployees([]);
          return;
        }

        // 確保 responseData 是陣列
        if (!Array.isArray(responseData)) {
          console.warn("⚠️ 員工 API 響應格式異常：", responseData);
          setEmployees([]);
          return;
        }

        // 映射 fullName 到 name 以保持一致性
        const mappedEmployees = responseData.map((emp) => ({
          id: emp.id,
          name: emp.fullName ?? "",
          position: emp.position,
          salary: emp.salary,
          active: emp.status === "ACTIVE",
        }));
        setEmployees(mappedEmployees);
      })
      .catch((error: unknown) => {
        console.error("❌ 載入啟用員工失敗：", error);
        setEmployees([]); // fallback
      })
      .finally(() => setLoading(false));
  }, [dataProvider]);

  return { employees, loading };
};

