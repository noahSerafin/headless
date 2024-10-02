import React, { useState } from "react";
import './Mixer.scss';

const Mixer = (audioL, audioR) => {

    const [lLevel, setLLevel] = useState(0)
    const [rLevel, setRLevel] = useState(0)
    const [crossfade, setCrossfade] = useState(50)

    const handleSlider = (slider, event) => {
        
        if(slider === 'L'){
            setLLevel(event.target.value)
        } else if(slider === 'R'){
                setRLevel(event.target.value)
        } else if(slider === 'C'){
                setCrossfade(event.target.value)
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