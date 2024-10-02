import React, {useState, useRef, useEffect} from "react";
import './Deck.scss';
//https://codepen.io/taye/pen/wrrxKb
//https://codepen.io/jsguy/pen/NWGapLB

const Deck = (audio, isPlaying) => {

  const ref = useRef(null)

  const [style, setStyle] = useState({transform: 'rotate(0deg)'})
  const [active, setActive] = useState(false)//useState?
  
  //(function() {//rotate
  var init, start, stop,
  angle = 0,
  rotation = 0,//useState?
  startAngle = 0,
  center = {
    x: 0,
    y: 0
  },
  R2D = 180 / Math.PI,
  //rot = document.getElementById('rotate');//clickable
  
  start = function(e) {
      e.preventDefault();
      var bb = ref.current.getBoundingClientRect()
      var t = bb.top;
      var l = bb.left;
      var h = bb.height;
      var w = bb.width;
      var x, y;
      var center = {
        x: l + (w / 2),
        y: t + (h / 2)
      };
      var x = e.clientX - center.x;
      var y = e.clientY - center.y;
      var startAngle = R2D * Math.atan2(y, x);
      //console.log(t, l, h, w)
      setActive(true);
  };
  
  const rotate = (e) => {
    console.log(active)
    if(active){
      e.preventDefault();
      var x = e.clientX - center.x;
      var y = e.clientY - center.y;
      var d = R2D * Math.atan2(y, x);
      rotation = d - startAngle;
      setStyle({transform: `rotate(${(angle + rotation)}deg)`});
    }
  };
    
  stop = function() {
    angle += rotation;
    setActive(false);
  };

  useEffect(() => {   
  
    //const rect = ref.current.getBoundingClientRect();
    //console.log('Element dimensions and position:', rect);
    //myElementRef.current.removeEventListener('mousedown', handleMouseDown);
  }, [])

  return(
    <div className='deck'> 
      <div id='container'> 
        <div id="rotate" ref={ref} onMouseDown={(e) => start(e)} onMouseMove={(e) => rotate(e)} onMouseUp={(e) => stop()} style={style}>
          <div id="drag"></div>
        </div>
      </div>
    </div>
  )
}

export default Deck;