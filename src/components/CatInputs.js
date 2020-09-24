// src/components/CatInputs.js
import React from "react"
const CatInputs = (props) => {
  return (
    props.cats.map((val, idx)=> {
      console.log(val)
      console.log(idx)
      console.log(props.cats[idx].name)
      let catId = `cat-${idx}`, ageId = `age-${idx}`
      let name = props.cats[idx].name
      return (
        <div key={idx}>
          <label htmlFor={catId}>{name}</label>
          <input
            type="text"
            name={catId}
            data-id={idx}
            id={catId}            
            type="checkbox"
            value={props.cats[idx].name} 
            className="name"
            onChange={this.fileWasChecked}
          />
        </div>
      )
    })
  )
}
export default CatInputs