import React, { Component } from 'react';
import './App.css';
import ShoutList from "./components/ShoutList";
import MapContainer from "./components/MapContainer"
import Grid from "@material-ui/core/Grid";
import { GoogleApiWrapper, Map } from "google-maps-react";





class App extends Component {
    constructor(props) {
        super(props);
        this.state = { userLocation: { lat: 32, lng: 32 }, loading: true };
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

            <Grid container >
                <Grid item >

                    <Map google={google} initialCenter={userLocation} zoom={10} />;

                </Grid>
                <Grid item >

                    <ShoutList myUserLocation = {userLocation}/>
                </Grid>
            </Grid>

        </div>
    );
  }
}

export default GoogleApiWrapper({
    apiKey: 'AIzaSyDL2VpoycKtKH9ui3tr-TfUlH7L27zVZyA'
})(App);
