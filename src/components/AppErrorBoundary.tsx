import * as React from "react";
import { Box, Typography, Button } from "@mui/material";
import { logError } from "@/utils/logger";

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 捕捉 <App> 子樹的錯誤，避免整頁白屏並顯示錯誤訊息，方便除錯。
 * 見 https://react.dev/link/error-boundaries
 */
export class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logError("AppErrorBoundary caught:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      // 會話過期／被動登出情境：交由 authProvider / dataProvider 的 redirect 處理，不顯示錯誤頁
      if (this.state.error.message === "SESSION_EXPIRED") {
        return null;
      }
      return (
        <Box
          sx={{
            padding: 3,
            maxWidth: 600,
            margin: "2rem auto",
            textAlign: "left",
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            頁面發生錯誤
          </Typography>
          <Typography variant="body2" component="pre" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {this.state.error.message}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            重新載入頁面
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
