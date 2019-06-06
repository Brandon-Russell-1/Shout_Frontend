import React, { Component } from 'react';
import './App.css';
import ShoutList from "./components/ShoutList";
import Grid from "@material-ui/core/Grid"; //MIT
//import { throttle, debounce } from 'throttle-debounce'; //MIT


const { compose, withProps, withState, withHandlers } = require("recompose");
const {
    withScriptjs,
    withGoogleMap,
    GoogleMap,
    Marker,
    InfoWindow,
} = require("react-google-maps");

const MapWithControlledZoom = compose(
    withProps({
        googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyB_hkyArIHX2mBEsaWfcPUwjqv9_rNhCro&v=3.exp&libraries=geometry,drawing,places",
        loadingElement: <div style={{ height: `100%` }} />,
        containerElement: <div style={{ height: `800px` }} />,
        mapElement: <div style={{ height: `100%` }} />,
    }),
    withState('zoom', 'onZoomChange', 15),
    withState('center', 'onCenterChange', [0,0]),
    withHandlers(() => {
        let map;
        //const refs = {
         //   map: undefined
        //}

        return {
            onMapMounted: () => ref => {
                map = ref
            },
            onZoomChanged: ({ onZoomChange }) => () => {

                //console.log(refs.map.getZoom())
                return onZoomChange(map.getZoom())
            },
            onCenterChanged: ({onCenterChange}) => () => {

                //console.log(refs.map.getCenter().lat('a'));
               //console.log(map.getCenter().lat() + " : " + map.getCenter().lng());
                return  onCenterChange([map.getCenter().lat(), map.getCenter().lng()]);
            }
        }
    }),
    withScriptjs,
    withGoogleMap
)(props =>
    <GoogleMap
        center={props.myUserLocation}
        zoom={props.zoomLevel}
        ref={props.onMapMounted}
        onZoomChanged={props.onZoomChanged}
        onCenterChanged={props.onCenterChanged}
    >

        {props.onCenterHandle(props.center)}
        {props.onZoomHandle(props.zoom)}


        <Marker


            position={{ lat: props.myUserLocation.lat, lng: props.myUserLocation.lng }}
            options={{icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'}}
        >

            <InfoWindow>
                <div>
                    Home
                </div>
            </InfoWindow>

        </Marker>


        {props.markers.map(marker => {
            const onClick = props.onMarkerClick.bind(this, marker)
            return (

                <Marker
                    key={marker.id}
                    onClick={onClick}
                    position={{ lat: marker.shoutLat, lng: marker.shoutLong }}

                >
                    {props.selectedMarker === marker &&
                    <InfoWindow>
                        <div>
                            {marker.shoutEntry}
                        </div>
                    </InfoWindow>}

                </Marker>
            )
        })}

    </GoogleMap>
);



class App extends Component {
    constructor(props) {
        super(props);
        this.handleCenter = this.handleCenter.bind(this);
        this.state = { userLocation: { lat: 32, lng: 32 },
            mapShouts: [],
            loading: true,
            selectedMarker: false,
            zoomLevel: 15,
            myCenter: [0,0]
            };


    }




    handleClick = (marker, event) => {

        this.setState({ selectedMarker: marker })
    }

    handleZoom = (theZoom, event) => {

        this.setState({ zoomLevel: theZoom });

    }

    handleCenter = (theCenter, event) => {

        this.setState({ myCenter: theCenter });

    }

    componentDidMount() {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;

                this.setState({
                    userLocation: { lat: latitude, lng: longitude },
                    loading: false
                });
            },
            () => {
                this.setState({ loading: false });
            }
        );



    }


    myShoutCallback = (callbackshouts) => {
        this.setState({
            mapShouts: callbackshouts,
        });

    }

  render() {

      const { loading, userLocation } = this.state;

       if (loading) {
          return null;
      }

    return (
        <div className="App">
          <header className="App-header">
            <h1 className="App-title">Day Shout</h1>
          </header>
          <Grid container>
              <Grid item xs={6}>
                  <ShoutList myUserLocation = {userLocation} theMapCenter = {this.state.myCenter} callbackFromParent={this.myShoutCallback}
                             myZoom = {this.state.zoomLevel}/>
              </Grid>

              <Grid item xs={6}>

                  <MapWithControlledZoom myUserLocation = {userLocation} markers = {this.state.mapShouts}
                                         onMarkerClick={this.handleClick} selectedMarker={this.state.selectedMarker}
                                         zoomLevel = {this.state.zoomLevel} onZoomHandle = {this.handleZoom} onCenterHandle = {this.handleCenter}/>


              </Grid>

          </Grid>

            <footer className='App-footer'>
                &copy; {new Date().getFullYear()} Copyright: <a href="https://bwizlabs.net/"> Bwiz Labs </a>
            </footer>
        </div>
    );
  }
}

export default App
