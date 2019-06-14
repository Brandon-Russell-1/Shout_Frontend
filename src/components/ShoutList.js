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
import {ZOOM_DEFAULT, ZOOM_MAX} from "../constants";
import  point from '@turf/distance';
import  distance from '@turf/distance';
import _ from 'lodash';

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
                       zoomSet: ZOOM_MAX,
                       ipChecker: '',
                       originalIP: '',
                       selected: null,
                       selectedIndex: null


                       };
        this.debouncedOnChangeFetch = _.debounce(this.fetchShouts.bind(this), 500);

    }


    componentDidMount() {
        this.fetchShouts();

        var intervalId = setInterval(this.fetchShouts, 120000);
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


        this.props.myUpdateProgressBarStatusCallBack(0);
        if (this.props.myZoom >= this.state.zoomSet){
            this.setState({zoomCheck: this.props.myZoom})
        }else if (this.props.myZoom < this.state.zoomSet) {
            this.setState({zoomCheck: this.state.zoomSet})
        }


            if (this.props.theMapCenter[0] === 0 && this.props.theMapCenter[1] === 0) {
             //   console.log("User Location Fetch!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

                this.props.myUpdateProgressBarStatusCallBack(10);
                fetch(SERVER_URL + "/shouts/search/findUserLocationShouts?userLat=" + this.props.myUserLocation.lat + "&userLong=" + this.props.myUserLocation.lng + "&zoom=" + this.state.zoomCheck +  "&shouthave=0")
                    .then((response) => response.json())
                    .then((responseData) => {

                        this.props.myUpdateProgressBarStatusCallBack(50);
                        this.setState({
                            shouts: responseData['_embedded']['shouts'],
                        });


                        this.props.callbackFromParent(this.state.shouts);
                        this.props.myUpdateProgressBarStatusCallBack(100);
                    })
                    .catch(err => console.error(err));
            } else {

                this.props.myUpdateProgressBarStatusCallBack(0);

                //Calculate what is still here, so database does not return unnecessary data
                this.setState({shoutsTemp: [],
                    shoutsTempIndexListString: "&shouthave=0"});

                this.findPrevShouts().then((shoutsPrevTemp) => {
                    this.setState({shoutsTemp: shoutsPrevTemp});    });

                this.props.myUpdateProgressBarStatusCallBack(10);
                console.log("shout temp string:");
                console.log(this.state.shoutsTempIndexListString);

                fetch(SERVER_URL + "/shouts/search/findUserLocationShouts?userLat=" + this.props.theMapCenter[0] + "&userLong=" + this.props.theMapCenter[1] + "&zoom=" + this.state.zoomCheck + this.state.shoutsTempIndexListString)
                    .then((response) => response.json())
                    .then((responseData) => {
                        this.props.myUpdateProgressBarStatusCallBack(50);
                        this.setState({
                            shouts: responseData['_embedded']['shouts'],
                        });



                        console.log("shout old:");
                        console.log(this.state.shoutsTemp);

                        console.log("shouts new:");
                        console.log(this.state.shouts);

                       // this.state.shouts.concat(this.state.shoutsTemp);
                        this.state.shouts.push.apply(this.state.shouts, this.state.shoutsTemp);

                        console.log("shouts combined:");
                        console.log(this.state.shouts);

                        this.props.callbackFromParent(this.state.shouts);
                        this.props.myUpdateProgressBarStatusCallBack(100);

                    })
                    .catch(err => console.error(err));




            }

        }

        findPrevShouts = () =>{

        return new Promise((resolve, reject) =>{

            this.setState({shoutsPrevTemp: []});


            this.state.shouts.map(shout => {
                this.setState({ mydistance: this.getDistance([shout.shoutLat, shout.shoutLong],[this.props.theMapCenter[0], this.props.theMapCenter[1]])})
                if(this.state.mydistance <= 156543.03392 * Math.cos(this.props.theMapCenter[0] * Math.PI / 180) / Math.pow(2, this.state.zoomCheck)){
                        this.state.shoutsPrevTemp.push(shout);
                        this.state.shoutsTempIndexListString += "," + shout['_links']['self']['href'].substr(shout['_links']['self']['href'].lastIndexOf('/')+1);
                }
            })
            resolve(this.state.shoutsPrevTemp);
        });
        }

    componentDidUpdate(prevProps, prevState) {

        //What was selected from map check. If not same, null out table selection
        if(this.props.myselectedFromTable !== prevProps.myselectedFromTable){
            this.setState({selectedIndex: null})
        }
//console.log(this.state.zoomCheck);
//console.log( 156543.03392 * Math.cos(this.props.theMapCenter[0] * Math.PI / 180) / Math.pow(2, this.state.zoomCheck));
/*        if( prevProps.myZoom != this.props.myZoom && this.props.myZoom >= this.state.zoomSet){
         //   this.fetchShouts();
        }else */if (this.props.myZoom >= this.state.zoomSet && Math.abs(prevProps.theMapCenter[0]- this.props.theMapCenter[0]) >= .04 || Math.abs(prevProps.theMapCenter[1]- this.props.theMapCenter[1]) >= .04 ){
            console.log(this.props.myZoom);


            this.debouncedOnChangeFetch();
           // debounce(10, this.fetchShouts);
        }else if (this.props.myZoom < this.state.zoomSet || Math.abs(prevProps.theMapCenter[0]- this.props.theMapCenter[0]) < .04 || Math.abs(prevProps.theMapCenter[1]- this.props.theMapCenter[1]) < .04){

        }else if (Math.abs(prevProps.theMapCenter[0]- this.props.theMapCenter[0]) > 1.5 || Math.abs(prevProps.theMapCenter[1]- this.props.theMapCenter[1]) > 1.5){
          //  console.log(this.props.myZoom);
            this.debouncedOnChangeFetch();
          //  debounce(10, this.fetchShouts);
        }
    }


    // Add new shout
    addShout = (shout) => {
        if (shout.has('shoutImage')) {
            fetch(SERVER_URL + '/add', {method: 'POST', headers: {}, body: shout})
                .then(res => {
                    toast.success("Shout Added", {
                        position: toast.POSITION.BOTTOM_LEFT
                    });

                    this.setState({
                        shouts: []
                    });
                    this.fetchShouts();

                })
                .catch(err => console.error(err))
        }else{
            //No Image upload
            toast.error("Shout Image?", {
                position: toast.POSITION.BOTTOM_LEFT
            });
        }
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