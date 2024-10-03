import {React, useRef, useState} from "react";
import Track from "../Track/Track";
import './Tracklist.scss';
import { useQuery, gql } from '@apollo/client'
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css"
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

const GET_SONGS = gql`
    query GetSongs {
      songs{
        edges{
          node{
            id,
            title,
            content,
            songMeta{
              artist,
              coverArt{
                node{
                  sourceUrl
                }
              }
              file{
                node{
                  mediaItemUrl
                }
              }
              bpm
            }
          }
        }
      }
    }
    `
const TrackList = (props) => {
  const {dockside} = props;

  const width = useRef(window.innerWidth)
  const spv = width.current/100
  //console.log("wspv", width, spv)

  const { loading, error, data } = useQuery(GET_SONGS);

  if (loading) return <p>Loading...</p>;

  if (error) return <p>Error : {error.message}</p>;

  if (!data || !data.songs || !data.songs.edges) {
    return <p>No songs available</p>;
  }

  //const [song, setSong] = useState('');
  //console.log('edges:', data.songs.edges)
  const direction = dockside ? 'vertical' : 'horizontal';
  
  return (
    <div className={"tracklist dockside-"+dockside}>
      <Swiper
      direction={direction}
      allowTouchMove={false}
      slidesPerView={6}
      loop={true}
      navigation={true}
      modules={[Navigation]}
      >
        {data.songs.edges.map(({ node }) => (
          <SwiperSlide key={node.id}>
            <Track node={node} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default TrackList;