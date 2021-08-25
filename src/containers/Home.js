import React, { Component } from 'react';
import axios from 'axios';
import firebase from "firebase"
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth"
import "./Home.css";
import "./../App.css";
import { Users } from './../components/Users'
import { DisplayBoard } from './../components/DisplayBoard'

import CreateUser from './../components/CreateUser'
import SetUpRun from './../components/SetUpRun'
import SignupButton from './../components/SignupButton'
import LoginButton from './../components/LoginButton'
import { getAllUsers, createUser } from './../services/UserService'

class Home extends Component { 

  constructor(props) {
    super(props);
      this.state = {};
  }  

  logBackend() {
  	this.props.auth.currentUser.getIdToken().then(idToken => {
  	  console.log(idToken)
  	  let data = {token: idToken}
  	  axios.post("https://booshboosh.net:443/auth", data, {}).then(res => {
	    console.log("post execute")
	    console.log(res)
	  }, (error) => {
	    console.log("post error")
	    console.log(error);
	  })
	}).catch(function (error) {
	  console.log("could not generate token")
	})
  	

  }

  render() {
    return (
	  <div className="Home">
	    <div className="container mrgnbtm">
	      <div className="row">
	        <div className="col-md-8">
	          <input type='text'/>
	          Homepage
	        </div>
	        <div className="App short-spacer" />
            <button className="App primarybutton-active" onClick={() => this.logBackend()}>LOGIN ON BACKEND</button>
            <div className="App short-spacer" />
	      </div>
	    </div>
	  </div>
	);
  }
}


export default Home; 
