import React from "react";
import ReactDOM from "react-dom";
import App1 from "./App.js";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import * as serviceWorker from './serviceWorker';
import '@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css';

ReactDOM.render(
  <Router>
    <App1 />
  </Router>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
