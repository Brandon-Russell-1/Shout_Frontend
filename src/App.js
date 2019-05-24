import React, { Component } from 'react';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import 'react-confirm-alert/src/react-confirm-alert.css'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { cars: [], open: false, message: ''};
  }

  componentDidMount() {

    fetch('/findall')
        .then((response) => response.json())
        .then((responseData) => {
          this.setState({
            cars: responseData,
          });
        })
        .catch(err => console.error(err));
  }


  renderEditable = (cellInfo) => {
    return (
        <div
            style={{ backgroundColor: "#fafafa" }}
            contentEditable
            suppressContentEditableWarning
            onBlur={e => {
              const data = [...this.state.cars];
              data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
              this.setState({ cars: data });
            }}
            dangerouslySetInnerHTML={{
              __html: this.state.cars[cellInfo.index][cellInfo.column.id]
            }}
        />
    );
  }


  render() {

    const columns = [{
      Header: 'id',
      accessor: 'id',
      Cell: this.renderEditable
    }, {
      Header: 'firstName',
      accessor: 'firstName',
      Cell: this.renderEditable
    }, {
      Header: 'lastName',
      accessor: 'lastName',
      Cell: this.renderEditable
    }]


    return (
        <div className="App">
        <h2>Test</h2>

          <ReactTable data={this.state.cars} columns={columns}
                      filterable={true} pageSize={10}/>
        </div>
    );
  }
}

export default App;