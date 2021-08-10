  
import React, { Component ,useState } from 'react';
import axios from 'axios';
import "./../App.css";


class Dibs extends Component { 
  
  constructor(props) {
    super(props);
      this.state = {
      };

}

onButtonHandler = () => {
  console.log("I've been clicked")
}
  render() {
    return (
      <div class="container">
        <div class="row">
          <div class="offset-md-3 col-md-6">
          <p className = "App h1">Hello, welcome to DIBS</p>
          <button className="App primarybutton-active" onClick={() => this.onButtonHandler()}>CLICK ME!!!</button>
          </div>
        </div>
      </div>
    );
  }
}

              //<List items={this.state.uploadedFiles} selected={[0]} disabled={[]} multiple={true} onChange={(selected: number) => console.log(selected)} />
                      //onChange={this.fileWasChecked(idx)}
export default Dibs; 