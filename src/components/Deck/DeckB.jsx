import React, {useState, useRef, useEffect} from "react";
import './Deck.scss';
import * as Tone from 'tone';
import drone from '../../assets/drone.mp3';
import AudioPlayer from "../AudioPlayer/AudioPlayer";

//https://codepen.io/taye/pen/wrrxKb
//https://codepen.io/jsguy/pen/NWGapLB

const Deck = (audio) => {
  
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const currentTimeRef = useRef(0)
  const [displayTime, setDisplayTime] = useState(currentTimeRef.current)
  const [isLoaded, setIsLoaded] = useState(false)
  const [angle, setAngle] = useState(0)
  const [active, setActive] = useState(false)//useState?
  const [style, setStyle] = useState({transform: 'rotate(0deg)'})

  const handleDrop = (e) => {
    e.preventDefault();
    const trackData = e.dataTransfer.getData('track');
    if(trackData) {
      const track = JSON.parse(trackData);
      setCurrentTrack(track)
      console.log(currentTrack)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow drop
  };

  const calculateElapsedTime = () => {
    return currentTimeRef.current + (Tone.now() - startTime); // Actual time passed
  };
  
  //audio methods
  const [startTime, setStartTime] = useState(0)
  const playerRef = useRef(null);

    const dummyTrack = {
        "__typename": "Song",
        "id": "cG9zdDoxOA==",
        "title": "Drone",
        "content": "<p>Visual noise generation</p>\n",
        "songMeta": {
          "__typename": "SongMeta",
          "artist": "Seraf",
          "coverArt": {
            "__typename": "AcfMediaItemConnectionEdge",
            "node": {
              "__typename": "MediaItem",
              "sourceUrl": "http://localhost/wp-headless/server/wp-content/uploads/2024/09/Screenshot-2024-04-30-202244.png"
            }
          },
          "file": {
            "__typename": "AcfMediaItemConnectionEdge",
            "node": {
              "__typename": "MediaItem",
              "mediaItemUrl": "http://localhost/wp-headless/server/wp-content/uploads/2024/09/drone.mp3"
            }
          },
          "bpm": 130
        }
    }
    
    const trackurl = dummyTrack.songMeta.file.node.mediaItemUrl
    //console.log('track:', trackurl)
      
    useEffect(() => {
      if(currentTrack){
        playerRef.current = new Tone.Player({
          url: currentTrack.songMeta.file.node.mediaItemUrl,
          autostart: false,
        }).toDestination();
        console.log('player:', playerRef.current.state)
      } //playerRef.current.volume.value = value;
    
        return () => {
          // Clean up the player instance when the component unmounts
          if(playerRef.current){
            playerRef.current.dispose();
          }
        };
    }, [currentTrack]);//url, value

    const playPause = () => {
        setIsPlaying((prevIsPlaying) => {
          const player = playerRef.current
          if (prevIsPlaying) {
            const elapsedTime = calculateElapsedTime()
            currentTimeRef.current = elapsedTime;
            player.stop();
          } else {
            player.start(0, currentTimeRef.current);
            setStartTime(Tone.now());
          }
          console.log(player.state, ' at ', currentTimeRef.current)
    
          return !prevIsPlaying;
        });
    };
    
    const Cue = () => {
        const player = playerRef.current
        console.log('cue at ', currentTimeRef.current)   
        if(isPlaying){ //playing.state == stopped/started
          currentTimeRef.current = Tone.now();
        } else {
          player.start(0, currentTimeRef.current)
          setIsPlaying(true)
        }
    }
    
    const restart = () => {
        const player = playerRef.current
        setStartTime(Tone.now());
        currentTimeRef.current = 0
        setIsPlaying(true)
        player.start(0)
        //reset angle
    }

  // Tick function to update display time
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        // Update currentTimeRef while playing
        currentTimeRef.current += 0.1; // Increment time for display (100 ms)
        setDisplayTime(currentTimeRef.current)
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
      var angle = getDragAngle(event);
      console.log(angle)
      
      // update transform style on dragmove
      element.style.transform = 'rotate(' + angle + 'rad' + ')';
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
    <div className="deck-container" onDrop={handleDrop} onDragOver={handleDragOver}>
      <div className='deck'> 
        <div id='container'> 
          <div id="rotate" onMouseDown={(e) => startRotate(e)} onMouseMove={(e) => rotate(e)} onMouseUp={(e) => stopRotate(e)} onMouseLeave={(e) => stopRotate(e)} style={style} className={`active-${active}`}>
            <div id="drag"></div>
          </div>
        </div>
      </div>
      {currentTrack ? (
      <div className="audioplayer">
        <div className="flex">
            <button className="playbtn" onClick={() => Cue()}>Cue</button>
            <button className="playbtn" onClick={playPause}>{isPlaying ? 'Pause' : 'Play'}</button>
            <button className="playbtn" onClick={() => restart()}>Restart</button>
        </div>
        <div>DisplayTime: {displayTime}</div>
        <div>Ref: {currentTimeRef.current}</div>
      </div>
      ) : (
      <p>no track selected</p> 
      )}
    </div>
  )
}

export default Deck;