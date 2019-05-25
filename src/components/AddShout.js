import React from 'react';
import SkyLight from 'react-skylight';
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";







class AddShout extends React.Component {

    constructor(props) {
        super(props);
        this.state = { hits: [], shoutEntry: '',  shoutLat: '', shoutLong: ''};

    }


    handleChange = (event) => {
        this.setState(
            {[event.target.name]: event.target.value}
        );
    }

    // Save shout and close modal form
    handleSubmit = (event) => {
        event.preventDefault();
        const API = 'https://geoip-db.com/json';

        fetch(API)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Something went wrong ...');
                }
            })
            .then(data => this.setState({hits: data}))
            .catch(error => this.setState({error}));

        console.log(this.state.hits);

        var newShout = { shoutIp: String(this.state.hits[0]),shoutEntry: this.state.shoutEntry,
            shoutLat: this.state.shoutLat, shoutLong: this.state.shoutLong};
        this.props.addShout(newShout);
        this.refs.addDialog.hide();
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

                        <TextField label="Shout Entry" placeholder="shoutEntry" name="shoutEntry" onChange={this.handleChange} /><br/>
                        <TextField label="Shout Lat" placeholder="shoutLat" name="shoutLat" onChange={this.handleChange}/><br/>
                        <TextField label="Shout Long" placeholder="shoutLong" name="shoutLong" onChange={this.handleChange}/><br/>
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