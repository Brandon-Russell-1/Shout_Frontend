import React, { Component } from 'react';
import './App.css';
import ShoutList from "./components/ShoutList";
import Grid from "@material-ui/core/Grid"; //MIT
//import ShelterMap from "./components/MapTest";



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
        googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyDL2VpoycKtKH9ui3tr-TfUlH7L27zVZyA&v=3.exp&libraries=geometry,drawing,places",
        loadingElement: <div style={{ height: `100%` }} />,
        containerElement: <div style={{ height: `100%` }} />,
        mapElement: <div style={{ height: `100%` }} />,
    }),
    withState('zoom', 'onZoomChange', 8),
    withHandlers(() => {
        const refs = {
            map: undefined,
        }

        return {
            onMapMounted: () => ref => {
                refs.map = ref
            },
            onZoomChanged: ({ onZoomChange }) => () => {
                onZoomChange(refs.map.getZoom())
            }
        }
    }),
    withScriptjs,
    withGoogleMap
)

(props =>
    <GoogleMap
        defaultCenter={{ lat: -32, lng: 81 }}
        zoom={props.zoom}
        ref={props.onMapMounted}
        onZoomChanged={props.onZoomChanged}
    >
        <Marker
            position={{ lat: -34.397, lng: 150.644 }}
            onClick={props.onToggleOpen}
        >
            <InfoWindow onCloseClick={props.onToggleOpen}>
                <div>

                    {" "}
                    Controlled zoom: {props.zoom}
                </div>
            </InfoWindow>
        </Marker>
    </GoogleMap>
);


class App extends Component {
    constructor(props) {
        super(props);
        this.state = { userLocation: { lat: 32, lng: 32 },
            mapShouts: [],
            loading: true,
            showingInfoWindow: false,
            activeMarker: {},
            selectedPlace: {}};
        // binding this to event-handler functions

        this.onMarkerClick = this.onMarkerClick.bind(this);
        this.onMapClick = this.onMapClick.bind(this);

    }

    onMarkerClick = (props, marker, e) => {
        this.setState({
            selectedPlace: props,
            activeMarker: marker,
            showingInfoWindow: true
        });
    }
    onMapClick = (props) => {
        if (this.state.showingInfoWindow) {
            this.setState({
                showingInfoWindow: false,
                activeMarker: null
            });
        }
    }

    componentDidMount(props) {
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
      const { google } = this.props;

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
                  <ShoutList myUserLocation = {userLocation} callbackFromParent={this.myShoutCallback}/>
              </Grid>

              <Grid item xs={6}>
                  <MapWithControlledZoom />

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
