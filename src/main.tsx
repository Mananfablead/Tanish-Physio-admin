import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { CsrfProvider } from "./context/CsrfContext";
import App from "./App";
import "./index.css";

import { store } from "./store";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <CsrfProvider>
      <App />
    </CsrfProvider>
  </Provider>
);
