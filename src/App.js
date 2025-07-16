import React, { useRef ,useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from "@react-three/drei";
import './App.css';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { motion  } from 'framer-motion';
import * as THREE from 'three';
import { div } from 'framer-motion/client';
import { Html } from '@react-three/drei';

function Scene({focus, onLoad}) {
  const { camera } = useThree();

  const groupRef = useRef();
  const sunRef = useRef();
  const earthRef = useRef();
  const moonRef = useRef();
  const marsRef = useRef();
  const [mouse, setMouse] = useState({x: 0, y: 0});

  const earth = useGLTF("/earth.glb");
  const moon = useGLTF("/moon.glb");
  const mars = useGLTF("/mars.glb");
  const sun = useGLTF("hot_sun.glb")

  useEffect(() => {
    if( earth.scene && mars.scene && sun.scene){
      onLoad();
    }
  },[earth, mars, sun, onLoad])

  useEffect(() => {
    const handleMouseMove = (e)  => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMouse({ x, y });
    };

    if (focus === 'earth' || focus === 'mars' || focus === 'moon') {
    window.removeEventListener('mousemove', handleMouseMove);
    return;
     };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [focus]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = mouse.x * 1;
      groupRef.current.rotation.x = mouse.y * 1;
    }
     if (earthRef.current) {
      earthRef.current.rotation.y += 0.003;  
    }
    if (moonRef.current) {
      moonRef.current.rotation.y += 0.01;  
    }
    if (marsRef.current) {
      marsRef.current.rotation.y += 0.007;  
    }
    if (focus === 'earth' && earthRef.current) {
    const pos = new THREE.Vector3();
    earthRef.current.getWorldPosition(pos);
    camera.position.lerp(new THREE.Vector3(pos.x + 1.5, pos.y-2 , pos.z + 2), 0.05);
    camera.lookAt(pos);
  } else if (focus === 'mars' && marsRef.current) {
    const pos = new THREE.Vector3();
    marsRef.current.getWorldPosition(pos);
    camera.position.lerp(new THREE.Vector3(pos.x + 2, pos.y + 2, pos.z + 2), 0.05);
    camera.lookAt(pos);
  } else if (focus === 'moon' && moonRef.current) {
    const pos = new THREE.Vector3();
    moonRef.current.getWorldPosition(pos);
    camera.position.lerp(new THREE.Vector3(pos.x , pos.y + 0.5 , pos.z + 1), 0.05);
    camera.lookAt(pos);
  } else if(focus === 'zoomout') {
    camera.position.lerp(new THREE.Vector3(10, 0, 12), 0.05);
    camera.lookAt(0, 0, 0);
  }
  else {
    camera.position.lerp(new THREE.Vector3(10, 0, 12), 0.05);
    camera.lookAt(0, 0, 0);
  }
  })
return(
  <group ref={groupRef}>
    <Orbit speed={0.3} radius={3.5}>
    <primitive ref={marsRef} object={mars.scene} scale={3} position={[14, 0, 1]} />
    </Orbit>
    <Orbit speed={0.2} radius={10}>
    <primitive ref={earthRef} object={earth.scene} scale={1.5}  />
     <MoonOrbit speed={2} radius={0.001} focus={focus}>
      <primitive ref={moonRef} object={moon.scene} scale={0.5} position={[4, 0, 1]}/>
     </MoonOrbit>
    </Orbit>
    <Orbit speed={0} radius={0}>
      <primitive ref={sunRef} object={sun.scene} scale={1.2} position={[0, 0, 0]}/>
    </Orbit>
    
  </group>
);
};

function MoonOrbit({speed , radius, focus, children}) {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    groupRef.current.rotation.y = elapsed * speed;
    const rotationSpeed = focus === 'moon' ? 0 : speed;
    groupRef.current.rotation.y = elapsed * rotationSpeed;
  });
  return (
    <group ref={groupRef}>
      <group position={[radius, 0, 0]}>
        {children}
      </group>
    </group>
  );
}

function Orbit({ speed, radius, children }) {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    groupRef.current.rotation.y = elapsed * speed;
  });

  return (
    <group ref={groupRef}>
      <group position={[radius, 0, 0]}>
        {children}
      </group>
    </group>
  );
}

function App() {
  const [position, setPosition] = useState({x:0, y:0});
  useEffect(() => {
    const moveHandler = (e) => {
      setPosition({x:e.clientX, y:e.clientY})
    };
    window.addEventListener('mousemove', moveHandler);
    return() => window.removeEventListener('mousemove', moveHandler);
  },[]);
  const [focus, setFocus] = useState(null);

  const [isLoaded, setIsLoaded] = useState(false);
   const onSceneLoaded = () => {
    setIsLoaded(true);
  };
  return (
    <div className='App'>
     <div className='Neon' style={{left: position.x, top: position.y}}></div>
     <div className='Section1'>  
      <div className='div-logo'><img className='Logo' src='\icon.png' /></div>
      {focus === 'earth' && (
        <div className='about-sentence-group'>
        <motion.div className='about-title' initial={{opacity: 0}}
        animate={{opacity:1}} transition={{duration: 1.4, delay: 0.3}}>
          Hello there👋, <br />This is Sihyeon! 
        </motion.div>
          <motion.div className='about-sentence' initial={{opacity: 0}}
        animate={{opacity:1}} transition={{duration: 1.7, delay: 0.6}}>
           <br /> I’m now determined to grow as a Full-Stack developer.  
I love building engaging and interactive web applications, and 
I'm eager to bring fresh ideas and technical skills to every project I take on.
          <ul>
           <li>🚢 graduated of Naval Engineering, at University of Ulsan</li>
           <li>💪 18 months completed military service</li>
           <li>🏡 Airbnb business for 6 months with wife</li>
          </ul>
        </motion.div>
        </div>
      )}
      {focus === 'earth' && (
        <div className='skills-group'>
        <motion.div initial={{opacity: 0}}
         animate={{opacity:1}} transition={{duration: 1.4}}>
          <div className='skills-title'>Skills</div>
          <ul className='skills-ul'>
            <li className='skills-units'><img width={50} src='\react.png' /></li>
            <li className='skills-units'><img width={50} src='\html.png'/></li>
            <li className='skills-units'><img width={50} src='\css.png'/></li>
            <li className='skills-units'><img width={50} src='\js.png'/></li>
            <li className='skills-units'><img width={50} src='\nodejs.png'/></li>
            <li className='skills-units'><img width={50} src='\github1.png'/></li>
            <li className='skills-units'><img width={50} src='\vs.png'/></li>
            <li className='skills-units'><img width={50} src='\mongo.png'/></li>
            <li className='skills-units'><img width={50} /></li>
          </ul>
        </motion.div>
        </div>
      )}
      {focus === 'mars' && (
        <motion.div className='project-sentence' initial={{opacity: 0}}
        animate={{opacity:1}} transition={{duration: 1.4}}>

        </motion.div>
      )}
      {focus === 'moon' && (
        <motion.div className='contact-sentence' initial={{opacity: 0}}
        animate={{opacity:1}} transition={{duration: 1.4}}>

        </motion.div>
      )}
      <div className='Top-tag-group'>
      {isLoaded && (
        <>
        <motion.div className='Top-tag0' initial={{ opacity:0, x: 0, y: 500}}
      animate={{ opacity: 1, x: 0, y: 0}}
      transition={{duration: 1.4, delay: 0.4}} onClick={() => setFocus('zoomout') }>
      Zoom Out
      </motion.div>
      <motion.div className='Top-tag1' initial={{ opacity:0, x: 0, y: 500}}
      animate={{ opacity: 1, x: 0, y: 0}}
      transition={{duration: 1.4, delay: 0.4}} onClick={() => setFocus('earth') }
      >About</motion.div>
      <motion.div className='Top-tag2' initial={{ opacity:0, x: 0, y: 500}}
      animate={{ opacity: 1, x: 0, y: 0}}
      transition={{duration: 1.6, delay: 0.5}} onClick={() => setFocus('mars') }
      >Project</motion.div>
      <motion.div className='Top-tag3' initial={{ opacity:0, x: 0, y: 500}}
      animate={{ opacity: 1, x: 0, y: 0}}
      transition={{duration: 1.8, delay: 0.6}} onClick={() => setFocus('moon') }
      >Contact</motion.div></>)
      };
      </div>
      

      <Canvas className='canvas' camera={{ position: [0, 0, 18] }} >
        <Suspense fallback={
          <Html>
            <div className='background'>
              <div className='Loading-bar'>Loding...</div>
            </div>
            
          </Html>
        }>
         <Scene focus = {focus} onLoad={onSceneLoaded}/>
        </Suspense>
        <pointLight position={[0, 0, 0]} intensity={400} color="#edebe1ff" />
        <EffectComposer>
         <Bloom luminanceThreshold={100} 
         luminanceSmoothing={1} radius={0.7} height={100} />
         </EffectComposer>
        <directionalLight position={[-2, 2, 2]} intensity={1} />
        <ambientLight position={[2, 2, 2]} intensity={1} />
      </Canvas>
      
      </div>
  </div>
  );
}

export default App;
