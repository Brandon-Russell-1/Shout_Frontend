import React, { Component } from 'react';
import ReactTable from "react-table"; //MIT
import 'react-table/react-table.css'; //MIT
import 'react-confirm-alert/src/react-confirm-alert.css' //MIT

import AddShout from "./AddShout.js";
import { ToastContainer, toast } from 'react-toastify'; //MIT
import 'react-toastify/dist/ReactToastify.css'; //MIT
import {SERVER_URL} from '../constants.js';
import Grid from "@material-ui/core/Grid"; //MIT

import { throttle, debounce } from 'throttle-debounce'; //MIT


class ShoutList extends Component {

    constructor(props) {
        super(props);
        this.state = { shouts: [],
                       open: false,
                       message: '',
                       zoomCheck: 15

                       };


    }


    componentDidMount() {
        this.fetchShouts();
    }


//Fetch based on zoom and center
    fetchShouts = () => {

        if (this.props.myZoom <7) {
            this.setState({zoomCheck: 7})
        }else if (this.props.myZoom >= 7){
            this.setState({zoomCheck: this.props.myZoom})
        }

            if (this.props.theMapCenter[0] === 0 && this.props.theMapCenter[1] === 0) {

                fetch(SERVER_URL + "/shouts/search/findUserLocationShouts?userLat=" + this.props.myUserLocation.lat + "&userLong=" + this.props.myUserLocation.lng + "&zoom=" + this.state.zoomCheck)
                    .then((response) => response.json())
                    .then((responseData) => {


                        this.setState({
                            shouts: responseData['_embedded']['shouts'],
                        });
                        //console.log(this.state.theZoom);
                        this.props.callbackFromParent(responseData['_embedded']['shouts']);
                    })
                    .catch(err => console.error(err));
            } else {

                fetch(SERVER_URL + "/shouts/search/findUserLocationShouts?userLat=" + this.props.theMapCenter[0] + "&userLong=" + this.props.theMapCenter[1] + "&zoom=" + this.state.zoomCheck)
                    .then((response) => response.json())
                    .then((responseData) => {


                        this.setState({
                            shouts: responseData['_embedded']['shouts'],
                        });
                        //console.log(this.state.theZoom);
                        this.props.callbackFromParent(responseData['_embedded']['shouts']);
                    //    console.log(responseData['_embedded']['shouts'])
                    })

                    .catch(err => console.error(err));


            }
        }



/*
    static getDerivedStateFromProps(nextProps, prevState){
        if(nextProps.myZoom!==prevState.myZoom){
            return { zoomState: nextProps.myZoom};
        } else if(nextProps.userLocation!==prevState.userLocation){
            return { centerState: nextProps.userLocation};
        }
        else return null;
    }
*/

    componentDidUpdate(prevProps, prevState) {
        if(prevProps.myZoom!==this.props.myZoom){
            throttle(300, this.fetchShouts());
        }else if (prevProps.theMapCenter[0]!==this.props.theMapCenter[0] && prevProps.theMapCenter[1]!==this.props.theMapCenter[1]){
            debounce(300, this.fetchShouts());
        }
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


    // Update shout
    updateShout(shout, link) {
        console.log(shout);
        console.log(link);

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

                <ReactTable data={this.state.shouts} columns={columns}
                            filterable={true} pageSize={15}   showPageSizeOptions = {false} defaultPageSize = {10}/>

                <ToastContainer autoClose={1500}/>
            </div>
        );
    }
}

export default ShoutList;