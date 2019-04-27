import React from 'react';
import { groupBy, prop } from 'ramda';
import './Player.css';

const groupBySongUri = groupBy(prop('songUri'));

const Player = ({
    onAddClip,
    onPlayClip,
    clips,
}) => {
    const clipsBySongUri = groupBySongUri(clips);
    return (
        <div className="grid-container p-2">
            <div className="p-4 flex justify-center">
                <button onClick={() => onAddClip(15000)}>
                    {'🎬'}
                </button>
            </div>
            <div className="playlist p-4">
                {Object.keys(clipsBySongUri).map(songUri => (
                    <div key={songUri}>
                        <h4>{songUri}</h4>
                        <ol>
                            {clipsBySongUri[songUri].map(({ clip, id }) => (
                                <li key={id}>
                                    <span>
                                        {`${clip.start} - ${clip.end}`}
                                    </span>
                                    <button onClick={() => onPlayClip(id)}>
                                        {'▶️'}
                                    </button>
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
