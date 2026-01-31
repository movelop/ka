import React from "react";
import ReactDom from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';

import App from './App';
import { ContextProvider } from "./context/ContextProvider";
import { AuthContextProvider } from './context/AuthContextProvider';
import './index.css';

const root = ReactDom.createRoot(document.getElementById('root'));

root.render(
  <ContextProvider>
    <AuthContextProvider>
      <Router>
        <App />
      </Router>
    </AuthContextProvider>
  </ContextProvider>
)