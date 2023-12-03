import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

import '@fontsource/inter';

import App from "./App";

const defaultWidth = 7;
const defaultHeight = 6;
const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App startingWidth={defaultWidth} startingHeight={defaultHeight}/>
  </StrictMode>
);