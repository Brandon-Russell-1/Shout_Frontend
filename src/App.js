import React, { Component } from 'react';
import './App.css';
import ShoutList from "./components/ShoutList";


class App extends Component {

  render() {


    return (
        <div className="App">
          <header className="App-header">
            <h1 className="App-title">Day Shout</h1>
          </header>

          <ShoutList />
        </div>
    );
  }
}

export default App;