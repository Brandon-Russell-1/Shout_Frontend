import React from 'react';
import SkyLight from 'react-skylight'; //MIT
import TextField from "@material-ui/core/TextField"; //MIT
import Button from "@material-ui/core/Button";
import {IP_URL} from '../constants.js';


class AddShout extends React.Component {

    constructor(props) {
        super(props);
        this.state = { hits: [], shoutEntry: '',  shoutLat: '', shoutLong: '', shoutIp: ''};

    }


    handleChange = (event) => {
        this.setState(
            {[event.target.name]: event.target.value}
        );
    }

    // Save shout and close modal form
    handleSubmit = (event) => {
        event.preventDefault();

//Get IP

        fetch(IP_URL)
            .then((response) => response.json())
            .then((responseData) => {


                this.setState({
                    shoutIp: responseData['ip'],
                });

                var newShout = { shoutIp: this.state.shoutIp,shoutEntry: this.state.shoutEntry,
                    shoutLat: this.props.myUserLocation.lat, shoutLong: this.props.myUserLocation.lng};
                this.props.addShout(newShout);
                this.refs.addDialog.hide();

            })
            .catch(err => console.error(err));


    }

    cancelSubmit = (event) => {
        event.preventDefault();
        this.refs.addDialog.hide();
    }

    render() {
        return (
            <div>
                <SkyLight hideOnOverlayClicked ref="addDialog">
                    <h3>New Shout</h3>
                    <form>

                        <TextField label="Shout Entry" placeholder="shoutEntry" name="shoutEntry" onChange={this.handleChange} fullWidth /><br/>

                        <br/>
                        <Button variant="outlined" style={{marginRight: 10}} color="primary" onClick={this.handleSubmit}>Save</Button>
                        <Button variant="outlined" color="secondary" onClick={this.cancelSubmit}>Cancel</Button>

                    </form>
                </SkyLight>
                <div>
                    <Button variant="contained" color="primary" style={{'margin': '10px'}} onClick={() => this.refs.addDialog.show()}>New Shout</Button>
                </div>
            </div>
        );
    }
}

export default AddShout;