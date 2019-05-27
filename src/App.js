import React, { Component } from 'react';
import './App.css';
import ShoutList from "./components/ShoutList";
import Grid from "@material-ui/core/Grid"; //MIT
import { GoogleApiWrapper, withScriptJS,InfoWindow, Map, Marker, GoogleMap } from "google-maps-react"; //MIT
import ShelterMap from "./components/MapTest";



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
                  <ShelterMap myUserLocation = {userLocation} myMapShouts = {this.state.mapShouts}/>
              </Grid>

          </Grid>

            <footer className='App-footer'>
                &copy; {new Date().getFullYear()} Copyright: <a href="https://bwizlabs.net/"> Bwiz Labs </a>
            </footer>
        </div>
    );
  }
}

export default GoogleApiWrapper({
    apiKey: 'AIzaSyDL2VpoycKtKH9ui3tr-TfUlH7L27zVZyA'
})(App);
