import React, {useState, useRef, useEffect} from "react";
import './Deck.scss';
import * as Tone from 'tone';
import play from '../../assets/play.svg'
import pause from '../../assets/pause.svg'

//https://codepen.io/taye/pen/wrrxKb
//https://codepen.io/jsguy/pen/NWGapLB

const Deck = (props) => {

  const {side, volume} = props;
  
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const currentTimeRef = useRef(0)
  const [displayTime, setDisplayTime] = useState(currentTimeRef.current)
  const canvasRef = useRef(null); 
  const recordRef = useRef(null); 
  const [isLoaded, setIsLoaded] = useState(false)
  const [angle, setAngle] = useState(0)
  const [active, setActive] = useState(false)//useState?
  const [style, setStyle] = useState({transform: 'rotate(0deg)'})
  const [startTime, setStartTime] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [currentBPM, setCurrentBPM] = useState(null)
  const playerRef = useRef(null);

  const handleSlider = (e) => {
    e.preventDefault();
    var rate = e.target.value / 100;
    setPlaybackRate(rate);
    if(currentTrack){
      const ogBPM = currentTrack.songMeta.bpm
      setCurrentBPM((ogBPM * rate))//
    }
    if (playerRef.current) {
      playerRef.current.playbackRate = rate;  // Update the player's playback rate
    }
    console.log(e.target.value, rate)
  }

  const inputBPM = (e) => {
    if(currentTrack){
      const ogBPM = currentTrack.songMeta.bpm
      var newBPM = Number(e.target.value)
      setCurrentBPM(newBPM)
      const newPlaybackRate = newBPM / ogBPM
      if (playerRef.current && newPlaybackRate <= 1.5 && newPlaybackRate >= 0.5) {
        playerRef.current.playbackRate = newPlaybackRate; // Update player's playback rate
      }
    }
  }

  const handleDrop = (e) => {
    e.preventDefault();
    const trackData = e.dataTransfer.getData('track');
    if(trackData) {
      const track = JSON.parse(trackData);
      setCurrentTrack(track)
      console.log('currentTrack:', currentTrack)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow drop
  };

  const calculateElapsedTime = () => {
    return (Tone.now() - startTime); // Actual time passed
    //return currentTimeRef.current + (Tone.now() - startTime); // Actual time passed
  };

  //waveform
  // Choose pixels per second for scaling the waveform horizontally
  const pixelsPerSecond = 75;

  const drawBufferWaveform = (buffer) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const data = buffer.getChannelData(0); // Get audio data for one channel (usually left channel)

    context.clearRect(0, 0, width, height); // Clear canvas
    context.beginPath();

    const step = Math.ceil(data.length / width); // Sample the audio data to fit within the canvas width
    const amp = height / 2; // Amplitude to scale the waveform vertically

    // Loop through the entire buffer and draw the waveform
    for (let i = 0; i < width; i++) {
      const min = data[i * step] * amp; // Scale each sample to fit in canvas height
      context.lineTo(i, amp + min); // Draw the waveform, centered vertically
    }

    context.strokeStyle = 'orange'; // Set waveform color
    context.lineWidth = 2; // Set line width
    context.stroke(); // Apply the drawing
  };
  
  //audio methods
  //load player    
  useEffect(() => {
    if(currentTrack){
      //console.log('currentUrl:', currentTrack.songMeta.file.node.mediaItemUrl)
      if (playerRef.current){
        playerRef.current.dispose();
      }
      currentTimeRef.current = 0
      setDisplayTime(0)
      setIsLoaded(false)
      setIsPlaying(false)

      playerRef.current = new Tone.Player({
        url: currentTrack.songMeta.file.node.mediaItemUrl,
        autostart: false,
        volume: volume,
        playbackRate: playbackRate,
        onload: () => {
          console.log('Track loaded');
          setPlaybackRate(1)
          setCurrentBPM(currentTrack.songMeta.bpm)
          // Create waveform analyzer
          const duration = playerRef.current.buffer.duration;
          canvasRef.current.width = duration * pixelsPerSecond;
          drawBufferWaveform(playerRef.current.buffer.get());
          setIsLoaded(true); // Set isLoaded to true once the track is fully loaded
        },
        onstop: () => {
          setIsPlaying(false);
        },
        onerror: (error) => {
          console.error('Error loading track:', error);
          setIsLoaded(false);
        }
      }).toDestination();
      console.log('player:', playerRef.current.state)
    }
    
    return () => {
        // Clean up the player instance when the component unmounts
      if(playerRef.current){
        playerRef.current.dispose();
      }
    };
  }, [currentTrack]);

  //adjust volume
  useEffect(() => {
    if (playerRef.current) {
      // Update the player volume when the volume prop changes
      playerRef.current.volume.value = volume;
      console.log('Volume updated:', volume);
    }
  }, [volume]); 

  const playPause = () => {
    if(playerRef.current.loaded){
      setIsPlaying((prevIsPlaying) => {
        console.log(playerRef.current.loaded)
        const player = playerRef.current
        if (prevIsPlaying) {
          const elapsedTime = calculateElapsedTime()
          currentTimeRef.current += elapsedTime;
          playerRef.current.stop();
        } else {
          playerRef.current.start(0, currentTimeRef.current);
          setStartTime(Tone.now());
        }
        console.log(player.state, ' at ', currentTimeRef.current)
      
        return !prevIsPlaying;
      });
    }
  };
    
  const Cue = () => {
    if(playerRef.current){
      setIsPlaying(false)
      currentTimeRef.current = 0
      setStartTime(0);
      setDisplayTime(0)
      setIsPlaying(true)
      canvasRef.current.style.transform = `translateX(0px)`
      //canvasRef.current.style.transform = `translateX(${startTime*pixelsPerSecond}}px)`
      playerRef.current.start(0)
    }
  }
    
  const restart = () => {
    if(playerRef.current){
      currentTimeRef.current = 0
      setStartTime(0);
      setDisplayTime(0)
      setIsPlaying(false)
      canvasRef.current.style.transform = `translateX(0px)`
      playerRef.current.stop()
    }
  }

  // Tick function to update display time
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        const elapsedTime = currentTimeRef.current + calculateElapsedTime()
        setDisplayTime(elapsedTime)
        if(recordRef.current){
          const rotation = (elapsedTime)
          recordRef.current.style.transform = `rotate(${rotation*2}rad)`;
        }
        if(canvasRef.current){
          canvasRef.current.style.transform = `translateX(-${elapsedTime*pixelsPerSecond*playbackRate}px)`
        }
      }, 100); // Update every 100 ms
    }
    return () => {
      clearInterval(interval); // Clean up interval on unmount or when isPlaying changes
    };
  }, [isPlaying]); // Dependency on isPlaying

  return(
    <div className={`deck-container deck-${side}`} onDrop={handleDrop} onDragOver={handleDragOver}>
      <div className="playerinfo">
        {currentTrack ? <h3 className="deck__title">{currentTrack.songMeta.artist} - {currentTrack.title}</h3> : ''}
        <div className="waveform-container">
          <div className="waveform-bg"></div>
          <canvas className="waveform" ref={canvasRef} width="10000" height="40"></canvas>
          <div className="waveform-marker"></div>
        </div>
        {currentTrack && currentBPM ? 
        <div className="bpm-controls">
          <input className='bpm-input' id="bpmInput" type="number" value={currentBPM} onChange={inputBPM} placeholder="BPM"/>
        </div>
        : ''}
      </div>
      <div className='deck'>
        <input className="vertical slider" type="range" min="50" max="150" onChange={handleSlider} value={playbackRate * 100} orient="vertical" />
        <div id='container'> 
          <div ref={recordRef} id="rotate" onMouseDown={(e) => startRotate(e)} onMouseMove={(e) => rotate(e)} onMouseUp={(e) => stopRotate(e)} onMouseLeave={(e) => stopRotate(e)} className={`active-${active}`}>
            <div id="drag">
              {currentTrack ? <img className="deck__img" alt="cover" src={currentTrack.songMeta.coverArt.node.sourceUrl} /> : ''}
            </div>
          </div>
        </div>
      </div>
      <div className='audioplayer'>
      {currentTrack ? (
        <div className={"flex playerbuttons-"+isLoaded}>
            <button className="playbtn" onClick={() => Cue()}>Cue</button>
            <button className="playbtn" onClick={playPause}>
              <img src={isPlaying ? pause : play } alt= {isPlaying ? 'pause' : 'play' }/>
            </button>
            <button className="playbtn" onClick={() => restart()}>
              <span></span>
            </button>
        </div>
      ) : (
        <p>no track selected</p> 
      )}
      </div>
    </div>
  )
}

export default Deck;
/*
<p>DisplayTime: {displayTime}</p>
<p>Ref: {currentTimeRef.current}</p>
*/