
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

import MediaQuery from 'react-responsive';

import logo_header from './assets/pki_logo_header_mostly_white.png'
import ham from './assets/ham50.png'
import cross from './assets/cross50.png'



class App extends Component {


  constructor(props) {
    super(props);
      this.state = {
        tab:"/",
        hamburger: false
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

  hamburgerToggle () {
    this.setState({hamburger: !this.state.hamburger})
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
        <MediaQuery minDeviceWidth={1224}>
          <Navbar fluid collapseOnSelect>
            <Navbar.Header  >
              <Navbar.Brand>

                <a target="_blank" rel="noopener noreferrer"  href="https://perkinelmer-appliedgenomics.com/">
                  <div className="App logo"/>
                </a>
                <div style={{width: "100px"}} />
                <Link to="/" className={(this.state.tab == "/" ? "App h1-b-selected" : "App h1-b")} onClick={() => this.setState({tab:"/"}) }>NEXTFLEX<sup>®</sup> sRNA Tool</Link>
                <div style={{width: "100px"}} />
                <Link to="/technical" className={(this.state.tab == "/technical" ? "App h2-b-selected" : "App h2-b")} onClick={() => this.setState({tab:"/technical"}) }>Technical</Link>
              </Navbar.Brand>
            </Navbar.Header>
          </Navbar>
        </MediaQuery>

        <MediaQuery maxDeviceWidth={1224}>
          <Navbar fluid collapseOnSelect>
            <Navbar.Header  >
              <Navbar.Brand>

                <div className="App navbar-overwrite">
                <a target="_blank" rel="noopener noreferrer"  href="https://perkinelmer-appliedgenomics.com/">
                <div className="App logo"/>
                </a>
                <div style={{"width":"25%"}}/>
                { ( !this.state.hamburger ) ? (<div className="hamburgerDropContainer" ><div style={{"width": "50px"}}/> </div>) : ( 
                  <div className="hamburgerDropContainer">
                    <Link style={{"textDecoration": "none"}} to="/" onClick={() => this.setState({tab:"/", hamburger:!this.state.hamburger })}>
                      <div className={(this.state.tab == "/" ? "App hamLink-selected" : "App hamLink")} >
                        Home
                      </div>
                    </Link>
                    <Link style={{"textDecoration": "none"}} to="/technical" onClick={() => this.setState({tab:"/technical", hamburger:!this.state.hamburger }) }>
                      <div className={(this.state.tab == "/technical" ? "App hamLink-selected" : "App hamLink")} >
                        Technical
                      </div>
                    </Link>
                  </div> ) }
                <div onClick={()=>this.hamburgerToggle() }>
                    { ( this.state.hamburger ) ? ( <img src={cross} style={{"height":"100%", "vertical-align":"bottom", "display":"inline-block"}}/> ) : ( <img src={ham} style={{"height":"100%", "vertical-align":"bottom", "display":"inline-block"}}/> ) }
                  </div>
                </div>
              </Navbar.Brand>
            </Navbar.Header>
          </Navbar>
        </MediaQuery>
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