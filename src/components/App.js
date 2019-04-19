import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import Player from '../containers/Player';

const getHashQueryParams = hash =>
    hash
        .substr(1)
        .split('&')
        .reduce((pairs, p) => {
            const [key, value] = p.split('=');
            return {
                ...pairs,
                [key]: value,
            };
        }, {});

const REDIRECT_URI = [
    window.location.protocol,
    '//',
    window.location.host,
    window.location.pathname
].join('');

const LOGIN_URL =
    'https://accounts.spotify.com/authorize'
    + '?client_id=4889def045ee4f4785604263068e69e7'
    + '&response_type=token'
    + `&redirect_uri=${REDIRECT_URI}`
    + '&scope=user-modify-playback-state user-read-playback-state';

// Grab access token from url and put in local storage
const urlAccessToken = getHashQueryParams(window.location.hash).access_token;
if (urlAccessToken) {
    window.localStorage.setItem('accessToken', urlAccessToken);
    window.location.replace(REDIRECT_URI);
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            accessToken: null
        };
    }

    componentDidMount() {
        const accessToken = window.localStorage.getItem('accessToken');
        if (accessToken) {
            // Create a spotify client that has oauth headers pre-set
            window.spotify = axios.create({
                baseURL: 'https://api.spotify.com/v1',
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            this.setState({ accessToken });
        }
    }

    render() {
        return (
            this.state.accessToken
                ? <Player />
                : <a href={LOGIN_URL}>Login</a>
        );
    }
}

export default App;
