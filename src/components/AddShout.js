import React from 'react';
import SkyLight from 'react-skylight'; //MIT
import TextField from "@material-ui/core/TextField"; //MIT
import Button from "@material-ui/core/Button";
import {IP_URL} from '../constants.js';
import { ToastContainer, toast } from 'react-toastify'; //MIT
import 'react-toastify/dist/ReactToastify.css'; //MIT
import imageCompression from 'browser-image-compression';
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
import './AppShout.css';

class AddShout extends React.Component {

    constructor(props) {
        super(props);
        this.state = { hits: [], shoutEntry: '',  shoutLat: '', shoutLong: '', shoutIp: '', selectedFile: null, shoutImage: null, progressBarStatus: 0};

    }


    handleChange = (event) => {
        this.setState(
            {[event.target.name]: event.target.value}
        );
    }

    // Save shout and close modal form
    handleSubmit = (event) => {
        event.preventDefault();


        //Compress PNG and JPEG files
        if ( this.state.selectedFile.type === "image/png" ||
            this.state.selectedFile.type === "image/jpg" ||
            this.state.selectedFile.type === "image/jpeg"){

            var imageFile = this.state.selectedFile;
           // console.log('originalFile instanceof Blob', imageFile instanceof Blob); // true
          //  console.log(`originalFile size ${imageFile.size / 1024 / 1024} MB`);

            var options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1280,
                useWebWorker: true
            }
            this.setState({progressBarStatus: 10})
            imageCompression(imageFile, options)
                .then((compressedFile) => {
                //    console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
                //    console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB

                    this.setState({selectedFile: compressedFile});

                    this.setState({progressBarStatus: 50})
                    //Get IP
                    fetch(IP_URL)
                        .then((response) => response.json())
                        .then((responseData) => {

                            this.setState({
                                shoutIp: responseData['ip'],
                            });
                            this.setState({progressBarStatus: 80})
                            let newShout = new FormData();
                            newShout.append('shoutImage', this.state.selectedFile);
                            newShout.append('shoutIp', this.state.shoutIp);
                            newShout.append('shoutEntry', this.state.shoutEntry);
                            newShout.append('shoutLat', this.props.myUserLocation.lat);
                            newShout.append('shoutLong', this.props.myUserLocation.lng)
                            this.props.addShout(newShout);
                            this.setState({progressBarStatus: 100})
                            this.refs.addDialog.hide();

                        })
                        .catch(err => console.error(err));
                })
                .catch(err => console.error(err));
        }else if (this.state.selectedFile.type === "image/gif" && this.state.selectedFile.size <= 1024000 ){
            this.setState({progressBarStatus: 10})
            //Get IP
            fetch(IP_URL)
                .then((response) => response.json())
                .then((responseData) => {

                    this.setState({
                        shoutIp: responseData['ip'],
                    });
                    this.setState({progressBarStatus: 50})
                    let newShout = new FormData();
                    newShout.append('shoutImage', this.state.selectedFile);
                    newShout.append('shoutIp', this.state.shoutIp);
                    newShout.append('shoutEntry', this.state.shoutEntry);
                    newShout.append('shoutLat', this.props.myUserLocation.lat);
                    newShout.append('shoutLong', this.props.myUserLocation.lng)
                    this.setState({progressBarStatus: 80})
                    this.props.addShout(newShout);
                    this.setState({progressBarStatus: 100})
                    this.refs.addDialog.hide();

                })
                .catch(err => console.error(err));
        }else{
    toast.error("Only JPG/PNG/GIF of 1MB or less allowed.", {
        position: toast.POSITION.BOTTOM_LEFT
    });
        }

    }

    cancelSubmit = (event) => {
        event.preventDefault();
        this.refs.addDialog.hide();
    }

    fileChangedHandler = (event) => {
        this.setState({progressBarStatus: 0})
        this.setState({selectedFile: event.target.files[0]})


    }

    render() {
        return (
            <div>
                <SkyLight hideOnOverlayClicked ref="addDialog">
                    <h3>New Shout</h3>

                    <form >

                        <TextField label="Shout Entry" placeholder="shoutEntry" name="shoutEntry" onChange={this.handleChange} style = {{width: 400}}  />
                        <br/>
                        <br/>
                        <input type="file" onChange={this.fileChangedHandler} accept=".png,.jpg,.gif,.jpeg"/>
                        <br/>
                        <br/>
                        <Button variant="outlined" style={{marginRight: 10}} color="primary" onClick={this.handleSubmit}>Save</Button>
                        <Button variant="outlined" color="secondary" onClick={this.cancelSubmit}>Cancel</Button>
                        <br/>
                        <br/>
                        <Progress type="circle" percent={this.state.progressBarStatus} status="active" />
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