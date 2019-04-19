import React from 'react';
import Player from '../components/Player';

const withPlayer = (Component) => class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            markers: {}
        };
    }

    componentDidMount() {
        this.setState({
            // Read existing markers from storage
            markers: JSON.parse(window.localStorage.getItem('markers')) || {}
        });
    }

    async saveMarker() {
        const { progress_ms, item } = await this.getCurrentTrack();
        const markers = {
            ...this.state.markers,
            // Store current track progress
            [item.uri]: (this.state.markers[item.uri] || []).concat(progress_ms)
        };
        this.setState({ markers });
        window.localStorage.setItem('markers', JSON.stringify(markers));
    }

    deleteMarker(songUri, marker) {
        this.setState({
            markers: {
                ...this.state.markers,
                [songUri]: this.state.markers[songUri].filter(_marker => _marker !== marker)
            }
        });
    }

    async getCurrentTrack() {
        return (await window.spotify.get('/me/player/currently-playing')).data;
    }

    async prev() {
        const progressMs = (await this.getCurrentTrack()).progress_ms;
        if (progressMs < 2500) {
            return window.spotify.post('/me/player/previous');
        }
        return this.seek(0);
    }

    async next() {
        return window.spotify.post('/me/player/next');
    }

    async seek(positionMs) {
        return (await window.spotify.put(`/me/player/seek?position_ms=${positionMs}`)).data;
    }

    async scrub(amountMs) {
        const progressMs = (await this.getCurrentTrack()).progress_ms;
        return this.seek(progressMs + amountMs);
    }

    render() {
        return (
            <Player
                onPrev={() => this.prev()}
                onNext={() => this.next()}
                onScrubBack={() => this.scrub(-5000)}
                onScrubForward={() => this.scrub(5000)}
                onLoadMarker={(progressMs) => this.seek(progressMs)}
                onSaveMarker={() => this.saveMarker()}
                onDeleteMarker={(uri, marker) => this.deleteMarker(uri, marker)}
                markers={this.state.markers}
            />
        );
    }
};

export default withPlayer(Player);
