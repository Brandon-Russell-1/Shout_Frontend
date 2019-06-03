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
        <GoogleMap
            zoom={15}
            center={props.theUserLocation}
            onZoomChanged={console.log(props.map.getZoom())}


        >
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
            selectedMarker: false,
            zoomLevel: 15,
            googleMap: React.createRef()
        }
    }
    componentDidMount() {

    }

    onZoomChanged = () => {
        //[ts] Property 'getZoom' does not exist on type 'RefObject<GoogleMap>'
        const zoom = this.map.getZoom()

        alert(zoom)
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
                onZoomChanged = {this.onZoomChanged}

            />
        )
    }
}