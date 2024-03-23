import React, { useReducer, useEffect } from 'react';
import Player from '../components/Player';
import uuidv1 from 'uuid/v1';
import * as R from 'ramda';

const DEFAULT_CLIP_DURATION_MS = 5000;
const DEFAULT_SCRUB_DELTA_MS = 5000;

const initialState = {
    clips: [],
    activeClip: {}
};

// TODO: split reducers once this becomes too unwieldy
const reducer = (state, action) => {
    console.info(`[REDUCER] State:`);
    console.info(state);
    switch (action.type) {
        case 'CLIP_ADD':
            console.info(`[REDUCER] CLIP_ADD: ${JSON.stringify(action)}`);
            let newState = {
                ...state,
                clips: [
                    ...state.clips,
                    {
                        id: uuidv1(),
                        song: action.song,
                        clip: action.clip,
                    }
                ]
            };
            localStorage.setItem('state', JSON.stringify(newState));
            return newState;
        case 'CLIP_DELETE':
            console.info(`[REDUCER] CLIP_DELETE: ${JSON.stringify(action)}`);
            if (state.activeClip.id === action.clipId) {
                window.clearInterval(state.activeClip.intervalId);
            }
            newState = {
                ...state,
                clips: state.clips.filter(clip => clip.id !== action.clipId)
            }
            localStorage.setItem('state', JSON.stringify(newState));
            return newState;
        case 'CLIP_PLAY':
            console.info(`[REDUCER] CLIP_PLAY: ${JSON.stringify(action)}`);
            let { song, clip } = state.clips.find(clip => clip.id === action.clipId);
            window.clearInterval(state.activeClip.intervalId);
            return {
                ...state,
                activeClip: {
                    id: action.clipId,
                    intervalId: loop(song.uri, clip.start, clip.end)
                }
            };
        case 'CLIP_EDIT_START':
            console.info(`[REDUCER] CLIP_EDIT_START: ${JSON.stringify(action)}`);
            newState = {
                ...state,
                clips: updateClip(
                    action.clipId,
                    clip => ({ ...clip, start: action.start }),
                    state.clips
                )
            };
            localStorage.setItem('state', JSON.stringify(newState));
            return newState;
        case 'CLIP_EDIT_END':
            console.info(`[REDUCER] CLIP_EDIT_END: ${JSON.stringify(action)}`);
            newState = {
                ...state,
                clips: updateClip(
                    action.clipId,
                    clip => ({ ...clip, end: action.end }),
                    state.clips
                )
            };
            localStorage.setItem('state', JSON.stringify(newState));
            return newState;
        case 'STATE_LOAD':
            return action.state;
        default:
            throw new Error();
    }
};

const updateClip = (id, update, clips) => {
    let clipIdx = R.findIndex(R.propEq('id', id), clips);
    let clipData = clips[clipIdx];
    return R.update(clipIdx, {
        ...clipData,
        clip: update(clipData.clip)
    }, clips);
};

const loop = (songUri, start, end) => {
    const intervalMs = end - start;
    // TODO some race condition bug here where playing a clip while another
    // clip is playing will cause both to overlap and play on top of each other
    seek(songUri, start);
    return window.setInterval(() => console.log(`playing ${songUri} start ${start} end ${end}`) || seek(songUri, start, end), intervalMs);
};

const seek = async (songUri, positionMs) => {
    await playSong(songUri, positionMs);
    return (await window.spotify.put(`/me/player/seek?position_ms=${positionMs}`)).data;
};

const seekDelta = async (delta) => {
    const [item, progress_ms] = await getCurrentSong();
    return seek(item.uri, progress_ms + delta);
};

const playSong = async (songUri, positionMs = 0) => {
    return window.spotify.put(`/me/player/play`, { uris: [songUri], position_ms: positionMs });
};

const getCurrentSong = async () => {
    const res = (await window.spotify.get(`/me/player/currently-playing`)).data;
    return [res.item, res.progress_ms];
};

const PlayerContainer = ({
    isLoggedIn,
    loginUrl
}) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        const loadedState = JSON.parse(localStorage.getItem('state'));
        dispatch({ type: 'STATE_LOAD', state: loadedState || initialState });
    });

    return (
        <Player
            isLoggedIn={isLoggedIn}
            loginUrl={loginUrl}
            onAddClip={async () => {
                const [item, progressMs] = await getCurrentSong();
                dispatch({
                    type: 'CLIP_ADD',
                    song: {
                        uri: item.uri,
                        durationMs: item.duration_ms
                    },
                    clip: {
                        start: progressMs,
                        end: progressMs + DEFAULT_CLIP_DURATION_MS
                    }
                });
            }}
            onDeleteClip={(clipId) => dispatch({ type: 'CLIP_DELETE', clipId })}
            onPlayClip={(clipId) => dispatch({ type: 'CLIP_PLAY', clipId })}
            onScrubBack={() => seekDelta(-DEFAULT_SCRUB_DELTA_MS)}
            onScrubForward={() => seekDelta(DEFAULT_SCRUB_DELTA_MS)}
            onEditClipStart={(clipId, start) => dispatch({ type: 'CLIP_EDIT_START', clipId, start })}
            onEditClipEnd={(clipId, end) => dispatch({ type: 'CLIP_EDIT_END', clipId, end })}
            clips={state.clips}
        />
    );
};

export default PlayerContainer;
