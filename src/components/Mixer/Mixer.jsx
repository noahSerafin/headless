import React, { useState } from "react";
import './Mixer.scss';

const Mixer = (audioL, audioR) => {

    const [lLevel, setLLevel] = useState(0)
    const [rLevel, setRLevel] = useState(0)
    const [crossfade, setCrossfade] = useState(50)
    const [audioLLevel, setAudioLLevel] = useState(0)
    const [audioRLevel, setAudioRLevel] = useState(0)


   const updateAudioLevels = (leftSliderValue, rightSliderValue, crossfadeValue) => {
        // Convert the left and right slider values to a range of 0-1
        let leftAudio = lLevel * 0.01;
        let rightAudio = rLevel * 0.01;
      
        // Handle crossfade logic
        if (crossfade < 50) {
          // Crossfade under 50: diminish right audio, left stays unaffected
          rightAudio = rightAudio * (crossfadeValue / 50); // scale down right audio towards 0
        } else if (crossfade > 50) {
          // Crossfade over 50: diminish left audio, right stays unaffected
          leftAudio = leftAudio * ((100 - crossfadeValue) / 50); // scale down left audio towards 0
        }
        // If crossfade is exactly 50, both sides remain unaffected
        setAudioLLevel(leftAudio)
        setAudioRLevel(rightAudio)
        console.log(leftAudio, rightAudio);
    }      

    const handleSlider = (slider, event) => {  

        console.log(slider, event.target.value, 'c', crossfade)   
        if(slider === 'L'){
            setLLevel(event.target.value)
            updateAudioLevels(event.target.value, rLevel, crossfade)
        } else if(slider==='R'){
            setRLevel(event.target.value)
            updateAudioLevels(lLevel, event.target.value, crossfade)
        } else if(slider === 'C'){
            setCrossfade(event.target.value)
            updateAudioLevels(lLevel, rLevel, event.target.value)
        }
    }

    return(
        <div className='mixer'> 
          <div className="flex align-center"> 
          <input className="vertical slider" type="range" min="0" max="100" onChange={(e) => handleSlider('L', e)} value={lLevel} id="myRange" orient="vertical"></input>
          <input className="vertical slider" type="range" min="0" max="100" onChange={(e) => handleSlider('R', e)}value={rLevel} id="myRange" orient="vertical"></input>
          </div>
          <input type="range" min="0" max="100" onChange={(e) => handleSlider('C', e)} value={crossfade} className="slider" id="myRange"></input>
        </div>
    )
}

export default Mixer;