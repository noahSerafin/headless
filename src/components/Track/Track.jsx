import React from "react";
import './Track.scss';

/*
Inside the src/react-app-env.d.ts add this:

/// <reference types="react-scripts" />
declare module '*.mp3';
*/

//import chill from '../../assets/chill1.mp3'
//import requestal from '../../assets/requestal3.mp3'
//import softi from '../../assets/Softi.mp3'

const Track = (props) => {
  const {key, node} = props;
  console.log('node:', node)
  //const list = [chill, requestal, softi]

  const trackData = node;

  const handleDragStart = (e) => {
    // Set the track data as JSON in the dataTransfer object
    e.dataTransfer.setData('track', JSON.stringify(trackData));
  };

  return(
    <div className="track" draggable onDragStart={(e) =>handleDragStart(e)} key={key} file={node.songMeta.file.node.mediaItemUrl}>
      <h3 className="track__title">{node.songMeta.artist} - {node.title}</h3>
      <p className="track__bpm">{node.songMeta.bpm}bpm</p>
      <br />
      <div className="track__description">
        <b>About this song:</b>
        <div>{node.content}</div>
      </div>
      <img className="track__img" alt="cover" src={node.songMeta.coverArt.node.sourceUrl} />
    </div>
  )
}

export default Track;