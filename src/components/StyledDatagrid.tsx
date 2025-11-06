import { Datagrid, type DatagridProps } from "react-admin";
import { styled } from "@mui/material/styles";

const StyledDatagridRoot = styled(Datagrid)(({ theme }) => ({
    margin: "17px 17px",
    borderRadius: 12,
    overflow: "visible",

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

    "& .RaDatagrid-cell:first-of-type, & .RaDatagrid-headerCell:first-of-type": {
        width: "64px !important",
        minWidth: "64px !important",
        overflow: "visible !important",
        paddingLeft: "8px",
    },

    //  讓「備註」欄位有更多寬度（避免被縮排）
    "& .RaDatagrid-cell:last-of-type, & .RaDatagrid-headerCell:last-of-type": {
        whiteSpace: "normal",    
        overflow: "visible",     
        textOverflow: "unset",   
        lineHeight: 1.4,
        wordBreak: "break-word",
        minWidth: "160px",
    },

    //  數字靠左對齊
    "& .RaNumberField-root, & .MuiTableCell-root.MuiTableCell-alignRight": {
        textAlign: "left",
    },
}));

export const StyledDatagrid = (props: DatagridProps) => (
    <StyledDatagridRoot
        rowClick="edit"
        bulkActionButtons={false}
        size="small"
        {...props}
    />
);
