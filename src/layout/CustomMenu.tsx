import * as React from "react";
import {
  Menu,
  MenuItemLink,
  useSidebarState,
} from "react-admin";
import { menuGroups } from "./menuConfig";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Collapse, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";

export const CustomMenu = () => {
  const [open] = useSidebarState();
  const [openGroups, setOpenGroups] = React.useState<{ [key: string]: boolean }>({});

  const toggleGroup = (key: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

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
        const groupKey = group.label;

        return (
          <React.Fragment key={groupKey}>
            {/* 父類 */}
            <ListItemButton onClick={() => toggleGroup(groupKey)}>
              <ListItemIcon>{group.icon}</ListItemIcon>
              <ListItemText primary={group.label} />
              {openGroups[groupKey] ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            {/* 子類選項 */}
            <Collapse in={openGroups[groupKey]} timeout="auto" unmountOnExit>
              {group.items.map((item) => (
                <MenuItemLink
                  key={item.to}
                  to={item.to}
                  primaryText={item.label}
                  leftIcon={item.icon ?? <span />}
                  sx={{ paddingLeft: open ? 5 : 3 }}
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
