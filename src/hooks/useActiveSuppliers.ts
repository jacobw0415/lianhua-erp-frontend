import { useEffect, useState } from "react";
import { useDataProvider } from "react-admin";

export interface Supplier {
  id: number;
  name: string;
  active: boolean;
  contact?: string;
  phone?: string;
  billingCycle?: string;
  note?: string;
}

interface ActiveSupplierResponse {
  data: Supplier[];
}

export const useActiveSuppliers = () => {
  const dataProvider = useDataProvider();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataProvider
      .get("suppliers/active")
      .then((res: ActiveSupplierResponse) => {
        setSuppliers(res.data ?? []);
      })
      .catch((error: unknown) => {
        console.error("❌ 載入啟用供應商失敗：", error);
        setSuppliers([]); // fallback
      })
      .finally(() => setLoading(false));
  }, [dataProvider]);

  return { suppliers, loading };
};
