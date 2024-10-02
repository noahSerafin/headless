import React, { useState } from "react";
import './Mixer.scss';
import Deck from "../Deck/DeckB";

const Mixer = () => {
  const [lLevel, setLLevel] = useState(0);
  const [rLevel, setRLevel] = useState(0);
  const [crossfade, setCrossfade] = useState(50);
  const [lAudio, setLAudio] = useState(0);
  const [rAudio, setRAudio] = useState(0);
  
  const calculateLevels = (left, right, fade) => {
    let leftAudio = left * 0.01;
    let rightAudio = right * 0.01;

    if (fade < 50) {
      rightAudio *= (fade / 50); // Scale right down as crossfade decreases
    } else if (fade > 50) {
      leftAudio *= ((100 - fade) / 50); // Scale left down as crossfade increases
    }

    const volumeToDecibels = (volumeValue) => {
        if (volumeValue === 0) return -60; // Handle mute case
        return 20 * Math.log10(volumeValue); // Convert to decibels
      };
    
    // Convert both left and right audio levels to decibels
    const leftAudioInDb = volumeToDecibels(leftAudio);
    const rightAudioInDb = volumeToDecibels(rightAudio);

    return { leftAudioInDb, rightAudioInDb };
  };

  const handleSlider = (slider, value) => {
    let newLLevel = lLevel;
    let newRLevel = rLevel;
    let newCrossfade = crossfade;

    if (slider === 'L') newLLevel = value;
    else if (slider === 'R') newRLevel = value;
    else if (slider === 'C') newCrossfade = value;

    // Update levels
    const { leftAudioInDb, rightAudioInDb } = calculateLevels(newLLevel, newRLevel, newCrossfade);

    setLLevel(newLLevel);
    setRLevel(newRLevel);
    setCrossfade(newCrossfade);
    setLAudio(leftAudioInDb)
    setRAudio(rightAudioInDb)

    //console.log(`Left: ${leftAudio}, Right: ${rightAudio}`);
    console.log(`Left: ${lAudio}, Right: ${rAudio}`);
  };

  return (
    <div className="decks">
        <Deck volume={lAudio}/>
        <div className="mixer">
            <div className="flex align-center">
                <input className="vertical slider" type="range" min="0" max="100" onChange={(e) => handleSlider("L", e.target.value)} value={lLevel} orient="vertical" />
                <input className="vertical slider" type="range" min="0" max="100" onChange={(e) => handleSlider("R", e.target.value)} value={rLevel} orient="vertical" />
            </div>
            <input type="range" min="0" max="100" onChange={(e) => handleSlider("C", e.target.value)} value={crossfade} className="slider" />
        </div>
        <Deck volume={rAudio}/>
    </div>
  );
};

export default Mixer;
