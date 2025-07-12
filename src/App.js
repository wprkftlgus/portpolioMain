import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [position, setPosition] = useState({x:0, y:0});
  useEffect(() => {
    const moveHandler = (e) => {
      setPosition({x:e.clientX, y:e.clientY})
    };
    window.addEventListener('mousemove', moveHandler);
    return() => window.removeEventListener('mousemove', moveHandler);
  },[]);

  return (
    <div className='App'>
     <div className='Neon' style={{left: position.x, top: position.y}}></div>
     <div className='Section1'>  
      <div className='Top-box'><img className='Logo' src='\icon.png' />
      
      <div className='Top-tag1'>About</div>
      <div className='Top-tag2'>Project</div>
      <div className='Top-tag3'>Contact</div>
      
      </div>

    <div className='Title'>All-in-one Developer</div>
    <div> Hello! I'm a developer from South Korea, with a degree in Naval Architecture and Ocean Engineering from the University of Ulsan.
I'm skilled in both frontend and backend development, and I enjoy creating complete, full-stack web applications that look great and work flawlessly.</div>
  <div className='project'>
  <div></div>
  </div>
   </div>
  <div className='About'>
   <div className='Body-title1'>About Me</div>
   <ul>
   <li>Naval-Englineer</li>
   <li>Korea Army 1Year-Half</li> 
   <li>Airbnb Business for 6 months</li> 
   <li>Worked as manager in company</li>  
   </ul>  
  </div>
  <div className='Project'>
   <div className='Body-title2'>Project</div> 
  </div>



  </div>
  );
}

export default App;
