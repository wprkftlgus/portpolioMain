import React, { useRef ,useState, useEffect, use } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from "@react-three/drei";
import './App.css';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

function Scene() {
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
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMouse({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
  })
return(
  <group ref={groupRef}>
    <Orbit speed={0.1} radius={6}>
    <primitive ref={marsRef} object={mars.scene} scale={1.8} position={[12, 0, 1]} />
    </Orbit>
    <Orbit speed={0.2} radius={3}>
    <primitive ref={earthRef} object={earth.scene} scale={0.8}  position={[4, 0, 1]}/>
    </Orbit>
    <Orbit speed={0} radius={0}>
      <primitive ref={sunRef} object={sun.scene} scale={0.7} position={[0, 0, 0]}/>
    </Orbit>
    <MoonOrbit speed={0.5} radius={1}>
      <primitive ref={moonRef} object={moon.scene} scale={0.3} position={[7, 0, 1]}/>
    </MoonOrbit>
    
    
  </group>
);
};

function MoonOrbit({speed , radius, children}) {
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


  return (
    <div className='App'>
     <div className='Neon' style={{left: position.x, top: position.y}}></div>
     <div className='Section1'>  
      <div className='Top-box'><img className='Logo' src='\icon.png' />
      
      <div className='Top-tag1'>About</div>
      <div className='Top-tag2'>Project</div>
      <div className='Top-tag3'>Contact</div>
      
      </div>
      <Canvas camera={{ position: [10, 0, 12] }} >
        <Scene />
        <pointLight position={[0, 0, 0]} intensity={400} color="#edebe1ff" />
        <EffectComposer>
         <Bloom luminanceThreshold={10} luminanceSmoothing={1} height={100} />
         </EffectComposer>
        <directionalLight position={[-2, 2, 2]} intensity={1} />
        <ambientLight position={[2, 2, 2]} intensity={1} />
      </Canvas>
      </div>
  </div>
  );
}

export default App;
