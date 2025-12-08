import * as React from "react";
import {
  Menu,
  MenuItemLink,
  useSidebarState,
} from "react-admin";

import {
  Collapse,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Box,
} from "@mui/material";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

import { menuGroups } from "./menuConfig";

export const CustomMenu = () => {
  const [open] = useSidebarState();
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // ⭐ 自動展開當前路徑所在的模組
  const currentPath = window.location.pathname;

  React.useEffect(() => {
    menuGroups.forEach((group) => {
      const match = group.items.some((item) => currentPath.startsWith(item.to));
      if (match) {
        setOpenGroups((prev) => ({ ...prev, [group.label]: true }));
      }
    });
  }, [currentPath]);

  return (
    <Menu
      sx={{
        "& .RaMenuItemLink-root": {
          borderRadius: 2,
          marginY: 0.3,
          paddingY: 0.7,
          paddingLeft: open ? 2 : 1,
        },
      }}
    >
      {menuGroups.map((group) => {
        const isOpen = openGroups[group.label];

        const groupButton = (
          <ListItemButton
            onClick={() => toggleGroup(group.label)}
            sx={{
              borderRadius: 1,
              pl: open ? 2 : 1,
              mb: 0.2,
              height: 42,
              bgcolor: isOpen ? "rgba(0,0,0,0.06)" : "transparent",
              transition: "padding 0.2s ease, background-color 0.2s ease",

              // ⭐ icon + text 動畫
              "& .MuiListItemText-root": {
                opacity: open ? 1 : 0,
                transform: open ? "translateX(0)" : "translateX(-10px)",
                transition: "opacity 0.2s ease, transform 0.2s ease",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 36,
                justifyContent: "center", // icon 不跳動
                transition: "color 0.2s ease",
              }}
            >
              {group.icon}
            </ListItemIcon>

            {open && (
              <ListItemText
                primary={group.label}
                sx={{
                  whiteSpace: "nowrap",
                }}
              />
            )}

            {open && (isOpen ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        );

        return (
          <React.Fragment key={group.label}>
            {/* Sidebar 收起時 → 使用 tooltip */}
            {open ? (
              groupButton
            ) : (
              <Tooltip title={group.label} placement="right">
                {groupButton}
              </Tooltip>
            )}

            {/* 子選單 Collapse */}
            <Collapse in={isOpen} timeout={200} unmountOnExit>
              {group.items.map((item) => (
                <MenuItemLink
                  key={item.to}
                  to={item.to}
                  primaryText={item.label}
                  leftIcon={
                    item.icon ? item.icon : <Box sx={{ width: 24, height: 24 }} />
                  }
                  sx={{
                    pl: open ? 6 : 4,
                    py: 0.6,
                    height: 36,

                    // ⭐ 子項目淡入滑動動畫
                    "& .RaMenuItemLink-primaryText": {
                      opacity: open ? 1 : 0,
                      transform: open ? "translateX(0)" : "translateX(-8px)",
                      transition: "opacity 0.2s ease, transform 0.2s ease",
                    },
                  }}
                />
              ))}
            </Collapse>
          </React.Fragment>
        );
      })}
    </Menu>
  );
};

export default CustomMenu;