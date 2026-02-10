import { Sidebar, type SidebarProps } from "react-admin";
import { styled } from "@mui/material/styles";

const drawerWidth = 240;
const closedWidth = 64;

/**
 * 包一層 Sidebar，在關閉前先移除 Drawer 內的焦點，
 * 避免 React Admin / MUI 在加上 aria-hidden 時，
 * descendant 還保留 focus 而觸發無障礙警告。
 */
const RawSidebar = (props: SidebarProps) => {
  const { onClose, ModalProps, ...rest } = props;

  const handleClose: NonNullable<SidebarProps["onClose"]> = (event, reason) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if (onClose) {
      onClose(event, reason);
    }
  };

  return (
    <Sidebar
      {...rest}
      onClose={handleClose}
      ModalProps={{
        ...(ModalProps || {}),
        keepMounted: true,
      }}
    />
  );
};

export const CustomSidebar = styled(RawSidebar)(() => ({
  "& .RaSidebar-fixed": {
    width: drawerWidth,
    transition: "width 0.2s ease",
    overflowX: "hidden",
  },

  "&.RaSidebar-closed .RaSidebar-fixed": {
    width: closedWidth,
  },
}));
