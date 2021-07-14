
import React, { Component ,useState } from 'react';
import { useHistory, Link } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import { Nav, Navbar, NavItem } from "react-bootstrap";
import "./App.css";
import Routes from "./Routes";
import { BrowserRouter as Router } from "react-router-dom";
import { Route, Switch, Redirect } from "react-router-dom";

import Home from "./containers/Home";
import SetUpRun from "./components/SetUpRun";
import NotFound from "./containers/NotFound";
import Login from "./containers/Login";
import Technical from "./containers/Technical";
import References from "./containers/References";
import axios from 'axios';
import {Progress} from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import ExecutePipeline from './components/ExecutePipeline'
import List from 'react-list-select'
import CatInputs from "./components/CatInputs"

import logo_header from './assets/pki_logo_header_mostly_white.png'



class App extends Component {


  constructor(props) {
    super(props);
      this.state = {
        tab:"/"
      };
    window.onbeforeunload = (event) => {
      const e = event || window.event;
      // Cancel the event
      e.preventDefault();
      if (e) {
        e.returnValue = ''; // Legacy method for cross browser support
      }
      return ''; // Legacy method for cross browser support
    };
  }

  componentDidUpdate(){ 
  window.onpopstate = (e) => {
      console.log("BUTTON PRESSED ON BROWSER")
      console.log(e)
      console.log(e.target.location.pathname)
      this.setState({tab:e.target.location.pathname})
    }
  }

  componentDidMount(){    
  window.onpopstate = (e) => {
      console.log("BUTTON PRESSED ON BROWSER")
      console.log(e)
      console.log(e.target.location.pathname)
      this.setState({tab:e.target.location.pathname})
    }
  }


  render() {
    
    return (

      <div className="App major-container">
        <Router>
        <Navbar fluid collapseOnSelect>
          <Navbar.Header  >
            <Navbar.Brand>

              <div style={{width: "20px"}} />
              <a target="_blank" rel="noopener noreferrer"  href="https://perkinelmer-appliedgenomics.com/">
                <div className="App logo"/>
              </a>
              <div style={{width: "100px"}} />
              <Link to="/" className={(this.state.tab == "/" ? "App h1-b-selected" : "App h1-b")} onClick={() => this.setState({tab:"/"}) }>NEXTFLEX<sup>®</sup> sRNA Tool</Link>
              <div style={{width: "100px"}} />
              <Link to="/technical" className={(this.state.tab == "/technical" ? "App h2-b-selected" : "App h2-b")} onClick={() => this.setState({tab:"/technical"}) }>Technical</Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
        </Navbar>
        <footer className="App footer">
          <p className="App p-foot">For research use only. Not for use in diagnostic procedures.</p>
          <br/>
          <div className="App footer2">
            <p className="App footnote-white">© Copyright | PerkinElmer Inc. All rights reserved.</p>
          </div>
        </footer>
      
        <div className="App spacer"/>


      <Switch>
      <div>
        <span className="App Home" style={{display: this.state.tab == "/" ? "block" : "none" }}>
            <SetUpRun />
        </span>
      <div className="App Technical" style={{display: this.state.tab == "/technical" ? "block" : "none" }}>
          <Technical />
      </div>
      </div>
      </Switch>
        </Router>

      </div>
    );
  }
}
export default App; 