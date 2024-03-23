import React from 'react';
import 'rc-slider/assets/index.css';
import { groupBy, path } from 'ramda';
import './Player.css';
import Slider, { createSliderWithTooltip } from 'rc-slider';

const Range = createSliderWithTooltip(Slider.Range);

const groupBySongUri = groupBy(path(['song', 'uri']));

const Player = ({
    isLoggedIn,
    loginUrl,
    onAddClip,
    onDeleteClip,
    onPlayClip,
    onScrubBack,
    onScrubForward,
    onEditClipStart,
    onEditClipEnd,
    clips,
}) => {
    if (!isLoggedIn) {
        return (
            <a href={loginUrl}>Connect to Spotify</a>
        );
    }
    const clipsBySongUri = groupBySongUri(clips);
    return (
        <div className="grid-container p-2">
            <div className="p-4 flex justify-center">
                <button onClick={onAddClip}>
                    {'CLIP'}
                </button>
            </div>
            
            <div className="playlist rounded-lg shadow-inner-deep px-4 py-6">
                {Object.keys(clipsBySongUri).map(songUri => (
                    <div key={songUri}>
                        <h4>{songUri}</h4>
                        <ol>
                            {clipsBySongUri[songUri].map(({ song, clip, id }) => (
                                <li className="px-4 py-4" key={id}>
                                    <span>
                                        {`${clip.start} - ${clip.end}`}
                                    </span>
                                    <button onClick={() => onPlayClip(id)}>
                                        {'▶️'}
                                    </button>
                                    <button onClick={() => onDeleteClip(id)}>
                                        {'X'}
                                    </button>
                                    <Range
                                        defaultValue={[clip.start, clip.end]}
                                        min={0}
                                        max={song.durationMs}
                                        onAfterChange={([start, end]) => {
                                            onEditClipStart(id, parseInt(start, 10));
                                            onEditClipEnd(id, parseInt(end, 10));
                                        }}
                                    />
                                </li>
                            ))}
                        </ol>
                    </div>
                ))}
            </div>
        </div>
    )
};

export default Player;
