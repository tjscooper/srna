  
import React, { Component } from 'react';
import axios from 'axios';
import {Progress} from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
  
class ExecutePipeline extends Component { 
  
  constructor(props) {
    super(props);
      this.state = {
        files: this.props.files,
        selected: this.props.selected,
      }
   
  }
  
  onClickHandler = () => {
    const data = "" 
    axios.post("http://localhost:3080/execute", data, {})
    .then(res => {
      console.log(res);
    })
  }

  render() {
    return (
      <button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler}>Run</button>

    );
  }
}

export default ExecutePipeline; 