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

export const menuGroups = [
  {
    label: "儀表板",
    icon: <DashboardIcon />,
    items: [
      { label: "Dashboard", to: "/" },
    ],
  },
  {
    label: "供應與採購",
    icon: <LocalShippingIcon />,
    items: [
      { label: "供應商", to: "/suppliers", icon: <StoreIcon /> },
      { label: "進貨紀錄", to: "/purchases", icon: <LocalShippingIcon /> },
      { label: "付款紀錄", to: "/payments", icon: <PaidIcon /> },
    ],
  },
  {
    label: "銷售與收款",
    icon: <MonetizationOnIcon />,
    items: [
      { label: "銷售紀錄", to: "/sales", icon: <MonetizationOnIcon /> },
      { label: "收款紀錄", to: "/receipts", icon: <ReceiptIcon /> },
    ],
  },
  {
    label: "支出與商品",
    icon: <MoneyOffIcon />,
    items: [
      { label: "支出紀錄", to: "/expenses" },
      { label: "商品管理", to: "/products", icon: <CategoryIcon /> },
    ],
  },
  {
    label: "報表分析",
    icon: <AssessmentIcon />,
    items: [
      { label: "現金流量表", to: "/reports/cashflow" },
      { label: "應收帳齡表", to: "/reports/aging-ar" },
      { label: "應付帳齡表", to: "/reports/aging-ap" },
      { label: "資產負債表", to: "/reports/balancesheet" },
      { label: "損益表", to: "/reports/profitloss" },
    ],
  },
  {
    label: "系統管理",
    icon: <SettingsIcon />,
    items: [
      { label: "員工管理", to: "/employees", icon: <PeopleIcon /> },
      { label: "帳號與權限", to: "/users", icon: <SettingsIcon /> },
    ],
  },
];
