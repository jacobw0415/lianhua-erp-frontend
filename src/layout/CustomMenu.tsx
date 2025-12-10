import * as React from "react";
import {
  Menu,
  MenuItemLink,
  useSidebarState,
} from "react-admin";

import {
  Collapse,
  Tooltip,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from "@mui/material";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useLocation } from "react-router-dom";

import { menuGroups } from "./menuConfig";

export const CustomMenu = () => {
  const [open] = useSidebarState();
  const location = useLocation();

  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(
    {}
  );

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  /** ⭐ 自動展開當前路徑 */
  React.useEffect(() => {
    menuGroups.forEach((group) => {
      const matched = group.items.some((item) =>
        location.pathname.startsWith(item.to)
      );
      if (matched) {
        setOpenGroups((prev) => ({ ...prev, [group.label]: true }));
      }
    });
  }, [location.pathname]);

  return (
    <Menu
      sx={{
        "& .RaMenuItemLink-root": {
          borderRadius: 1.2,
          marginY: 0.3,
          paddingY: 0.6,
          transition: "all 0.25s ease",
          width: "100%",
        },

        "& .RaMenuItemLink-active": {
          bgcolor: "action.selected",
          "& svg": {
            color: "primary.main !important",
          },
        },
      }}
    >
      {menuGroups.map((group) => {
        const isOpen = openGroups[group.label];

        /**  Group Header（加上柔順動畫） */
        const groupHeader = (
          <ListItemButton
            onClick={() => toggleGroup(group.label)}
            sx={{
              width: "100%",
              borderRadius: 1,
              pl: open ? 2 : 1,
              pr: open ? 1 : 1,
              py: 0.8,
              mt: 0.5,
              height: 40,
              bgcolor: isOpen ? "action.selected" : "transparent",

              transition:
                "padding 0.25s ease, background-color 0.25s ease, color 0.25s ease",

              "&:hover": {
                bgcolor: "action.hover",
              },

              /** ⭐ 文字淡入淡出 + 滑動動畫 */
              "& .MuiListItemText-root": {
                ml: 1,
                opacity: open ? 1 : 0,
                transform: open ? "translateX(0)" : "translateX(-8px)",
                transition: "opacity 0.25s ease, transform 0.25s ease",
              },
            }}
          >
            {/* ICON */}
            <ListItemIcon
              sx={{
                minWidth: 32,
                justifyContent: open ? "flex-start" : "center",
                transition: "all 0.25s ease",

                "& svg": {
                  color: isOpen
                    ? "primary.main"
                    : "text.secondary",
                  transition: "color 0.25s ease",
                },
              }}
            >
              {group.icon}
            </ListItemIcon>

            {open && (
              <ListItemText
                primary={group.label}
                primaryTypographyProps={{
                  fontSize: 15,
                  fontWeight: 500,
                }}
              />
            )}

            {open &&
              (isOpen ? (
                <ExpandLess fontSize="small" />
              ) : (
                <ExpandMore fontSize="small" />
              ))}
          </ListItemButton>
        );

        return (
          <React.Fragment key={group.label}>
            {open ? (
              groupHeader
            ) : (
              <Tooltip title={group.label} placement="right">
                {groupHeader}
              </Tooltip>
            )}

            {/*  子選單 Collapse （動畫已自帶） */}
            <Collapse in={isOpen} timeout={250} unmountOnExit>
              {group.items.map((item) => {

                return (
                  <MenuItemLink
                    key={item.to}
                    to={item.to}
                    primaryText={item.label}
                    leftIcon={item.icon}
                    sx={{
                      width: "100%",
                      pl: open ? 6 : 1.5,
                      pr: open ? 2 : 1.5,
                      py: 0.6,
                      minHeight: 38,
                      borderRadius: 1,

                      transition:
                        "padding 0.25s ease, background-color 0.25s ease",

                      //  收合時文字淡出 + 滑動
                      "& .RaMenuItemLink-primaryText": {
                        display: open ? "block" : "block", 
                        opacity: open ? 1 : 0,
                        transform: open ? "translateX(0)" : "translateX(-8px)",
                        transition: "opacity 0.25s ease, transform 0.25s ease",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        width: open ? "auto" : 0,
                      },

                      // ICON 位置
                      "& .MuiListItemIcon-root": {
                        minWidth: open ? 36 : 32,
                        justifyContent: open ? "flex-start" : "center",
                        transition: "all 0.25s ease",
                      },

                      "&.RaMenuItemLink-active": {
                        bgcolor: "action.selected",
                        "& svg": {
                          color: "primary.main !important",
                        },
                      },
                    }}
                  />
                );
              })}
            </Collapse>
          </React.Fragment>
        );
      })}
    </Menu>
  );
};

export default CustomMenu;