import React, { Component } from 'react';
import ReactTable from "react-table"; //MIT
import 'react-table/react-table.css'; //MIT
import 'react-confirm-alert/src/react-confirm-alert.css' //MIT

import AddShout from "./AddShout.js";
import { ToastContainer, toast } from 'react-toastify'; //MIT
import 'react-toastify/dist/ReactToastify.css'; //MIT
import {SERVER_URL} from '../constants.js';
import Grid from "@material-ui/core/Grid"; //MIT

import { throttle, debounce } from 'throttle-debounce';
import {IP_URL} from "../constants";
import * as ReactDOM from "react-dom";
import SkyLight from "react-skylight";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button"; //MIT


class ShoutList extends Component {

    constructor(props) {
        super(props);
        this.state = { shouts: [],
                       open: false,
                       message: '',
                       zoomCheck: 15,
                       zoomSet: 7,
                       ipChecker: '',
                       originalIP: '',
                       selected: null,
                       selectedIndex: null

                       };


    }


    componentDidMount() {
        this.fetchShouts();
    }


//Fetch based on zoom and center
    fetchShouts = () => {

        if (this.props.myZoom < this.state.zoomSet) {
            this.setState({zoomCheck: this.state.zoomSet})
        }else if (this.props.myZoom >= this.state.zoomSet){
            this.setState({zoomCheck: this.props.myZoom})
        }

            if (this.props.theMapCenter[0] === 0 && this.props.theMapCenter[1] === 0) {

                fetch(SERVER_URL + "/shouts/search/findUserLocationShouts?userLat=" + this.props.myUserLocation.lat + "&userLong=" + this.props.myUserLocation.lng + "&zoom=" + this.state.zoomCheck)
                    .then((response) => response.json())
                    .then((responseData) => {


                        this.setState({
                            shouts: responseData['_embedded']['shouts'],
                        });


                        this.props.callbackFromParent(responseData['_embedded']['shouts']);
                       // console.log(this.state.shouts);
                    })
                    .catch(err => console.error(err));
            } else {

                fetch(SERVER_URL + "/shouts/search/findUserLocationShouts?userLat=" + this.props.theMapCenter[0] + "&userLong=" + this.props.theMapCenter[1] + "&zoom=" + this.state.zoomCheck)
                    .then((response) => response.json())
                    .then((responseData) => {


                        this.setState({
                            shouts: responseData['_embedded']['shouts'],
                        });

                        this.props.callbackFromParent(responseData['_embedded']['shouts']);

                    })

                    .catch(err => console.error(err));


            }
        }



    componentDidUpdate(prevProps, prevState) {

        if(this.props.myselectedFromTable !== prevProps.myselectedFromTable){
           // console.log('test')
            this.setState({selectedIndex: null})
        }

        if(prevProps.myZoom!==this.props.myZoom){
            throttle(300, this.fetchShouts());
          //  this.setState({selected: null, selectedIndex: null})
         //   this.props.callbackFromParentForSelected(this.state.selected);
        }else if (prevProps.theMapCenter[0]!==this.props.theMapCenter[0] && prevProps.theMapCenter[1]!==this.props.theMapCenter[1]){
            debounce(300, this.fetchShouts());
          //  this.setState({selected: null, selectedIndex: null})
          //  this.props.callbackFromParentForSelected(this.state.selected);
        }
    }




    // Add new shout
    addShout(shout) {

        fetch(SERVER_URL+'/add', { method: 'POST', headers: {}, body: shout})
            .then( res => {
                toast.success("Shout Added", {
                    position: toast.POSITION.BOTTOM_LEFT
                });
                this.fetchShouts();
            })
            .catch(err => console.error(err))
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


    // Update shout
    updateShout(shout, link) {


        this.setState({originalIP: shout['_original']['shoutIp'] })
        //Get IP

        fetch(IP_URL)
            .then((response) => response.json())
            .then((responseData) => {


                this.setState({
                    ipChecker: responseData['ip'],
                });
            })
            .catch(err => console.error(err));

       // console.log('original ip: '+this.state.originalIP +'+');
       // console.log('changing ip: '+ this.state.ipChecker+'+');

        if (this.state.ipChecker.replace(/ /g,'') === this.state.originalIP.replace(/ /g,'')){
         //   console.log('Good');
            fetch(link,
                { method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(shout)
                })
                .then( res =>
                    toast.success("Changes saved", {
                        position: toast.POSITION.BOTTOM_LEFT
                    })
                )
                .catch( err =>
                    toast.error("Error when saving", {
                        position: toast.POSITION.BOTTOM_LEFT
                    })
                )

        }else{
            toast.error("Changes must be made from same IP", {
                position: toast.POSITION.BOTTOM_LEFT
            })
        }


    }

    handleChange = (e) => {
        this.setState({keyword: e.target.value});
    }

    render() {

        const columns = [                {
            Header: "Image",
            Cell: (row) => {
                return <div>

                    <img height={100} width={100} src={"data:image/png;base64,"+row.original.shoutSmallImage}/>


                </div>
            },
            id: "image"
        },{
            Header: 'Date Entered',
            accessor: 'shoutDate',
            Cell: this.renderEditable
        }, {
            Header: 'Shout Entry',
            accessor: 'shoutEntry',
            Cell: this.renderEditable,
            width: 500
        },{
            id: 'savebutton',
            sortable: 'false',
            filterable: 'false',
            width: 100,
            accessor: '_links.self.href',
            Cell: ({value,row}) =>
                (<button onClick={() => {this.updateShout(row,value)}}>
                    Save</button>)
        }]

        return (
            <div className="App">

                <Grid container>
                    <Grid item>
                        <AddShout addShout={this.addShout} fetchShouts={this.fetchShouts} myUserLocation = {this.props.myUserLocation}/>
                    </Grid>
                </Grid>

                <div id="container"></div>
                <ReactTable data={this.state.shouts} columns={columns}
                            filterable={true} pageSize={5}   showPageSizeOptions = {false} defaultPageSize = {5}


                            getTrProps={(state, rowInfo) => {
                                if (rowInfo && rowInfo.row) {
                                    return {
                                        onClick: (e) => {
                                            this.setState({
                                                selected: rowInfo.row.savebutton.substr(rowInfo.row.savebutton.lastIndexOf('/')+1),
                                                selectedIndex: rowInfo.index

                                            })
                                            this.props.callbackFromParentForSelected(this.state.selected);

                                        },
                                        style: {

                                            background: rowInfo.index === this.state.selectedIndex ||
                                                        rowInfo.row.savebutton.substr(rowInfo.row.savebutton.lastIndexOf('/')+1) === this.props.myselectedFromTable
                                                        ? '#687999' : 'white'

                                        }
                                    }
                                }else{
                                    return {}
                                }
                            }
                            }


                />


                <ToastContainer autoClose={1500}/>
            </div>
        );
    }
}

export default ShoutList;