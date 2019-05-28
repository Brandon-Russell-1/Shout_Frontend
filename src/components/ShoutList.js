import React, { Component } from 'react';
import ReactTable from "react-table"; //MIT
import 'react-table/react-table.css'; //MIT
import 'react-confirm-alert/src/react-confirm-alert.css' //MIT

import AddShout from "./AddShout.js";
import { ToastContainer, toast } from 'react-toastify'; //MIT
import 'react-toastify/dist/ReactToastify.css'; //MIT
import {SERVER_URL} from '../constants.js';
import Grid from "@material-ui/core/Grid"; //MIT




class ShoutList extends Component {

    constructor(props) {
        super(props);
        this.state = { shouts: [], open: false, message: ''};

    }

    componentDidMount() {
        this.fetchShouts();


    }

    fetchShouts = () => {

        fetch(SERVER_URL+"/shouts/search/findUserLocationShouts?userLat="+this.props.myUserLocation.lat+"&userLong="+this.props.myUserLocation.lng)
            .then((response) => response.json())
            .then((responseData) => {


                this.setState({
                    shouts: responseData,
                });
                this.props.callbackFromParent(responseData);
            })
            .catch(err => console.error(err));


    }



    // Add new shout
    addShout(shout) {

        fetch(SERVER_URL+'/add',
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
            Header: 'Date Entered',
            accessor: 'shoutDate',
            Cell: this.renderEditable
        }, {
            Header: 'Shout Entry',
            accessor: 'shoutEntry',
            Cell: this.renderEditable,
            width: 500
        }/*, {
            Header: 'Shout Lat',
            accessor: 'shoutLat',
            Cell: this.renderEditable
        }, {
            Header: 'Shout Long',
            accessor: 'shoutLong',
            Cell: this.renderEditable
        }*/]

        return (
            <div className="App">

                <Grid container>
                    <Grid item>
                        <AddShout addShout={this.addShout} fetchShouts={this.fetchShouts} myUserLocation = {this.props.myUserLocation}/>
                    </Grid>
                </Grid>

                <ReactTable data={this.state.shouts} columns={columns}
                            filterable={true} pageSize={15}/>

                <ToastContainer autoClose={1500}/>
            </div>
        );
    }
}

export default ShoutList;