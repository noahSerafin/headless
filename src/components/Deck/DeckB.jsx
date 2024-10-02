import React, {useState, useRef, useEffect} from "react";
import './Deck.scss';
import * as Tone from 'tone';
import drone from '../../assets/drone.mp3';

//https://codepen.io/taye/pen/wrrxKb
//https://codepen.io/jsguy/pen/NWGapLB

const Deck = (audio) => {

  
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [angle, setAngle] = useState(0)
  const [active, setActive] = useState(false)//useState?
  const [style, setStyle] = useState({transform: 'rotate(0deg)'})
  const playerRef = useRef(null);
  
  const track = {
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

  const trackurl = track.songMeta.file.node.mediaItemUrl
  console.log('track:', trackurl)

  const buffer = new Tone.ToneAudioBuffer(trackurl, () => {
    console.log("loaded");
  });
  //console.log('buffer:', buffer)
  
  useEffect(() => {
    
    playerRef.current = new Tone.Player(drone).toDestination();
    console.log('player:', playerRef.current.state)

    return () => {
      // Clean up the player instance when the component unmounts
      playerRef.current.dispose();
    };
    //playerRef.current.volume.value = value;
    }, []);//url, value
    
    /*useEffect(() => {
      //isPlaying ? audio.play() : audioToPlay.pause();
    },[isPlaying]);*/

  /*interact('.drag-rotate')
  .draggable({*/
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


  const start =  function (event) {
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
      
      // update transform style on dragmove
      element.style.transform = 'rotate(' + angle + 'rad' + ')';
    }
  }
  const stop = function (event) {
    //console.log(active)
    setActive(false)
    //const element = event.target;

    // save the angle on dragend
    //element.dataset.angle = getDragAngle(event);
  }
  //})

  //let currentTime = 0;

  const playPause = () => {
    setIsPlaying((prevIsPlaying) => {

      const player = playerRef.current
      const elapsedTime = player.state === 'started' ? Tone.now() : currentTime;
      setCurrentTime(elapsedTime);
      console.log(player.state, player.toSeconds(player.now()), elapsedTime, currentTime)

      if (prevIsPlaying) {
        player.stop();
      } else {
        player.start(0, currentTime);
      }
      console.log(player.state, ' at ', currentTime, elapsedTime)
      return !prevIsPlaying;  // Toggle the value of isPlaying
    });
  };

  const Cue = () => {
    const player = playerRef.current
    console.log('cue at ', currentTime)   
    if(isPlaying){ //playing.state == stopped/started
      setCurrentTime(Tone.now());
    } else {
      player.start(0, currentTime)
      setIsPlaying(true)
    }
  }

  const restart = () => {
    setCurrentTime(0)
    const player = playerRef.current
    player.start
    //reset angle
  }

  return(
    <div className="deck-container">
    <div className='deck'> 
      <div id='container'> 
        <div id="rotate" onMouseDown={(e) => start(e)} onMouseMove={(e) => rotate(e)} onMouseUp={(e) => stop(e)} onMouseLeave={(e) => stop(e)} style={style} className={`active-${active}`}>
          <div id="drag"></div>
        </div>
      </div>
    </div>
    <button className="playbtn" onClick={() => Cue()}>Cue</button>
    <button className="playbtn" onClick={() => playPause()}>PlayPause</button>
    <button className="playbtn" onClick={() => restart()}>Restart</button>
    </div>
  )
}

export default Deck;