import React, { Component ,useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import firebase from "firebase"

import "./Login.css";
import "./../App.css";

import question_grey from './../assets/question_grey.svg'
import question_white from './../assets/question_white.svg'

class Login extends Component { 

  constructor(props) {
    super(props);
      this.state = {
        edit: false,
        email: "",
        name: "",
        pwd: "",
        currentPwd: "",
        currentEmail: "",
      };
  }



  onChangeHandler(evt) {
    var files = evt.target.files
    console.log(this.files)
  }

  handleEmailChange(evt) {
    this.setState({
      email: evt.target.value
    })
  }

  handleCurEmailChange(evt) {
    this.setState({
      currentEmail: evt.target.value
    })
  }

  handleNameChange(evt) {
    this.setState({
      name: evt.target.value
    })
  }

  handlePwdChange(evt) {
    this.setState({
      pwd: evt.target.value
    })
  }
  handleCurPwdChange(evt) {
    this.setState({
      currentPwd: evt.target.value
    })
  }

  authenticate() {  
    // TODO(you): prompt the user to re-provide their sign-in credentials
    var cred = firebase.auth.EmailAuthProvider.credential(
    this.state.currentEmail,
    this.state.currentPwd
    );
    this.props.auth.currentUser.reauthenticateWithCredential(cred).then(() => {
      // User re-authenticated.
      }).catch((error) => {
      console.log("re-authenticate errorrror")
      toast.error('Error in current email and password reauthentication.') 
      });

  }



  updateEmail() {
    this.authenticate()
    this.props.auth.currentUser.updateEmail(this.state.email).then(() => {
      toast.success('Email change successful. Updates will be displayed after refresh or brief navigation.');
    }).catch((error) => {
      toast.error('Email change failure') 
    });
  }

  updateName() {
    this.props.auth.currentUser.updateProfile({
      displayName: this.state.name,
    }).then(() => {
      toast.success('Name change successful. Updates will be displayed after refresh or brief navigation.');
    }).catch((error) => {
      toast.error('Name change failure') 
    });  
  }

  updatePwd() {
    this.authenticate()
    this.props.auth.currentUser.updatePassword(this.state.pwd).then(() => {
  }).then(() => {
      toast.success('Password change successful. Updates will be displayed after refresh or brief navigation.');
    }).catch((error) => {
      toast.error('Password change failure')
  });
  }

  save() {
    if (this.state.name !== "") {
      this.updateName()
    }
    if (this.state.email !== "") {
      this.updateEmail()
    }
    if (this.state.pwd !== "") {
      this.updateEmail()
    }
  }

  deleteAccount() {
    this.authenticate()
    this.props.auth.currentUser.delete().then(() => {
      toast.success('Account deleted');
    }).catch((error) => {
      toast.error('Account deletion failure')
    });
  }
  
  render() {
    return (
      <div class="container">
        <div class="row">
          <div class="offset-md-3 col-md-6">
            <ToastContainer />
            <span>
              <h1 className="App h1">Welcome {this.props.auth.currentUser.displayName}</h1>
              <img alt="profile picture" className="App avi-big" src={
                (this.props.auth.currentUser.photoURL !== null) ?
                (this.props.auth.currentUser.photoURL) :
                (question_grey)}/>

              <div className="App short-spacer" />
              <button className="App primarybutton-active" onClick={() => this.props.auth.signOut()}>SIGN OUT</button>
              <div className="App short-spacer" />
              <button className="App secondarybutton-active" onClick={() => this.setState({edit: !this.state.edit})}>EDIT USER</button>
              <div className="App spacer"/>
              { (this.state.edit) ? 
                ( <div className="App shadow">
                    <div style={{"text-align": "center"}}>
                      <div className="App short-spacer" />
                      <label className="App h2">Change name</label>
                      <div className="App short-spacer" />
                      <input type="text" name="name" className="App custom-email-input" placeholder="Enter name" value={this.state.name} onChange={evt => this.handleNameChange(evt)}/>
                      <div className="App short-spacer" />
                      <label className="App h2">Current email*</label>
                      <div className="App short-spacer" />
                      <input type="text" name="email" className="App custom-email-input" placeholder="Enter email" value={this.state.currentEmail} onChange={evt => this.handleCurEmailChange(evt)}/>
                      <div className="App short-spacer" />
                      <label className="App h2">New email</label>
                      <div className="App short-spacer" />
                      <input type="text" name="email" className="App custom-email-input" placeholder="Enter email" value={this.state.email} onChange={evt => this.handleEmailChange(evt)}/>
                      <div className="App short-spacer" />
                      <label className="App h2">Current password*</label>
                      <div className="App short-spacer" />
                      <input type="password" name="password" className="App custom-email-input" placeholder="Enter password" value={this.state.currentPwd} onChange={evt => this.handleCurPwdChange(evt)}/>
                      <div className="App short-spacer" />
                      <label className="App h2">New password</label>
                      <div className="App short-spacer" />
                      <input type="password" name="password" className="App custom-email-input" placeholder="Enter password" value={this.state.pwd} onChange={evt => this.handlePwdChange(evt)}/>
                      <div className="App short-spacer" />
                      <button className="App primarybutton-active" onClick={() => this.save()}>SAVE</button>
                      <div className="App short-spacer" />
                      <button className="App errorbutton-active" onClick={() => this.deleteAccount()}>DELETE ACCOUNT</button>
                      <div className="App short-spacer" />
      
                    </div>
                    
                  </div>) : 
                (<div/>)}
              <div className="App spacer"/>
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default Login; 