import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

const setSafeAreaInsets = () => {
  const root = document.documentElement;
  const safeAreaInsetTop = getComputedStyle(root).getPropertyValue('env(safe-area-inset-top)');
  root.style.setProperty('--safe-area-inset-top', safeAreaInsetTop);
};

const Main = () => {
  useEffect(() => {
    setSafeAreaInsets();
    window.addEventListener('resize', setSafeAreaInsets);
    return () => window.removeEventListener('resize', setSafeAreaInsets);
  }, []);

  return (
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<Main />);