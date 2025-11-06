import { Datagrid, type DatagridProps } from "react-admin";
import { styled } from "@mui/material/styles";

const StyledDatagridRoot = styled(Datagrid)(({ theme }) => ({
    "& .RaDatagrid-table": {
        tableLayout: "fixed",
        width: "100%",
        borderCollapse: "collapse",
    },

    "& .RaDatagrid-headerCell": {
        fontWeight: 600,
        fontSize: "0.95rem",
        textAlign: "left",
        backgroundColor:
            theme.palette.mode === "dark"
                ? theme.palette.grey[900]
                : theme.palette.grey[100],
        color: theme.palette.text.primary,
        whiteSpace: "nowrap",
        padding: "10px 16px",
        borderBottom: `1px solid ${
            theme.palette.mode === "dark"
                ? theme.palette.grey[800]
                : theme.palette.grey[300]
        }`,
    },

    "& .RaDatagrid-row": {
        "&:nth-of-type(odd)": {
            backgroundColor:
                theme.palette.mode === "dark"
                    ? theme.palette.action.selectedOpacity
                    : theme.palette.action.hover,
        },
        "&:hover": {
            backgroundColor:
                theme.palette.mode === "dark"
                    ? theme.palette.action.selected
                    : theme.palette.action.focus,
        },
    },

    "& .RaDatagrid-cell": {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        padding: "8px 16px",
        fontSize: "0.9rem",
        borderBottom: `1px solid ${
            theme.palette.mode === "dark"
                ? theme.palette.grey[800]
                : theme.palette.grey[200]
        }`,
        color: theme.palette.text.primary,
        verticalAlign: "middle",
    },

    // ✅ 數字對齊控制：讓所有金額、數量、ID 改為置中或靠左
    "& .RaNumberField-root, & .MuiTableCell-root.MuiTableCell-alignRight": {
        textAlign: "left", // 可改為 'left' 依需求
    },

    // 若你想讓金額或數字靠左，可改成：
    // "& .RaNumberField-root, & .MuiTableCell-root.MuiTableCell-alignRight": {
    //     textAlign: "left",
    // },
}));

export const StyledDatagrid = (props: DatagridProps) => (
    <StyledDatagridRoot
        rowClick="edit"
        bulkActionButtons={false}
        size="small"
        {...props}
    />
);
