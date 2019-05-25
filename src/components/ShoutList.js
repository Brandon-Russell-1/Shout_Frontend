import React, { Component } from 'react';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import 'react-confirm-alert/src/react-confirm-alert.css'

import AddShout from "./AddShout.js";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {SERVER_URL} from '../constants.js';




class ShoutList extends Component {
    constructor(props) {
        super(props);
        this.state = { shouts: [], open: false, message: ''};
    }

    componentDidMount() {
        this.fetchShouts();
    }

    fetchShouts = () => {

        fetch(SERVER_URL+'/findall')
            .then((response) => response.json())
            .then((responseData) => {
                this.setState({
                    shouts: responseData,
                });
            })
            .catch(err => console.error(err));

    }

    // Add new shout
    addShout(shout) {
        fetch(SERVER_URL+'/shouts',
            {   method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(shout)
            })
            .then( res => {
                toast.success("Shout Added", {
                    position: toast.POSITION.BOTTOM_LEFT
                });
                this.fetchShouts();
            })
            .catch(err => console.error(err))
        //window.location.reload();

    }

    renderEditable = (cellInfo) => {
        return (
            <div
                style={{ backgroundColor: "#fafafa" }}
                contentEditable
                suppressContentEditableWarning
                onBlur={e => {
                    const data = [...this.state.shouts];
                    data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
                    this.setState({ shouts: data });
                }}
                dangerouslySetInnerHTML={{
                    __html: this.state.shouts[cellInfo.index][cellInfo.column.id]
                }}
            />
        );
    }

    handleChange = (e) => {
        this.setState({keyword: e.target.value});
    }

    render() {

        const columns = [{
            Header: 'id',
            accessor: 'id',
            Cell: this.renderEditable
        }, {
            Header: 'Date Entered',
            accessor: 'shoutDate',
            Cell: this.renderEditable
        }, {
            Header: 'Shout Entry',
            accessor: 'shoutEntry',
            Cell: this.renderEditable,
            width: 500
        }, {
            Header: 'Shout Lat',
            accessor: 'shoutLat',
            Cell: this.renderEditable
        }, {
            Header: 'Shout Long',
            accessor: 'shoutLong',
            Cell: this.renderEditable
        }]


        return (
            <div className="App">


                        <AddShout addShout={this.addShout} fetchShouts={this.fetchShouts}/>


                <ReactTable data={this.state.shouts} columns={columns}
                            filterable={true} pageSize={10}/>

                <ToastContainer autoClose={1500}/>
            </div>
        );
    }
}

export default ShoutList;