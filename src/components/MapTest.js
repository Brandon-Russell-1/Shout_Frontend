import React, { Component } from 'react'
import {GoogleMap, withGoogleMap, withScriptjs, Marker, InfoWindow} from 'react-google-maps'


class ShelterMap extends Component {
    map: React.RefObject<GoogleMap>

    constructor(props: any) {
        super(props)
        this.state = {
            markers: [],
            selectedMarker: false,
            zoomLevel: 15
        }
        this.map = React.createRef()
    }

    onZoomChanged = () => {
        //[ts] Property 'getZoom' does not exist on type 'RefObject<GoogleMap>'
        const zoom = this.map.current.getZoom()

        alert(zoom)
    }
    handleClick = (marker, event) => {

        this.setState({ selectedMarker: marker })
    }
    render() {


        return (
            <GoogleMap
                googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyDL2VpoycKtKH9ui3tr-TfUlH7L27zVZyA&callback=initMap"
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: `100%` }} />}
                mapElement={<div style={{ height: `100%` }} />}
                ref={this.map}
                zoom={this.props.zoom}
                center={this.props.myUserLocation}
                onClick={this.handleClick}
                onZoomChanged={this.onZoomChanged}
                markers={this.props.myMapShouts}


            >

                {this.props.markers.map(marker => {
                    const onClick = this.props.onClick.bind(this, marker)
                    return (
                        <Marker
                            key={marker.id}
                            onClick={onClick}
                            position={{ lat: marker.shoutLat, lng: marker.shoutLong }}
                        >
                            {this.props.selectedMarker === marker &&
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
    }
}

export default withScriptjs(withGoogleMap(Map))