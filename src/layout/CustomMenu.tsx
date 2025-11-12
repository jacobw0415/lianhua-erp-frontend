import * as React from 'react';
import {
  Menu,
  MenuItemLink,
  useSidebarState,
  useTranslate,
} from 'react-admin';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StoreIcon from '@mui/icons-material/Store';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaidIcon from '@mui/icons-material/Paid';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import CategoryIcon from '@mui/icons-material/Category';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';

export const CustomMenu = () => {
  const [open] = useSidebarState();
  const translate = useTranslate();

  return (
    <Menu
      sx={{
        '& .RaMenuItemLink-root': {
          borderRadius: 2,
          marginY: 0.3,
          paddingY: 1,
          paddingLeft: open ? 1.5 : 1,
        },
      }}
    >
      {/* 儀表板 */}
      <MenuItemLink
        to="/"
        primaryText="Dashboard"
        leftIcon={<DashboardIcon />}
      />

      {/* 供應與採購 */}
      <MenuItemLink
        to="/suppliers"
        primaryText="供應商"
        leftIcon={<StoreIcon />}
      />
      <MenuItemLink
        to="/purchases"
        primaryText="進貨紀錄"
        leftIcon={<LocalShippingIcon />}
      />
      {/* 銷售與收款 */}
      <MenuItemLink
        to="/sales"
        primaryText="銷售紀錄"
        leftIcon={<MonetizationOnIcon />}
      />
      <MenuItemLink
        to="/receipts"
        primaryText="收款紀錄"
        leftIcon={<ReceiptIcon />}
      />

      {/* 支出與商品 */}
      <MenuItemLink
        to="/expenses"
        primaryText="支出紀錄"
        leftIcon={<MoneyOffIcon />}
      />
      <MenuItemLink
        to="/products"
        primaryText="商品管理"
        leftIcon={<CategoryIcon />}
      />

      {/* 報表分析 */}
      <MenuItemLink
        to="/reports/cashflow"
        primaryText="現金流量表"
        leftIcon={<AssessmentIcon />}
      />
      <MenuItemLink
        to="/reports/aging-ar"
        primaryText="應收帳齡表"
        leftIcon={<AssessmentIcon />}
      />
      <MenuItemLink
        to="/reports/aging-ap"
        primaryText="應付帳齡表"
        leftIcon={<AssessmentIcon />}
      />
      <MenuItemLink
        to="/reports/balancesheet"
        primaryText="資產負債表"
        leftIcon={<AssessmentIcon />}
      />
      <MenuItemLink
        to="/reports/profitloss"
        primaryText="損益表"
        leftIcon={<AssessmentIcon />}
      />

      {/* 系統管理 */}
      <MenuItemLink
        to="/employees"
        primaryText="員工管理"
        leftIcon={<PeopleIcon />}
      />
      <MenuItemLink
        to="/users"
        primaryText="帳號與權限"
        leftIcon={<SettingsIcon />}
      />
    </Menu>
  );
};

export default CustomMenu;
