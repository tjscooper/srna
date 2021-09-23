import React from "react";
import "./../App.css";

export default class DynamicTable extends React.Component {
    constructor(props){
      super(props);
        if(this.props.data !== null){
          this.state = {
            columns: [],
            columnsToHide: ["_id"],
            results:this.props.data
          }
        }
        else{

        
          this.state={
            columns: [],
            columnsToHide: ["_id"],
            results: [
              {
                _id: 1,
                firstname: "Robert",
                lastname: "Redfort",
                city: "New York",
                zip: 1233,
                street: "Mahn Street",
                street_number: "24A",
                favoriteKebab: "cow"
              },
              {
                _id: 2,
                firstname: "Patty",
                lastname: "Koulou",
                city: "Los Angeles",
                zip: 5654,
                street: "Av 5th Central",
                street_number: 12
              },
              {
                _id: 3,
                firstname: "Matt",
                lastname: "Michiolo",
                city: "Chicago",
                zip: 43452,
                street: "Saint Usk St",
                street_number: 65,
                phoneNumber: "0321454545"
              },
              {
                _id: 4,
                firstname: "Sonia",
                lastname: "Remontada",
                city: "Buenos Aires",
                zip: "43N95D",
                street: "Viva la Revolution Paso",
                street_number: 5446,
                country: "Argentina"
              },
              {
                _id: 5,
                firstname: "Garfield",
                lastname: "Mendoza",
                city: "Hong Kong",
                street: "Coctatiel Bouvalard",
                street_number: 2243,
                favorite_taco_bell: "oltorf",
              }
            ]
          };
        } 
      }
  componentDidMount() {
    this.mappDynamicColumns();
  }

  mappDynamicColumns = () => {
    let columns = [];
    this.state.results.forEach((result) => {
      Object.keys(result).forEach((col) => {
        if (!columns.includes(col)) {
          columns.push(col);
        }
      });
      this.setState({ columns });
    });
  };

  addTableRow = (result) => {
    let row = [];
    this.state.columns.forEach((col) => {
      if (!this.state.columnsToHide.includes(col)) {
        row.push(
          Object.keys(result).map((item) => {
            if (result[item] && item === col) {
              return result[item];
            } else if (item === col) {
              return "No Value";
            }
          })
        );
        row = this.filterDeepUndefinedValues(row);
      }
    });

    return row.map((item, index) => {
      // console.log(item, "item ?");
      return (
        <td
          key={`${item}--${index}`}
          className="App td"
        >
          {item}
        </td>
      );
    });
  };

  mapTableColumns = () => {
    return this.state.columns.map((col) => {
      if (!this.state.columnsToHide.includes(col)) {
        const overridedColumnName = this.overrideColumnName(col);
        return (
          <th
            key={col}
            scope="col"
            className="App th"
          >
            {overridedColumnName}
          </th>
        );
      }
    });
  };

  filterDeepUndefinedValues = (arr) => {
    return arr
      .map((val) =>
        val.map((deepVal) => deepVal).filter((deeperVal) => deeperVal)
      )
      .map((val) => {
        if (val.length < 1) {
          val = ["-"];
          return val;
        }
        return val;
      });
  };

  // if you want to change the text of the col you could do here in the .map() with another function that handle the display text

  overrideColumnName = (colName) => {
    switch (colName) {
      case "barcodeType":
        return "Barcode Type";
      case "barcodeNumber":
        return "Barcode Number";
      case "owner":
        return "Owner";
      case "barcodeSeq1":
        return "i7 Sequence"
      case "barcodeSeq2":
        return "i5 Sequence"
      case "ready":
        return "Ready";
      default:
        return colName;
    }
  };

  createTable = (results) => {
    return (
      <table class="App table tab2">
        <thead>
          <tr className="App tr-h">{this.mapTableColumns()}</tr>
        </thead>
        <tbody>
          {results.map((result, index) => {
            return <tr key={result._id}>{this.addTableRow(result)}</tr>;
          })}
        </tbody>
      </table>
    );
  };

  render() {
    return (
      <div class="flex flex-col">
        <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              {this.state.results.length ? (
                <div className="card">
                  {this.createTable(this.state.results)}
                </div>
              ) : null}
              <div className="App short-spacer" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
