import React, {useState, useRef, useEffect} from "react";
import * as Tone from 'tone';
import drone from '../../assets/drone.mp3';

const AudioPlayer = ({ isPlaying, setIsPlaying, currentTimeRef }) => {

    const [startTime, setStartTime] = useState(0)
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

    const playPause = () => {
        setIsPlaying((prevIsPlaying) => {
          const player = playerRef.current
    
          if (prevIsPlaying) {
            const elapsedTime = Tone.now() - startTime;
            currentTimeRef.current += elapsedTime;
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
        player.start(0)
        setStartTime(Tone.now());
        currentTimeRef.current = 0
        //reset angle
    }

    return(
        <div className="audioplayer">
            <div className="flex">
                <button className="playbtn" onClick={() => Cue()}>Cue</button>
                <button className="playbtn" onClick={playPause}>{isPlaying ? 'Pause' : 'Play'}</button>
                <button className="playbtn" onClick={() => restart()}>Restart</button>
            </div>
            <span>{currentTimeRef.current}</span>
        </div>
    )
}

export default AudioPlayer;