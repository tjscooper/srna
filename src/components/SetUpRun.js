  
import React, { Component ,useState } from 'react';
import axios from 'axios';
import {Progress} from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import ExecutePipeline from './../components/ExecutePipeline'
import List from 'react-list-select'
import CatInputs from "./CatInputs"
class SetUpRun extends Component { 
  
  constructor(props) {
    super(props);
      this.state = {
        selectedFile: null,
        loaded:0,
        primed:false,
        uploadedFiles: [],
        preUploadedFiles: [],
        selectedUpload: [],
        hi:"",
        isGoing: [],
        numberOfGuests: 2,
        uLists: {}, 
        cats: [],
        owner: "",
        description: ""
      };

   
  }
  
  storeAndReset(res) {
    console.log("store and reset")
    console.log(res)
    this.setState({primed:false})

  }

  checkMimeType=(event)=>{
    //getting file object
    let files = event.target.files 
    //define message container
    let err = []
    // list allow mime type
    const types = ['fq', 'fastq', "gz", 'fq.gz', 'fastq.gz']
    // loop access array
    const beforeFiles = this.state.preUploadedFiles
    const addedFiles = []
    for(var x = 0; x<files.length; x++) {
     // compare file type find doesn't matach
         console.log("CHECKING MIME TYPE")
         console.log(files[x].type);
         console.log(files[x].name);
         console.log(files[x].name.split('.'))
         console.log(files[x].name.split('.').pop())
         console.log(types.indexOf(files[x].name.split('.')[-1]))
         let file_listified = files[x].name.split('.')

         // checking if gzipped
         if (file_listified.pop() != "gz") {
         // create error message and assign to container   
          err[x] = files[x].name +'\'s file type is not supported\n';
          this.setState({preUploadedFiles: beforeFiles})
        }

        else {
          console.log(file_listified)
          // checking if fastq or fq
          if (file_listified.pop() != "fastq" && file_listified.pop() != "fq") {
           // create error message and assign to container   
            err[x] = files[x].name +'\'s file type is not supported\n';
            this.setState({preUploadedFiles: beforeFiles})
          }
          else {
            // passed all checks
            console.log(file_listified)
            

            // check if file is uploaded
            addedFiles.push(files[x].name)


            console.log(this.state.preUploadedFiles)
            console.log("END MIME TYPE")
                      
          }
        }
     };
    this.setState({preUploadedFiles: addedFiles})
     for(var z = 0; z<err.length; z++) {// if message not same old that mean has error 
         // discard selected file
        toast.error(err[z])
        event.target.value = null
    }
   return true;
  }
  maxSelectFile=(event)=>{
    let files = event.target.files
        if (files.length > 50) { 
           const msg = 'Only 20 fastqs can be uploaded at a time'
           event.target.value = null
           toast.warn(msg)
           return false;
      }
    return true;
  }
  checkFileSize=(event)=>{
    let files = event.target.files
    let size = 20000000000
    let err = []; 
    for(var x = 0; x<files.length; x++) {
    if (files[x].size > size) {
      err[x] = files[x].type+'is too large, please pick a smaller file\n';
     }
    };
    for(var z = 0; z<err.length; z++) {// if message not same old that mean has error 
      // discard selected file
     toast.error(err[z])
     event.target.value = null
    }
    return true;
  }

  onChangeHandler=event=>{
    var files = event.target.files
    if(this.maxSelectFile(event) && this.checkMimeType(event) && this.checkFileSize(event)){ 
    // if return true allow to setState
       this.setState({
       selectedFile: files,
       loaded:0,
       primed:true,
    })} else {
 
       this.setState({
       selectedFile: null,
       loaded:0,
       primed:false,
      })}
    console.log(this.state)
  }
  onClickHandler = () => {
    const data = new FormData() 
    for(var x = 0; x<this.state.selectedFile.length; x++) {
      data.append('file', this.state.selectedFile[x])
    }
    //axios.post("http://35.162.241.80:3080/upload", data, {
    axios.post("https://booshboosh.net:3080/upload", data, {
      onUploadProgress: ProgressEvent => {
        if (ProgressEvent.loaded / ProgressEvent.total*100 == 100) {
          const uFiles = []
          for(var z = 0; z < this.state.preUploadedFiles.length; z++) {
            uFiles.push(this.state.preUploadedFiles[z])
            this.setState((prevState) => ({
              cats: [...prevState.cats, {name:this.state.preUploadedFiles[z], isChecked:true}],
            }));
          }
          this.setState({uploadedFiles: uFiles})
        }
        this.setState({
          loaded: (ProgressEvent.loaded / ProgressEvent.total*100),
        })
      },
    })
      .then(res => { // then print response status
        toast.success('upload success');
        console.log(res)
        //this.storeAndReset(res);
      })
      .catch(err => { // then print response status
        toast.error('upload fail')
      })

    console.log(this.state)
    console.log(this.state.selectedFile)
    console.log(this.state.selectedFile[0])
  }

handleCatChange = (e) => {
  console.log(e)
  console.log(e.target)
  console.log(e.target.value)
  console.log(e.target.checked)
    if (["name", "age"].includes(e.target.className) ) {
      let cats = [...this.state.cats]
      cats[e.target.dataset.id].isChecked = e.target.checked
      this.setState({ cats }, () => console.log(this.state.cats))
    } else {
      this.setState({ [e.target.name]: e.target.value.toUpperCase() })
    }
  }
addCat = (e) => {

    this.setState((prevState) => ({
      cats: [...prevState.cats, {name:"", age:""}],
    }));
  }


  render() {
    let {owner, description, cats} = this.state
    return (
      <div class="container">
        <div class="row">
          <div class="offset-md-3 col-md-6">
               <div class="form-group files">
                <label>Upload Your File </label>
                <input type="file" class="form-control" multiple onChange={this.onChangeHandler}/>
              </div>  
              <div class="form-group">
                <ToastContainer />
                <Progress max="100" color="success" value={this.state.loaded} >{Math.round(this.state.loaded,2) }%</Progress>
        
              </div> 
              
              <div className="form-group files" >
              { ( this.state.primed ) ? (
              <button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler} >Upload</button>) : ( 
              <button type="button" class="btn btn-success btn-block" onClick={this.onClickHandler} disabled>Upload</button>) }
              </div>
              <ExecutePipeline fileNames={cats} />
              
             
              


             <form onSubmit={this.handleSubmit} onChange={this.handleCatChange} >
              {cats.map((val, idx)=> {
                let catId = `cat-${idx}`, ageId = `age-${idx}`
                let name = cats[idx].name
                return (
                  <div key={idx}>
                    <label htmlFor={catId}>{name}</label>
                    <input
                      type="text"
                      name={catId}
                      data-id={idx}
                      id={catId}            
                      type="checkbox"
                      value={cats[idx].name} 
                      className="name"
                      defaultChecked={cats[idx].isChecked}
                    />
                  </div>
            )
          })
        }
             </form>

        </div>
      </div>
      </div>
    );
  }
}

              //<List items={this.state.uploadedFiles} selected={[0]} disabled={[]} multiple={true} onChange={(selected: number) => console.log(selected)} />
                      //onChange={this.fileWasChecked(idx)}
export default SetUpRun; 