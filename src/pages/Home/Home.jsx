import React, { useState } from "react";
import TrackList from "../../components/TrackList/TrackList";
import Deck from "../../components/Deck/DeckB";
import Mixer from "../../components/Mixer/Mixer";
import './Home.scss';

const Home = (props) => {

    const [dockside, setDockside] = useState(false)
    /*
    if scrennWidth < 480 {
        setDockside(false)
    }
        */
 
    return(
        <div className="homepage-container">    
            <div className={"mixer-tracklist w-100 h-100 trackstoside-"+dockside}>
                <h1 className="main-title">HEADLESS</h1>
                <Mixer />
                <TrackList dockside={dockside}/>
                <button className='dock-button' onClick={() => {setDockside(!dockside)}}>Dock Side</button>
            </div>        
        </div>
    )
}

export default Home;