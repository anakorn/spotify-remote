import React from 'react';

const Player = ({
    onPrev,
    onNext,
    onScrubBack,
    onScrubForward,
    onLoadMarker,
    onSaveMarker,
    onDeleteMarker,
    markers,
}) => (
    <div>
        <div>
            <button onClick={onPrev}>
                {'|<'}
            </button>
            <button onClick={onScrubBack}>
                {'<<'}
            </button>
            <button onClick={onScrubForward}>
                {'>>'}
            </button>
            <button onClick={onNext}>
                {'>|'}
            </button>
        </div>
        <div>
            <button onClick={onSaveMarker}>
                Save
            </button>
            {Object.keys(markers).map((songUri) => (
                <div>
                    <p>{songUri}</p>
                    <ol>
                        {markers[songUri].map(marker => (
                            <li>
                                <button onClick={() => onLoadMarker(marker)}>Load</button>
                                <button onClick={() => onDeleteMarker(songUri, marker)}>X</button>
                                {marker}
                            </li>
                        ))}
                    </ol>
                </div>
            ))}
        </div>
    </div>
);

export default Player;
