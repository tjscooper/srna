  
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
      statusPath: "",
      isRunning: false,
      intervalID: null,
      outfileExists: false,
      loaded: 0,
      status: "Nothing is Cooking"
    }
    this.monitorUntilJobFinished = this.monitorUntilJobFinished.bind(this)
   
  }
  
  fileExists = () =>{

    var http = new XMLHttpRequest();

    http.open('HEAD', this.state.fullPathOutfile, false);
    http.send();

    return http.status != 404;

}

  statusReport = () =>{

    axios.get(this.state.statusPath)
      .then(function (res2) {
        console.log("we are checking the status")
        console.log(res2);
        console.log(res2.data.progress);
        console.log(res2.data.state);
        return res2
        //this.setState({loaded: res2.data.progress, status: res2.data.state})
      })
      .catch(function (error) {
        console.log(error);
      })

}

  stopInterval = () => {
    
    this.setState({intervalID: null})
  }

  async monitorUntilJobFinished () {
    console.log("monitoring " + this.state.outfile)
    //var xmlHttp = new XMLHttpRequest();
    axios.get('https://booshboosh.net:3080/hello')
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      })  
    //var xmlHttp = new XMLHttpRequest();

    
    try {
      var intervalID3 = setInterval(async () => {
        const res2 = this.statusReport()
        this.setState({loaded: res2.data.progress, status: res2.data.state})
        if (res2.data.progress == 100) {
          clearInterval(intervalID3)
        }
      }, 5000);
    } catch(e) {
      console.log(e);
    }

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
    axios.post("https://booshboosh.net:3080/execute", data, {})
    .then(res => {
      console.log("post execute")
      console.log(res);
      this.setState({outfile: res.data, isRunning:true, fullPathOutfile:'https://booshboosh.net:3080/download/' + res.data, statusPath:'https://booshboosh.net:3080/status/' + res.data})
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
      <div className="form-group files" >
      { ( !this.state.isRunning && this.props.fileNames.length != 0) ? (
      <button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler} >Run</button>) : ( 
      <button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler} disabled>Run</button>) }
      </div>
      <div className="form-group files" >
      <ToastContainer />
      <Progress max="100" color="success" value={this.state.loaded} >{Math.round(this.state.loaded, 2) }%</Progress>
      <label>{this.state.status}</label>
      </div>

     

      <div className="form-group files" >
      { ( this.state.outfileExists ) ? (
      <a href={this.state.fullPathOutfile}><button type="button" class="btn btn-success btn-block" >Download</button></a>) : ( 
      <button type="button" class="btn btn-success btn-block"  disabled>Download</button>) }
      </div></div>
    );
  }
}

export default ExecutePipeline; 