import React, { Component } from "react"
import { compose } from "recompose"
import {
    withScriptjs,
    withGoogleMap,
    GoogleMap,
    Marker,
    InfoWindow
} from "react-google-maps"

const MapWithAMarker = compose(withScriptjs, withGoogleMap)(props => {

    return (
        <GoogleMap defaultZoom={15} defaultCenter={props.theUserLocation}>
            {props.markers.map(marker => {
                const onClick = props.onClick.bind(this, marker)
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
    )
})

export default class ShelterMap extends Component {
    constructor(props) {
        super(props)
        this.state = {
            shelters: [],
            selectedMarker: false
        }
    }
    componentDidMount() {
        fetch("https://api.harveyneeds.org/api/v1/shelters?limit=20")
            .then(r => r.json())
            .then(data => {
                this.setState({ shelters: data.shelters })
            })
    }
    handleClick = (marker, event) => {

        this.setState({ selectedMarker: marker })
    }
    render() {
        return (
            <MapWithAMarker
                selectedMarker={this.state.selectedMarker}
                markers={this.props.myMapShouts}
                onClick={this.handleClick}
                googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyDL2VpoycKtKH9ui3tr-TfUlH7L27zVZyA&callback=initMap"
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: `100%` }} />}
                mapElement={<div style={{ height: `100%` }} />}
                theUserLocation={this.props.myUserLocation}
            />
        )
    }
}