import React from "react";

// ---------------------
// Type Definitions
// ---------------------
export interface MenuItem {
  label: string;
  to: string;
  icon?: React.ReactElement;
}

export interface MenuGroup {
  label: string;
  icon: React.ReactElement; // ← 同樣改成 ReactElement
  items: MenuItem[];
}

// ---------------------
// Icons
// ---------------------
import StorefrontIcon from '@mui/icons-material/Storefront';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import GroupIcon from '@mui/icons-material/Group';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';

import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';

import SegmentIcon from '@mui/icons-material/Segment';
import LabelImportantIcon from '@mui/icons-material/LabelImportant';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import BadgeIcon from '@mui/icons-material/Badge';

import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';
import InsightsIcon from '@mui/icons-material/Insights';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TableViewIcon from '@mui/icons-material/TableView';

import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import SecurityIcon from '@mui/icons-material/Security';
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import ShoppingCartCheckoutTwoToneIcon from '@mui/icons-material/ShoppingCartCheckoutTwoTone';
import StoreMallDirectoryTwoToneIcon from '@mui/icons-material/StoreMallDirectoryTwoTone';

// ---------------------
// Menu Groups
// ---------------------
export const menuGroups: MenuGroup[] = [
  {
    label: "儀表板",
    icon: <SpaceDashboardIcon />,
    items: [
      { label: "Dashboard", to: "/", icon: <DashboardCustomizeIcon /> },
    ],
  },

  {
    label: "採購管理",
    icon: <ShoppingCartCheckoutTwoToneIcon />,
    items: [
      { label: "供應商管理", to: "/suppliers", icon: <StorefrontIcon /> },
      { label: "進貨紀錄", to: "/purchases", icon: <Inventory2Icon /> },
      { label: "付款紀錄", to: "/payments", icon: <PaymentIcon /> },
      { label: "應付帳款", to: "/ap-aging", icon: <ReceiptLongIcon /> },
    ],
  },

  {
    label: "銷售管理",
    icon: <PointOfSaleIcon />,
    items: [
      { label: "現場銷售紀錄", to: "/sales", icon: <StoreMallDirectoryTwoToneIcon /> },
      { label: "客戶管理", to: "/order-customers", icon: <GroupIcon /> },
      { label: "訂單管理", to: "/orders", icon: <ShoppingBagIcon /> },
      { label: "收款紀錄", to: "/receipts", icon: <AttachMoneyIcon /> },
      { label: "應收帳款", to: "/ar-aging", icon: <RequestQuoteIcon /> },
    ],
  },

  {
    label: "商品管理",
    icon: <InventoryIcon />,
    items: [
      { label: "商品分類", to: "/product-categories", icon: <CategoryIcon /> },
      { label: "商品資料", to: "/products", icon: <InventoryIcon /> },
    ],
  },

  {
    label: "費用管理",
    icon: <SegmentIcon />,
    items: [
      { label: "費用分類", to: "/expense-categories", icon: <LabelImportantIcon /> },
      { label: "支出紀錄", to: "/expenses", icon: <MoneyOffIcon /> },
      { label: "員工管理", to: "/employees", icon: <BadgeIcon /> },
    ],
  },

  {
    label: "財務報表",
    icon: <AssessmentIcon />,
    items: [
      { label: "現金流量表", to: "/reports/cashflow", icon: <TimelineIcon /> },
      { label: "應收帳款總表", to: "/reports/summary-ar", icon: <InsightsIcon /> },
      { label: "應付帳款總表", to: "/reports/summary-ap", icon: <AssessmentIcon /> },
      { label: "損益表", to: "/reports/profitloss", icon: <TrendingUpIcon /> },
      { label: "資產負債表", to: "/reports/balancesheet", icon: <TableViewIcon /> },
    ],
  },

  {
    label: "系統管理",
    icon: <SecurityIcon />,
    items: [
      { label: "使用者管理", to: "/users", icon: <ManageAccountsIcon /> },
      { label: "角色與權限", to: "/roles", icon: <SecurityIcon /> },
    ],
  },
];
