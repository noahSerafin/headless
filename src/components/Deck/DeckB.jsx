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
    var rate = 0.5 + (e.target.value / 100) * 1.5
    setPlaybackRate(rate);
    if(currentTrack){
      const ogBPM = currentTrack.songMeta.bpm
      setCurrentBPM((ogBPM * rate))//
    }
    if (playerRef.current) {
      playerRef.current.playbackRate = rate;  // Update the player's playback rate
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

    context.strokeStyle = '#007BFF'; // Set waveform color
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
      const player = playerRef.current
      console.log('cue at ', currentTimeRef.current)   
      if(isPlaying){ //playing.state == stopped/started
        setStartTime(Tone.now());
      } else {
        player.start(0, startTime)
        setIsPlaying(true)
      }
    }
    
  const restart = () => {
    const player = playerRef.current
    currentTimeRef.current = 0
    setStartTime(Tone.now());
    setDisplayTime(0)
    setIsPlaying(true)
    player.start(0)
  }

  // Tick function to update display time
  useEffect(() => {
    let interval;
    //console.log('record:', recordRef)
    //console.log('canvas:', canvasRef)
    if (isPlaying) {
      interval = setInterval(() => {
        // Update currentTimeRef while playing
        //currentTimeRef.current += 0.1; // Increment time for display (100 ms)
        const elapsedTime = currentTimeRef.current + calculateElapsedTime()
        setDisplayTime(elapsedTime)
        if(recordRef.current){
          const rotation = (elapsedTime)
          recordRef.current.style.transform = `rotate(${rotation*2}rad)`;
        }
        if(canvasRef.current){
          canvasRef.current.style.transform = `translateX(-${elapsedTime*pixelsPerSecond}px)`
        }
      }, 100); // Update every 100 ms
    }
    return () => {
      clearInterval(interval); // Clean up interval on unmount or when isPlaying changes
    };
  }, [isPlaying]); // Dependency on isPlaying


  //drag handlers
  /*interact('.drag-rotate').draggable({*/

  function getDragAngle(event) {
    var element = event.target;
    var startAngle = parseFloat(element.dataset.angle) || 0;
    var center = {
      x: parseFloat(element.dataset.centerX) || 0,
      y: parseFloat(element.dataset.centerY) || 0,
    };
    var angle = Math.atan2(center.y - event.clientY,
                           center.x - event.clientX);
  
    return angle - startAngle;
  }

  const startRotate =  function (event) {
    setActive(true)
    const element = event.target;
    const rect = element.getBoundingClientRect();

    // store the center as the element has css `transform-origin: center center`
    element.dataset.centerX = rect.left + rect.width / 2;
    element.dataset.centerY = rect.top + rect.height / 2;
    // get the angle of the element when the drag starts
    element.dataset.angle = getDragAngle(event);
  }
  const rotate = function (event) {
    if(active){

      var element = event.target;
      var center = {
        x: parseFloat(element.dataset.centerX) || 0,
        y: parseFloat(element.dataset.centerY) || 0,
      };

      var newAngle = getDragAngle(event);
      console.log(newAngle)
      
      // update transform style on dragmove
      //setStyle({{transform: rotate(' + angle + 'rad' + ')}};
      element.style.transform = 'rotate(' + newAngle + 'rad' + ')';
    }
  }
  const stopRotate = function (event) {
    //console.log(active)
    setActive(false)
    //const element = event.target;

    // save the angle on dragend
    //element.dataset.angle = getDragAngle(event);
  }

  return(
    <div className={`deck-container deck-${side}`} onDrop={handleDrop} onDragOver={handleDragOver}>
      <div className="playerinfo">
        <div className="waveform-container">
          <div className="waveform-bg"></div>
          <canvas className="waveform" ref={canvasRef} width="10000" height="40"></canvas>
          <div className="waveform-marker"></div>
        </div>
        {currentTrack && currentBPM ? <p>{currentBPM.toFixed(2)}-BPM</p> : ''}
        <p>DisplayTime: {displayTime}</p>
        <p>Ref: {currentTimeRef.current}</p>
      </div>
      <div className='deck'>
        <input className="vertical slider" type="range" min="0" max="100" onChange={handleSlider} value={((playbackRate - 0.5) / 1.5) * 100} orient="vertical" />
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
            <button className="playbtn" onClick={() => restart()}>Restart</button>
        </div>
      ) : (
        <p>no track selected</p> 
      )}
      </div>
    </div>
  )
}

export default Deck;