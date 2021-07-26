import React, { Component } from 'react';
import axios from 'axios';
import {Progress} from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import download from 'js-file-download';
import { Dropdown } from 'semantic-ui-react';
import sigma from './../assets/total.svg'
import plant from './../assets/plant.svg'
import human from './../assets/human.svg'


const referenceOptions = [
                          { key: "total_miRNA_miRBase22", value: "total_miRNA_miRBase22", text: "Total species miRBase22", image: { avatar: true, src: sigma}}, 
                          { key: "total_plant_miRNA_PNRD", value: "total_plant_miRNA_PNRD", text: "Total plant species PNRD", image: { avatar: true, src: plant}}, 
                          { key: "human_miRNA_hairpin_miRBase22", value: "human_miRNA_hairpin_miRBase22", text: "Human miRBase22", image: { avatar: true, src: human}}, 
                          { key: "arabidopsis_thaliana_miRNA_PNRD", value: "arabidopsis_thaliana_miRNA_PNRD", text: "Arabidopsis thaliana PNRD", image: { avatar: true, src: plant}}, 
                          { key: "glycine_max_miRNA_PNRD", value: "glycine_max_miRNA_PNRD", text: "Glycine max PNRD", image: { avatar: true, src: plant}}, 
                          { key: "gossypium_hirsutum_miRNA_PNRD", value: "gossypium_hirsutum_miRNA_PNRD", text: "Gossypium hirsutum PNRD", image: { avatar: true, src: plant}}, 
                          { key: "hordeum_vulgare_miRNA_PNRD", value: "hordeum_vulgare_miRNA_PNRD", text: "Hordeum vulgare PNRD", image: { avatar: true, src: plant}}, 
                          { key: "medicago_truncatula_miRNA_PNRD", value: "medicago_truncatula_miRNA_PNRD", text: "Medicago truncatula PNRD", image: { avatar: true, src: plant}}, 
                          { key: "oryza_sativa_miRNA_PNRD", value: "oryza_sativa_miRNA_PNRD", text: "Oryza sativa PNRD", image: { avatar: true, src: plant}},
                         ]

class ExecutePipeline extends Component { 
  
  constructor(props) {
    super(props);
    this.state = {
      outfile: "",
      fullPathOutfile: "",
      fullPathOutfileOld: "",
      statusPath: "",
      isRunning: false,
      intervalID: null,
      outfileExists: false,
      loaded: 0,
      status: "No job queued",
      email: "",
      reference: "total_miRNA_hairpin_miRBase22"
    }
    this.monitorUntilJobFinished = this.monitorUntilJobFinished.bind(this)
   
  }
  
  fileExists = () =>{

    var http = new XMLHttpRequest();

    http.open('HEAD', this.state.fullPathOutfileOld, false);
    http.send();

    return http.status != 404;

}

  statusReport = () =>{
    
    return axios.get(this.state.statusPath)
      .then(function (res2) {
        console.log("we are checking the status")
        console.log(res2);
        console.log(res2.data.progress);
        console.log(res2.data.state);
        return res2.data
        
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
    axios.get('https://booshboosh.net:443/hello')
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      })  
    //var xmlHttp = new XMLHttpRequest();

    
    try {
      var intervalID3 = setInterval(async () => {
        this.statusReport().then((res2) => this.setState({loaded: res2.progress, status: res2.state}))
        console.log("**********************")
        //console.log(res2)
        //this.setState({loaded: res2.progress, status: res2.state})
        if (this.state.progress == '100.00') {
          clearInterval(intervalID3)
        }
      }, 1000);
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

  handleChange(evt) {
    this.setState({
      email: evt.target.value
    })
    console.log(this.state.email)
  }


  handleDropdownChange = (e, result) => {
    const { name, value } = result;
    this.setState({
       reference: value
      });
  };

  onClickHandler = () => {
    const data = []
    console.log("EXECUTE")
    console.log("email")
    console.log(this.state.email)
    console.log("reference")
    console.log(this.state.reference)

    if (this.state.email === ""){
      data.push("empty")
    }
    else{
      data.push(this.state.email)  
    }
    data.push(this.state.reference)
    console.log(this.props.fileNames)
    for (var x = 0; x < this.props.fileNames.length; x++) {
      console.log(this.props.fileNames[x])
      console.log(this.props.fileNames[x].isChecked)

      if (this.props.fileNames[x].isChecked) {
        data.push(this.props.fileNames[x].name)
      }
    }
    console.log(data)
    axios.post("https://booshboosh.net:443/execute", data, {})
    .then(res => {
      console.log("post execute")
      console.log(res);
      let report = res.data.split("-")[0] + "-out-report.html"
      this.setState({outfile: res.data, 
          isRunning:true, 
          dataPath:'https://booshboosh.net:443/boosh/pipelinedata/' + report, 
          fullPathOutfile:'https://booshboosh.net:443/dloading/' + res.data, 
          fullPathOutfileOld:'https://booshboosh.net:443/download/' + res.data, 
          statusPath:'https://booshboosh.net:443/status/' + res.data})
      console.log(this.state.outfile)
      this.monitorUntilJobFinished()


    }, (error) => {
      console.log(error);
      this.setState({isRunning: false})
  })
  }

  getColor = (quantity) => {
    if (quantity === 0) return 'idle';
    if (quantity < 100) return 'in-process';
    if (quantity == 100) return 'complete';
  }

  render() {
    return (
      <div>
        <div className={( this.props.fileNames.length != 0 ? "App appear" : "App disappear" )} >
          <div class="form-group files">
          <div className="App short-spacer" />
          <label className="App h2">Select reference</label>
          <div className="App short-spacer" />
          <Dropdown className="App searchable-dropdown"
            placeholder='Select reference'
            fluid
            search
            selection
            options={referenceOptions}
            value={this.state.reference}
            onChange={this.handleDropdownChange}
          />

          <div className="App short-spacer" />
          <label className="App h2">Enter email for reporting</label>
          <div className="App short-spacer" />
          <input type="text" name="email" className="custom-email-input" placeholder="Enter email" value={this.state.email} onChange={evt => this.handleChange(evt)}/>
          </div>

          <div className="App short-spacer" />
          { ( !this.state.isRunning && this.props.fileNames.length != 0) ? (
          <button type="button" className="App primarybutton-active" onClick={this.onClickHandler} >RUN</button>) : ( 
          <button type="button" className="App primarybutton-inactive" onClick={this.onClickHandler} disabled>RUN</button>) }
          </div>


          <div className="App short-spacer" />
          
        <div className="form-group files" >
          <ToastContainer />
          <Progress max="100" color={(this.getColor(this.state.loaded))} value={this.state.loaded} className={(this.state.isRunning || this.state.outfileExists ? "App progress-vis" : "App progress-invis")}>{Math.round(this.state.loaded, 2) }%</Progress>
          <label className={( this.state.isRunning ? "App label loading appear" : "App label disappear" )}>{this.state.status} </label>
        </div>

         

        <div className={( this.state.outfileExists ? "App appear" : "App disappear" )} >
          { ( this.state.outfileExists ) ? (
          <a target="_blank" rel="noopener noreferrer" href={this.state.fullPathOutfile}><button type="button" className="App primarybutton-active" >DOWNLOAD</button></a>) : ( 
          <button type="button" className="primarybutton-inactive"  disabled>DOWNLOAD</button>) }
        </div>
        <div className={( this.state.outfileExists ? "App appear" : "App disappear" )} >
          { ( this.state.outfileExists ) ? (
          <a target="_blank" rel="noopener noreferrer" href={this.state.dataPath}><button type="button" className="App primarybutton-active" >VIEW DATA</button></a>) : ( 
          <button type="button" className="primarybutton-inactive" disabled>VIEW DATA</button>) }
        </div>
          <div className="App short-spacer" />
          <div className="spacer" />
      </div>
    );
  }
}

export default ExecutePipeline; 