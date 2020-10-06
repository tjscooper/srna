  
import React, { Component } from 'react';
import axios from 'axios';
import {Progress} from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import download from 'js-file-download';

class ExecutePipeline extends Component { 
  
  constructor(props) {
    super(props);
      this.state = {
        outfile: "",
        fullPathOutfile: "",
        isRunning: false,
        intervalID: null,
        outfileExists: false,
      }
   
  }
  
  fileExists = () =>{

    var http = new XMLHttpRequest();

    http.open('HEAD', this.state.fullPathOutfile, false);
    http.send();

    return http.status != 404;

}

  stopInterval = () => {
    
    this.setState({intervalID: null})
  }

  async monitorUntilJobFinished () {
    console.log("monitoring " + this.state.outfile)
    //var xmlHttp = new XMLHttpRequest();
    axios.get('https://35.162.241.80:3080/hello')
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      })  

    axios.get(this.state.fullPathOutfile)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
      try {
            var intervalID2 = setInterval(async () => {
              const blocks = this.fileExists()
              console.log(blocks)
              if (blocks) {
                this.setState({outfileExists: true, isRunning:false})
                clearInterval(intervalID2)
              }
            }, 5000);
          } catch(e) {
            console.log(e);
          }
        }

  onClickHandler = () => {
    const data = []
    console.log("EXECUTE")



    console.log(this.props.fileNames)
    for (var x = 0; x < this.props.fileNames.length; x++) {
      console.log(this.props.fileNames[x])
      console.log(this.props.fileNames[x].isChecked)

      if (this.props.fileNames[x].isChecked) {
        data.push(this.props.fileNames[x].name)
      }
    }
    console.log(data)
    axios.post("https://35.162.241.80:3080/execute", data, {})
    .then(res => {
      console.log("post execute")
      console.log(res);
      this.setState({outfile: res.data, isRunning:true, fullPathOutfile:'https://35.162.241.80:3080/download/' + res.data})
      console.log(this.state.outfile)
      this.monitorUntilJobFinished()


    }, (error) => {
      console.log(error);
      this.setState({isRunning: false})
})
  }

  render() {
    return (
      <div>
      <div className="col-md-8" >
      { ( !this.state.isRunning && this.props.fileNames.length != 0) ? (
      <button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler} >Run</button>) : ( 
      <button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler} disabled>Run</button>) }
      </div>
      <div className="col-md-8" >
      { ( this.state.outfileExists ) ? (
      <a href={this.state.fullPathOutfile}><button type="button" class="btn btn-success btn-block" >Download</button></a>) : ( 
      <button type="button" class="btn btn-success btn-block"  disabled>Download</button>) }
      </div></div>
    );
  }
}

export default ExecutePipeline; 