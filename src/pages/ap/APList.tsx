import { useState } from "react";
import { List, TextField, FunctionField } from "react-admin";

import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { StyledListDatagrid } from "@/components/StyledListDatagrid";
import { CurrencyField } from "@/components/money/CurrencyField";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";

import VisibilityIcon from "@mui/icons-material/Visibility";
import { IconButton } from "@mui/material";

import { APAgingDetailDrawer } from "./APAgingDetailDrawer";

export const APList = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  const handleOpen = (record: any) => {
    setSelectedSupplier(record);
    setOpenDrawer(true);
  };

  return (
    <>
      <List
        resource="ap"
        title="應付帳款總表"
        actions={false}
        perPage={10}
        pagination={<CustomPaginationBar showPerPage={true} />}
      >
        <StyledListWrapper
          quickFilters={[
            { type: "text", source: "supplierName", label: "供應商名稱" }
          ]}
          exportConfig={{
            filename: "應付帳款總表",
            columns: [
              { header: "供應商", key: "supplierName" },
              { header: "0-30天", key: "aging0to30" },
              { header: "31-60天", key: "aging31to60" },
              { header: "60天以上", key: "aging60plus" },
              { header: "應付總額", key: "totalAmount" },
              { header: "已付款", key: "paidAmount" },
              { header: "未付款", key: "balance" }
            ],
          }}
        >
          <StyledListDatagrid>
            <TextField source="supplierName" label="供應商" />

            <CurrencyField source="aging0to30" label="0–30天" />
            <CurrencyField source="aging31to60" label="31–60天" />
            <CurrencyField source="aging60plus" label="60天以上" />

            <CurrencyField source="totalAmount" label="應付總額" />
            <CurrencyField source="paidAmount" label="已付款" />
            <CurrencyField source="balance" label="未付款" />

            <FunctionField
              label="明細"
              render={(record) => (
                <IconButton size="small" onClick={() => handleOpen(record)}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              )}
            />
          </StyledListDatagrid>
        </StyledListWrapper>
      </List>

      <APAgingDetailDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        supplier={selectedSupplier}
      />
    </>
  );
};