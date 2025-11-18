import { createContext, useContext, useState } from "react";

const GlobalAlertContext = createContext<any>(null);

export const GlobalAlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const trigger = (msg: string) => {
    setMessage(msg);
    setOpen(true);
  };

  const close = () => setOpen(false);

  return (
    <GlobalAlertContext.Provider value={{ open, message, trigger, close }}>
      {children}
    </GlobalAlertContext.Provider>
  );
};

export const useGlobalAlertContext = () => useContext(GlobalAlertContext);
