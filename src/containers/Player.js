import React, { useReducer } from 'react';
import Player from '../components/Player';

const initialClips = [];

const clipsReducer = (clips, action) => {
    console.info(`[REDUCER] State:`);
    console.info(clips);
    switch (action.type) {
        case 'CLIP_ADD':
            console.info(`[REDUCER] CLIP_ADD: ${JSON.stringify(action)}`);
            return [
                ...clips,
                {
                    id: 'foo',
                    songUri: action.songUri,
                    clip: action.clip,
                }
            ];
        case 'CLIP_DELETE':
            console.info(`[REDUCER] CLIP_DELETE: ${JSON.stringify(action)}`);
            return clips.filter(clip => clip.id !== action.clipId);
        case 'CLIP_PLAY':
            console.info(`[REDUCER] CLIP_PLAY: ${JSON.stringify(action)}`);
            const { songUri, clip } = clips.find(clip => clip.id === action.clipId);
            loop(songUri, clip.start, clip.end);
            return clips;
        default:
            throw new Error();
    }
};

const setTimeoutP = waitMs => new Promise((resolve, reject) => setTimeout(() => resolve(), waitMs));

const loop = async (songUri, start, end) => new Promise(async (resolve, reject) => {
    const waitMs = end - start;
    await seek(songUri, start);
    await setTimeoutP(waitMs);
    return await loop(songUri, start, end);
});

const seek = async (songUri, positionMs) => {
    await playSong(songUri, positionMs);
    return (await window.spotify.put(`/me/player/seek?position_ms=${positionMs}`)).data;
};

const playSong = async (songUri, positionMs = 0) => {
    return await window.spotify.put(`/me/player/play`, { uris: [songUri], position_ms: positionMs });
};

const getCurrentSong = async () => {
    const res = (await window.spotify.get(`/me/player/currently-playing`)).data;
    return [res.item.uri, res.progress_ms];
};

const PlayerContainer = () => {
    const [clips, dispatch] = useReducer(clipsReducer, initialClips);
    return (
        <Player
            onAddClip={async (duration) => {
                const [songUri, progressMs] = await getCurrentSong();
                dispatch({
                    type: 'CLIP_ADD',
                    songUri,
                    clip: {
                        start: progressMs,
                        end: progressMs + duration
                    }
                });
            }}
            onPlayClip={(clipId) => dispatch({ type: 'CLIP_PLAY', clipId })}
            clips={clips}
        />
    );
};

export default PlayerContainer;
