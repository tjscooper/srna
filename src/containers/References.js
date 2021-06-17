import React, { useState } from "react";
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./../App.css";

export default function References() {

  return (
    <div className="App References">
      this is where reference information will go!
      
          <div className="App container">
          <h2 className="App h2">Header 2</h2>
          <div className="h2">Header 2</div>
          <h3 className="App h3">Header 3</h3>
          <div className="h3">Header 3</div>
          <h4 className="App h4">Header 4</h4>
          <div className="h4">Header 4</div>
          <h5 className="App h5">Header 5</h5>
          <div className="h5">Header 5</div>
          <p className="App p">Paragraph</p>
          <div className="p">Paragraph</div>
          <p className="App link">Link</p>
          <p className="App label">Label</p>
          <p className="App footnote">Footnote</p>
        </div>
    </div>
  );
}