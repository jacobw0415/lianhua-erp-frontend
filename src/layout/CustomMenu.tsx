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
              bgcolor: isOpen ? "rgba(0,0,0,0.08)" : "transparent",
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>{group.icon}</ListItemIcon>
            {open && <ListItemText primary={group.label} />}
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

            <Collapse in={isOpen} timeout="auto" unmountOnExit>
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
