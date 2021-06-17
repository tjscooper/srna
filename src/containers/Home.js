import React, { Component } from 'react';
import "./Home.css";
import "./../App.css";
import { Users } from './../components/Users'
import { DisplayBoard } from './../components/DisplayBoard'

import CreateUser from './../components/CreateUser'
import SetUpRun from './../components/SetUpRun'
import SignupButton from './../components/SignupButton'
import LoginButton from './../components/LoginButton'
import { getAllUsers, createUser } from './../services/UserService'

export default function Home() {
  
   	return (
	    <div className="Home">
	      	<div className="container mrgnbtm">
	          <div className="row">
	            <div className="col-md-8">
                <input type='text'/>
	              <SetUpRun/>
	            </div>
	          </div>
	        </div>
	    </div>
    );
}
