import React from 'react';
import SkyLight from 'react-skylight'; //MIT
import TextField from "@material-ui/core/TextField"; //MIT
import Button from "@material-ui/core/Button";
import {IP_URL} from '../constants.js';
import { ToastContainer, toast } from 'react-toastify'; //MIT
import 'react-toastify/dist/ReactToastify.css'; //MIT

class AddShout extends React.Component {

    constructor(props) {
        super(props);
        this.state = { hits: [], shoutEntry: '',  shoutLat: '', shoutLong: '', shoutIp: '', selectedFile: null, shoutImage: null};

    }


    handleChange = (event) => {
        this.setState(
            {[event.target.name]: event.target.value}
        );
    }

    // Save shout and close modal form
    handleSubmit = (event) => {
        event.preventDefault();

if(this.state.selectedFile.size <= 2000000 &&
    (this.state.selectedFile.type === "image/gif" ||
        this.state.selectedFile.type === "image/png" ||
        this.state.selectedFile.type === "image/jpg" ||
        this.state.selectedFile.type === "image/jpeg" )){
    //Get IP

    fetch(IP_URL)
        .then((response) => response.json())
        .then((responseData) => {

            this.setState({
                shoutIp: responseData['ip'],
            });

            let newShout = new FormData();
            newShout.append('shoutImage', this.state.selectedFile);
            newShout.append('shoutIp', this.state.shoutIp);
            newShout.append('shoutEntry', this.state.shoutEntry);
            newShout.append('shoutLat', this.props.myUserLocation.lat);
            newShout.append('shoutLong', this.props.myUserLocation.lng)
            this.props.addShout(newShout);
            this.refs.addDialog.hide();

        })
        .catch(err => console.error(err));

}else{
    toast.error("Only JPG/PNG/GIF of 2MB or less allowed.", {
        position: toast.POSITION.BOTTOM_LEFT
    });
}

    }

    cancelSubmit = (event) => {
        event.preventDefault();
        this.refs.addDialog.hide();
    }

    fileChangedHandler = (event) => {
        this.setState({selectedFile: event.target.files[0]})


    }

    render() {
        return (
            <div>
                <SkyLight hideOnOverlayClicked ref="addDialog">
                    <h3>New Shout</h3>

                    <form >

                        <TextField label="Shout Entry" placeholder="shoutEntry" name="shoutEntry" onChange={this.handleChange} fullWidth />
                        <br/>
                        <br/>
                        <input type="file" onChange={this.fileChangedHandler} accept=".png,.jpg,.gif,.jpeg"/>
                        <br/>
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