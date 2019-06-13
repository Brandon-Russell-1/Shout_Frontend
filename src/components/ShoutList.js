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
import {ZOOM_DEFAULT} from "../constants";
import  point from '@turf/distance';
import  distance from '@turf/distance';


class ShoutList extends Component {

    constructor(props) {
        super(props);
        this.state = { shouts: [],
                       shoutsTemp: [],
                       shoutsTempIndexList: [],
                       shoutsTempIndexListString: "&shouthave=0",
                       open: false,
                       message: '',
                       zoomCheck: ZOOM_DEFAULT,
                       zoomSet: 10,
                       ipChecker: '',
                       originalIP: '',
                       selected: null,
                       selectedIndex: null

                       };


    }


    componentDidMount() {
        this.fetchShouts();

        var intervalId = setInterval(this.fetchShouts, 3000);
        // store intervalId in the state so it can be accessed later:
        this.setState({intervalId: intervalId});
    }

    componentWillUnmount() {
    // use intervalId from the state to clear the interval
    clearInterval(this.state.intervalId);

    }

    //Call back to reset map center to user location
    resetMapCenterCallBackAddShout = (mapResetUserLocation) => {

        this.props.myResetMapLocationCallBack(mapResetUserLocation);

    }


    rad = (x) => {
        return x * Math.PI / 180;
    }

    getDistance = (p1, p2) => {
        var R = 6378137; // Earth’s mean radius in meter
        var dLat = this.rad(p2[0] - p1[0]);
        var dLong = this.rad(p2[1] - p1[1]);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.rad(p1[0])) * Math.cos(this.rad(p2[0])) *
            Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        d *= 0.00062137;
        //console.log(d);
        return d; // returns the distance in miles
    }



    //Fetch based on zoom and center
    fetchShouts = () => {

        if (this.props.myZoom >= this.state.zoomSet){
            this.setState({zoomCheck: this.props.myZoom})
        }else if (this.props.myZoom < this.state.zoomSet) {
            this.setState({zoomCheck: this.state.zoomSet})
        }


            if (this.props.theMapCenter[0] === 0 && this.props.theMapCenter[1] === 0) {
             //   console.log("User Location Fetch!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

                fetch(SERVER_URL + "/shouts/search/findUserLocationShouts?userLat=" + this.props.myUserLocation.lat + "&userLong=" + this.props.myUserLocation.lng + "&zoom=" + this.state.zoomCheck +  this.state.shoutsTempIndexListString)
                    .then((response) => response.json())
                    .then((responseData) => {


                        this.setState({
                            shouts: responseData['_embedded']['shouts'],
                        });


                        this.props.callbackFromParent(this.state.shouts);
                    })
                    .catch(err => console.error(err));
            } else {
            //    console.log("Center Change Fetch!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

                //Calculate what is still here, so database does not return unnecessary data
                this.setState({shoutsTemp: [],
               shoutsTempIndexListString: "",
                shoutsTempIndexList: []});

                {this.state.shouts.map(shout => {

                    this.setState({ mydistance: this.getDistance([shout.shoutLat, shout.shoutLong],[this.props.theMapCenter[0], this.props.theMapCenter[1]])})
                   // console.log(this.state.mydistance);
                    if(this.state.mydistance <= 156543.03392 * Math.cos(this.props.theMapCenter[0] * Math.PI / 180) / Math.pow(2, this.state.zoomCheck)){
                        if(this.state.shoutsTemp.includes(shout)){
                      //      console.log("do nothing")
                        }else{
                      //      console.log("push!!!!!!!!!!!!!!!!!!!!!!!!!!")
                            this.state.shoutsTemp.push(shout);
                            this.state.shoutsTempIndexList.push(shout['_links']['self']['href'].substr(shout['_links']['self']['href'].lastIndexOf('/')+1));
                        }

                    }
                })}
                this.setState({shoutsTempIndexListString: '&shouthave=' + this.state.shoutsTempIndexList.join('&shouthave=')});


                if(this.state.shoutsTempIndexList && this.state.shoutsTempIndexList.length === 0){
                    this.setState({shoutsTempIndexListString: "&shouthave=0"})
                }

              //  console.log(this.props.theMapCenter[0] + " : " + this.props.theMapCenter[1]);
             //   console.log(this.state.shoutsTempIndexListString);


                fetch(SERVER_URL + "/shouts/search/findUserLocationShouts?userLat=" + this.props.theMapCenter[0] + "&userLong=" + this.props.theMapCenter[1] + "&zoom=" + this.state.zoomCheck + this.state.shoutsTempIndexListString)
                    .then((response) => response.json())
                    .then((responseData) => {


                        this.setState({
                            shouts: responseData['_embedded']['shouts'],
                        });

                  //      console.log(this.state.zoomCheck);
                 //       console.log(this.state.shoutsTemp);
                //        console.log(this.state.shouts);
                        this.state.shouts.push.apply(this.state.shouts, this.state.shoutsTemp);

                //        console.log(this.state.shouts);
                        this.props.callbackFromParent(this.state.shouts);

                    })

                    .catch(err => console.error(err));


            }


        }



    componentDidUpdate(prevProps, prevState) {

        //What was selected from map check. If not same, null out table selection
        if(this.props.myselectedFromTable !== prevProps.myselectedFromTable){
            this.setState({selectedIndex: null})
        }





/*        if( prevProps.myZoom != this.props.myZoom && this.props.myZoom >= this.state.zoomSet){
          //  console.log("zoom$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");

            this.setState({intervalId: setInterval(this.fetchShouts, 2000)});


        }else if (this.props.myZoom >= this.state.zoomSet && Math.abs(prevProps.theMapCenter[0]- this.props.theMapCenter[0]) > .04 || Math.abs(prevProps.theMapCenter[1]- this.props.theMapCenter[1]) > .04){
         //   console.log("zoom_center%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
            //throttle(100, this.fetchShouts);
            this.setState({intervalId: setInterval(this.fetchShouts, 2000)});
        }else if (this.props.myZoom < this.state.zoomSet && Math.abs(prevProps.theMapCenter[0]- this.props.theMapCenter[0]) < .03 || Math.abs(prevProps.theMapCenter[1]- this.props.theMapCenter[1]) < .03){
            //this.setState({intervalId: setInterval(this.fetchShouts, 120000)});
        }else if (Math.abs(prevProps.theMapCenter[0]- this.props.theMapCenter[0]) > .5 || Math.abs(prevProps.theMapCenter[1]- this.props.theMapCenter[1]) > .5){
         //   console.log("center@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
            //throttle(100, this.fetchShouts);
            this.setState({intervalId: setInterval(this.fetchShouts, 2000)});
        }*/
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

        if (this.state.ipChecker.replace(/ /g,'') === this.state.originalIP.replace(/ /g,'')){
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
            width: 100,
            Cell: (row) => {
                return <div>

                    <img height={100} width={100} src={"data:image/png;base64,"+row.original.shoutSmallImage}/>


                </div>
            },
            id: "image"
        },{
            Header: 'Date Entered',
            accessor: 'shoutDate',
            width: 90,
            Cell: this.renderEditable
        }, {
            Header: 'Shout Entry',
            accessor: 'shoutEntry',
            Cell: this.renderEditable,
            width: 275,style:{ 'white-space': 'unset'}
        },{
            id: 'savebutton',
            sortable: 'false',
            filterable: 'false',
            width: 55,
            accessor: '_links.self.href',
            Cell: ({value,row}) =>
                (<button onClick={() => {this.updateShout(row,value)}}>
                    Save</button>)
        }]

        return (
            <div className="App">

                <Grid container>
                    <Grid item>
                        <AddShout addShout={this.addShout} fetchShouts={this.fetchShouts} myUserLocation = {this.props.myUserLocation} myResetUserMapLocationCallBack = {this.resetMapCenterCallBackAddShout}/>
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