//for add you need: barcode type, barcode numbers, name prefix  
//barcode type choices: 'sRNA', '6-nt', '8-nt', '12-nt', 'qRNA', 'di', 'udi', 'budi', 'sRNAudi', 'custom'
import React, { Component ,useState } from 'react';
import axios from 'axios';
import { Dropdown } from 'semantic-ui-react';
import "./../App.css";


const typeOptions = [
                          { key: "sRNA", value: "sRNA", text: "Nextflex sRNA"} , 
                          { key: "6-nt", value: "6-nt", text: "Nextflex 6-NT"} , 
                          { key: "8-nt", value: "8-nt", text: "Nextflex 8-NT"} , 
                          { key: "12-nt", value: "12-nt", text: "Nextflex 12-NT"} , 
                          { key: "qRNA", value: "qRNA", text: "Nextflex qRNA"} , 
                          { key: "di", value: "di", text: "Nextflex Dual Index"} , 
                          { key: "udi", value: "udi", text: "Nextflex Unique Dual Index (UDI)"} , 
                          { key: "budi", value: "budi", text: "Nextflext 1536 Unique Dual Index (UDI)"} , 
                          { key: "sRNAudi", value: "sRNAudi", text: "Nextflex sRNA Unique Dual Index (UDI)"} , 
                          { key: "custom", value: "custom", text: "Custom Indices"} , 
                         ]

const numIndicesMap = {
  '12-nt': 384,
  'sRNA':96,
  '6-nt':48, 
  '8-nt':96,
  'qRNA':96,
  'di':192,
  'udi':384,
  'budi':1536,
  'sRNAudi':384,
  'custom':999999999999999
}


class Dibs extends Component {



  
  constructor(props) {
    super(props);
      this.state = {
        type:'',
        number:0,
        name:'',
        min:1,
        max:999999999999999,
        fullView:[]
    }
    this.getFullView().then(res => this.setState({fullView:res}))
      console.log(this.state.fullView)

  };




  getFullView () {
      return axios.post('https://dibsbase.net:443/fullview','hey', {})
        .then(response => {console.log(response.data)})
        .catch(function (error) {
          console.log(error);
        })  
      

  }

  onAddButtonPush = () => {
    console.log("I've been clicked")
    const data = [this.state.type, this.state.number, this.state.name]
    console.log(data)

    axios.post("https://dibsbase.net:443/add", data, {})
    .then(res => {
      console.log("post execute")
      console.log(res)

    }, (error) => {
      console.log("post error")
      console.log(error);
  })
  }

  onDeleteButtonPush = () => {
    console.log("I've been clicked")
    const data = [this.state.type, this.state.number, this.state.name]
    console.log(data)

    axios.post("https://dibsbase.net:443/delete", data, {})
    .then(res => {
      console.log("post execute")
      console.log(res)

    }, (error) => {
      console.log("post error")
      console.log(error);
  })
  }


  handleTypeChange = (e, result) => {
  const { name, value } = result;
  this.setState({
     type: value,
     max: numIndicesMap[value] 
    });
  };

  handleNumberChange(evt) {
    this.setState({
      number: evt.target.value
    })
    console.log(this.state.number)
  }

  handleNameChange(evt) {
    this.setState({
      name: evt.target.value
    })
    console.log(this.state.name)
  }







  render() {
    return (
      <div class="container">
        <div class="row">
          <div class="offset-md-3 col-md-6">
          <p className = "App h1">Hello, welcome to DIBS</p>
          <div className="App short-spacer" />
          <label className="App h2">Barcode Type</label>
          <div className="App short-spacer" />
          <Dropdown className="App searchable-dropdown"
            placeholder='Select reference'
            fluid
            search
            selection
            options={typeOptions}
            value={this.state.type}
            onChange={this.handleTypeChange}
          />
          <div className="App short-spacer" />
          {(this.state.max === 999999999999999) ?
            (<label className="App h2">Barcode Number</label>) :
            (<label className="App h2">Barcode Number ({this.state.min} - {this.state.max})</label>)}
          
          <div className="App short-spacer" />
          <input type="number" min={this.state.min} max={this.state.max} name="number" className="custom-email-input" placeholder="Enter number" value={this.state.number} onChange={evt => this.handleNumberChange(evt)}/>
          
          <div className="App short-spacer" />
          <label className="App h2">Name Prefix</label>
          <div className="App short-spacer" />
          <input type="text" name="name" className="custom-email-input" placeholder="Enter name" value={this.state.name} onChange={evt => this.handleNameChange(evt)}/>
          <div className="App short-spacer" />
          { (this.state.min != 0 && this.state.type != '' && this.state.name != '') ? 
          (<button className="App primarybutton-active" onClick={() => this.onAddButtonPush()}>ADD</button>) :
          (<button type="button" className="App primarybutton-inactive" onClick={this.onDeleteButtonPush} disabled>ADD</button>) }
          { (this.state.min != 0 && this.state.type != '' && this.state.name != '') ? 
          (<button className="App primarybutton-active" onClick={() => this.onDeleteButtonPush()}>DELETE</button>) :
          (<button type="button" className="App primarybutton-inactive" onClick={this.onDeleteButtonPush} disabled>DELETE</button>) }
          </div>
        </div>
      </div>
    );
  }
}

              //<List items={this.state.uploadedFiles} selected={[0]} disabled={[]} multiple={true} onChange={(selected: number) => console.log(selected)} />
                      //onChange={this.fileWasChecked(idx)}
export default Dibs; 