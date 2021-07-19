import React, { Component } from 'react';
import { render } from 'react-dom';
import "./../App.css";

import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter,
  NavLink,
  Switch
} from 'react-router-dom'


class Divide extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      tlHover: false,
      trHover: false,
      blHover: false,
      brHover: false,
    }
  }

  division(quadrant) {
    switch (quadrant) {
      case 0:
        this.setState({
          tlHover: true,
          trHover: false,
          blHover: false,
          brHover: false,})
        break; 
      case 1:
        this.setState({
          tlHover: false,
          trHover: true,
          blHover: false,
          brHover: false,})
        break; 
      case 2:
        this.setState({
          tlHover: false,
          trHover: false,
          blHover: true,
          brHover: false,})
        break; 
      case 3:
        this.setState({
          tlHover: false,
          trHover: false,
          blHover: false,
          brHover: true,})
        break; 
    }
  }

  shouldRecurse(hover, quadrant) {
    if (hover && this.props.i < this.props.limit && !(this.getPath(quadrant) in this.props.stops)) {
      return true
    }
    else {
      return false
    }
  }

  getNextI() {
    return (this.props.i + 1)
  }

  getPath(quadrant) {
    return (this.props.path + quadrant)
  }

  render() {
  	let html0 = null;
    let html1 = null;
    let html2 = null;
    let html3 = null;
    if (this.getPath(0) in this.props.html) {
      html0 = this.props.html[this.getPath(0)];
    } 
    if (this.getPath(1) in this.props.html) {
      html1 = this.props.html[this.getPath(1)];
    }
    if (this.getPath(2) in this.props.html) {
      html2 = this.props.html[this.getPath(2)];
    }
    if (this.getPath(3) in this.props.html) {
      html3 = this.props.html[this.getPath(3)];
    }

    return (
      <div className="divideContainer">
      	<div className="horizontalDiv">
      	  <div className="division" 
            style={{"backgroundColor": this.props.backgroundColors[this.getPath(0)], 
            "color":this.props.colors[this.getPath(0)], }} 
            onMouseOver={()=>this.division(0)}>
            { ( this.shouldRecurse(this.state.tlHover, 0) ) ? 
              ( <Divide limit={this.props.limit} i={this.getNextI()} path={this.getPath(0)}
                  stops={this.props.stops} backgroundColors={this.props.backgroundColors} 
                  colors={this.props.colors} html={this.props.html} /> ) : (html0) }
            
          </div>
      	  <div className="division" 
            style={{"backgroundColor": this.props.backgroundColors[this.getPath(1)], 
            "color":this.props.colors[this.getPath(1)], }}  
            onMouseOver={()=>this.division(1)}>
            { ( this.shouldRecurse(this.state.trHover, 1) ) ? 
              ( <Divide limit={this.props.limit} i={this.getNextI()} path={this.getPath(1)} 
                  stops={this.props.stops} backgroundColors={this.props.backgroundColors} 
                  colors={this.props.colors} html={this.props.html} /> ) : (html1) }
          </div>
      	</div>
      	<div className="horizontalDiv">
      	  <div className="division" 
            style={{"backgroundColor": this.props.backgroundColors[this.getPath(2)], 
            "color":this.props.colors[this.getPath(2)], }}  
            onMouseOver={()=>this.division(2)}>
            { ( this.shouldRecurse(this.state.blHover, 2) ) ? 
              ( <Divide limit={this.props.limit} i={this.getNextI()} path={this.getPath(2)}
                  stops={this.props.stops} backgroundColors={this.props.backgroundColors} 
                  colors={this.props.colors} html={this.props.html} /> ) : (html2) }
          </div>
      	  <div className="division" 
            style={{"backgroundColor": this.props.backgroundColors[this.getPath(3)], 
            "color":this.props.colors[this.getPath(3)],}}  
            onMouseOver={()=>this.division(3)}>
            { ( this.shouldRecurse(this.state.brHover, 3) ) ? 
              ( <Divide limit={this.props.limit} i={this.getNextI()} path={this.getPath(3)}
                  stops={this.props.stops} backgroundColors={this.props.backgroundColors} 
                  colors={this.props.colors} html={this.props.html} /> ) : (html3) }
          </div>
      	</div>
      </div>
    );
  }
}


export default Divide