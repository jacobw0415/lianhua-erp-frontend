import React from "react";

// ---------------------
// Type Definitions (RBAC: requiredRole 用於動態隱藏選單)
// ---------------------
export type MenuRole = "ROLE_SUPER_ADMIN" | "ROLE_ADMIN" | "ROLE_USER";

export interface MenuItem {
  /** i18n key，例如 menu.items.suppliers */
  labelKey: string;
  to: string;
  icon?: React.ReactElement;
  requiredRole?: MenuRole;
  requiredAuthorities?: string[];
}

export interface MenuGroup {
  /** 穩定 id，供側欄展開狀態用 */
  id: string;
  labelKey: string;
  icon: React.ReactElement;
  items: MenuItem[];
}

// ---------------------
// Icons
// ---------------------
import StorefrontIcon from "@mui/icons-material/Storefront";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import GroupIcon from "@mui/icons-material/Group";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";

import CategoryIcon from "@mui/icons-material/Category";
import InventoryIcon from "@mui/icons-material/Inventory";

import SegmentIcon from "@mui/icons-material/Segment";
import LabelImportantIcon from "@mui/icons-material/LabelImportant";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import BadgeIcon from "@mui/icons-material/Badge";

import AssessmentIcon from "@mui/icons-material/Assessment";
import TimelineIcon from "@mui/icons-material/Timeline";
import InsightsIcon from "@mui/icons-material/Insights";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TableViewIcon from "@mui/icons-material/TableView";

import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import SecurityIcon from "@mui/icons-material/Security";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PasswordIcon from "@mui/icons-material/Password";
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import ShoppingCartCheckoutTwoToneIcon from "@mui/icons-material/ShoppingCartCheckoutTwoTone";
import StoreMallDirectoryTwoToneIcon from "@mui/icons-material/StoreMallDirectoryTwoTone";
import NotificationIcon from "@mui/icons-material/Notifications";
import FactCheckIcon from "@mui/icons-material/FactCheck";

// ---------------------
// Menu Groups
// ---------------------
export const menuGroups: MenuGroup[] = [
  {
    id: "dashboard",
    labelKey: "menu.groups.dashboard",
    icon: <SpaceDashboardIcon />,
    items: [
      { labelKey: "menu.items.dashboardOverview", to: "/", icon: <DashboardCustomizeIcon /> },
    ],
  },

  {
    id: "procurement",
    labelKey: "menu.groups.procurement",
    icon: <ShoppingCartCheckoutTwoToneIcon />,
    items: [
      { labelKey: "menu.items.suppliers", to: "/suppliers", icon: <StorefrontIcon /> },
      { labelKey: "menu.items.purchases", to: "/purchases", icon: <Inventory2Icon /> },
      { labelKey: "menu.items.payments", to: "/payments", icon: <PaymentIcon /> },
      { labelKey: "menu.items.ap", to: "/ap", icon: <ReceiptLongIcon /> },
    ],
  },

  {
    id: "sales",
    labelKey: "menu.groups.sales",
    icon: <PointOfSaleIcon />,
    items: [
      { labelKey: "menu.items.sales", to: "/sales", icon: <StoreMallDirectoryTwoToneIcon /> },
      { labelKey: "menu.items.orderCustomers", to: "/order_customers", icon: <GroupIcon /> },
      { labelKey: "menu.items.orders", to: "/orders", icon: <ShoppingBagIcon /> },
      { labelKey: "menu.items.receipts", to: "/receipts", icon: <AttachMoneyIcon /> },
      { labelKey: "menu.items.ar", to: "/ar", icon: <RequestQuoteIcon /> },
    ],
  },

  {
    id: "products",
    labelKey: "menu.groups.products",
    icon: <InventoryIcon />,
    items: [
      { labelKey: "menu.items.productCategories", to: "/product_categories", icon: <CategoryIcon /> },
      { labelKey: "menu.items.products", to: "/products", icon: <InventoryIcon /> },
    ],
  },

  {
    id: "expenses",
    labelKey: "menu.groups.expenses",
    icon: <SegmentIcon />,
    items: [
      { labelKey: "menu.items.expenseCategories", to: "/expense_categories", icon: <LabelImportantIcon /> },
      { labelKey: "menu.items.expenses", to: "/expenses", icon: <MoneyOffIcon /> },
      { labelKey: "menu.items.employees", to: "/employees", icon: <BadgeIcon /> },
    ],
  },

  {
    id: "reports",
    labelKey: "menu.groups.reports",
    icon: <AssessmentIcon />,
    items: [
      { labelKey: "menu.items.reportCashflow", to: "/reports/cashflow", icon: <TimelineIcon /> },
      { labelKey: "menu.items.reportProfitloss", to: "/reports/profitloss", icon: <TrendingUpIcon /> },
      { labelKey: "menu.items.reportBalancesheet", to: "/reports/balancesheet", icon: <TableViewIcon /> },
      { labelKey: "menu.items.reportArSummary", to: "/reports/ar_summary", icon: <InsightsIcon /> },
      { labelKey: "menu.items.reportApSummary", to: "/reports/ap_summary", icon: <AssessmentIcon /> },
    ],
  },

  {
    id: "system",
    labelKey: "menu.groups.system",
    icon: <SecurityIcon />,
    items: [
      { labelKey: "menu.items.users", to: "/users", icon: <ManageAccountsIcon />, requiredRole: "ROLE_ADMIN", requiredAuthorities: ["user:view"] },
      { labelKey: "menu.items.roles", to: "/roles", icon: <SecurityIcon />, requiredRole: "ROLE_ADMIN", requiredAuthorities: ["role:view"] },
      { labelKey: "menu.items.auditLogs", to: "/admin/activity-audit-logs", icon: <FactCheckIcon />, requiredRole: "ROLE_SUPER_ADMIN" },
      { labelKey: "menu.items.profile", to: "/profile", icon: <AccountCircleIcon /> },
      { labelKey: "menu.items.changePassword", to: "/change-password", icon: <PasswordIcon /> },
      { labelKey: "menu.items.notifications", to: "/notifications", icon: <NotificationIcon />, requiredRole: "ROLE_ADMIN" },
    ],
  },
];
