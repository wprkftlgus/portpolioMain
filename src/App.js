import React, { useRef ,useState, useEffect, Suspense, cloneElement } from 'react';
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
    camera.position.lerp(new THREE.Vector3(pos.x + 2, pos.y-3 , pos.z + 3), 0.05);
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
    <primitive ref={earthRef} object={earth.scene} scale={2}  />
     <MoonOrbit speed={0.25} radius={0.001} focus={focus}>
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
  const [fold, setFold] = useState(true);
  const [focus, setFocus] = useState(null);
  const slides = [0, 1, 2, 3, 4];
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const nextSlide = () => {
    setIndex((prev) => (prev + 1) %slides.length);
  }
  const PrevSlide = () => {
    setIndex((prev) => ((prev - 1 + slides.length)) %slides.length);
  }
  

  const [isLoaded, setIsLoaded] = useState(false);
   const onSceneLoaded = () => {
    setIsLoaded(true);
  };

  function AnimationChildren({ children, threshold = 0.5}){
    const [visible, setVisible] = useState(false);
    const ref = useRef();

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting)
          setVisible(true);}, { threshold }
      );
      if (ref.current){observer.observe(ref.current);}
      return () => observer.disconnect();
    },[threshold]);
    return(
      <div ref={ref} className={visible ? children.props.className:"invisible"}>{children}</div>
    )
  }

  function AnimationClone({ children, threshold = 0.5}){
    const [visible, setVisible] = useState(false);
    const ref = useRef();

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting)
          setVisible(true);}, { threshold }
      );
      if (ref.current){observer.observe(ref.current);}
      return () => observer.disconnect();
    },[threshold]);
    return cloneElement(children, {ref, className: visible ? children.props.className : "invisible"})
  }

  function Animation({ children, threshold = 0.5}){
    const [visible, setVisible] = useState(false);
    const ref = useRef();

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting)
          setVisible(true);}, { threshold }
      );
      if (ref.current){observer.observe(ref.current);}
      return () => observer.disconnect();
    },[threshold]);
    return(
      <div ref={ref} className={visible ? children.props.className:""}></div>
    )
  }

  return (
    <div className='App'>
     
     <div className='Section1'>  
      {!isLoaded ? (<div></div>) : (
        <div className='div-logo'><img className='Logo' src='\icon.png' /></div>
      )}
      {focus === 'earth' && (<div onClick={() => setFold(prev =>!prev)} className='about-fold'></div>)}
      {focus === 'earth' && (
        <div className={fold ? 'about-sentence-group' : 'about-hide'}>
        
        <motion.div className='about-title' initial={{opacity: 0}}
        animate={{opacity:1}} transition={{duration: 1.4, delay: 0.3}}>
          <div className='about-bug'></div>
          <div>Hi, my name is</div>
          <div className='about-title-myname'>Jegal Sihyeon</div>
          <div className='about-subtitle'>I’m now determined to grow as a 
          <div className='about-letter-fullstack'>Full-Stack</div>developer.  
I love building engaging and interactive web applications, and 
I'm eager to bring fresh ideas and technical skills to every project I take on.</div>
          <div className='me'><div className='hand'></div></div>
        </motion.div>
        <div className='about-sentence'>
        
        <div className='about-titleAndLine-beyond'>
        <div className='line'></div>
        <div className='about-title-line1'>&lt;</div>
        <div className='about-title-beyond'>Beyond Code</div>
        <div className='about-title-line3'>/&gt;</div>
        <div className='line'></div>
        </div>
        <AnimationChildren><div className='about-title2-beyond'>As a developer, I believe growth comes from continuously learning new technologies, keeping an open mind to explore different perspectives, and effectively communicating with others to turn ideas into reality.</div></AnimationChildren>
        <div className='about-beyond-holder'>
        <AnimationChildren>
        <div className='about-beyond-flex'>
        <div className='about-beyond-component-flex'>
        <div className='about-beyond-subtitleNumber'>01</div>
        <Animation><div className='about-progressBar'></div></Animation>
        <div className='about-subtitle1-beyond'>Non-stop Learning</div>
        <div className='about-content1-beyond'>As a developer, it takes continuous effort and practice to learn new technologies and stay up to date with the latest trends.</div>
        </div>
        <div className='about-beyond-component-flex'>
        <div className='about-beyond-subtitleNumber'>02</div>
        <Animation><div className='about-progressBar'></div></Animation>
        <div className='about-subtitle2-beyond'>Opened-minded</div>
        <div className='about-content2-beyond'>A developer should have an open mindset — always ready to think differently and explore new directions beyond the conventional path.</div>
        </div>
        <div className='about-beyond-component-flex'>
        <div className='about-beyond-subtitleNumber'>03</div>
        <Animation><div className='about-progressBar'></div></Animation>
        <div className='about-subtitle3-beyond'>Communicative</div>
        <div className='about-content3-beyond'>Just as developers interact with computers through code, it’s equally important to communicate and exchange ideas with people. Strong communication skills are essential to put all of this into practice.</div>
        </div>
        </div>
        </AnimationChildren>
        </div>
        <div className='about-holder-techstacks'>
        <div className='about-holder-title-line'>
          <div className='line'></div>
          <div className='about-title-line1'>&lt;</div>
          <div className='about-title-line2'>Tech Stacks</div>
          <div className='about-title-line3'>/&gt;</div>
          <div className='line'></div>
        </div>
        <div className='about-techstacks-flex-holder'>
        <div className='about-techstacks-flex'>
        
        <div className='about-holder-frontend'>
          <div className='about-title-techstacks'>Front-End</div>
          
          <div className='holder-frontend-icons'>
          <AnimationClone><div className='holder-icon'><div className='html'></div><div className='title-icon'>HTML</div></div></AnimationClone>
          <AnimationClone><div className='holder-icon'><div className='css'></div><div className='title-icon'>CSS</div></div></AnimationClone>
          <AnimationClone><div className='holder-icon'><div className='java'></div><div className='title-icon'>JAVA</div></div></AnimationClone>
          <AnimationClone><div className='holder-icon'><div className='react'></div><div className='title-icon'>React</div></div></AnimationClone>
          
          </div>
          
        </div>
        
        <div className='about-holder-backend'>
          <div className='about-title-techstacks'>Back-End</div>
        <AnimationChildren>
          <div className='holder-backend-icons'>
          <AnimationClone><div className='holder-icon'><div className='node'></div><div className='title-icon'>Node.js</div></div></AnimationClone>
          <AnimationClone><div className='holder-icon'><div className='express'></div><div className='title-icon'>Express.js</div></div></AnimationClone>
          <AnimationClone><div className='holder-icon'><div className='mongodb'></div><div className='title-icon'>MongoDB</div></div></AnimationClone>
          <AnimationClone><div className='holder-icon'><div className='render'></div><div className='title-icon'>Render</div></div></AnimationClone>
          <AnimationClone><div className='holder-icon'><div className='restapi'></div><div className='title-icon'>RestAPI</div></div></AnimationClone>
          <AnimationClone><div className='holder-icon'><div className='router'></div><div className='title-icon'>Router</div></div></AnimationClone>
        </div>
        </AnimationChildren>
        </div>
        </div>
        <div className='about-holder-techtools'>
          <div className='about-title-techstacks'>Tech & Tools</div>
          <AnimationChildren>
          <div className='holder-techAndTools-icons'>
          <AnimationClone><div className='holder-icon'><div className='vs'></div><div className='title-icon'>VS code</div></div></AnimationClone>
          <AnimationClone><div className='holder-icon'><div className='git'></div><div className='title-icon'>Git</div></div></AnimationClone>
          <AnimationClone><div className='holder-icon'><div className='github'></div><div className='title-icon'>Github</div></div></AnimationClone>
          <AnimationClone><div className='holder-icon'><div className='netlify'></div><div className='title-icon'>Netlify</div></div></AnimationClone>
          <AnimationClone><div className='holder-icon'><div className='bootstrap'></div><div className='title-icon'>Bootstrap</div></div></AnimationClone>
          </div>
          </AnimationChildren>
        </div>
        </div>
        </div>
        <div className='about-holder-title-line'>
          <div className='line'></div>
          <div className='about-title-line1'>&lt;</div>
          <div className='about-title-line2'>Experiences</div>
          <div className='about-title-line3'>/&gt;</div>
          <div className='line'></div>
        </div>
        <div className='about-container-experience'>
          <Animation><div className='about-line-experience'></div></Animation>
          <div className='about-holder-content-experience'>
          <div className='about-holder-contentAndIcon-experience'>
          <AnimationChildren ><div className='about-titleAndSubtitle-experience'>
          <div className='about-title-experience'>💻 Self-taught Full Stack Developer</div>
          <div className='about-date-experience'>01/03/2020 ~ Present</div>
          <div className='about-subtitle-experience'>Learned web development independently through various online resources and personal projects.
Although my learning pace was irregular due to military service (1.5 years) and other commitments, I continued improving my skills and completed several front-end projects to strengthen my portfolio.</div>
          </div></AnimationChildren>
          <Animation><div className='onair-red'></div></Animation>
          <Animation><div className='onair'></div></Animation>
          </div>
          <div className='about-holder-contentAndIcon-experience'>
          <AnimationChildren ><div className='about-titleAndSubtitle-experience'>
          <div className='about-title-experience'>🚢 Graduated with a Bachelor’s Degree in Naval Architecture and Ocean Engineering</div>
          <div className='about-date-experience'>01/03/2020 ~ 26/12/2025</div>
          <div className='about-subtitle-experience'>University of Ulsan, South Korea (4 years) Developed a strong foundation in problem-solving, analytical thinking, and system design through rigorous engineering 
          coursework and team projects. My academic background helped me build logical thinking skills that I now apply to web development and software architecture.</div>
          </div></AnimationChildren>
          <Animation><div className='checked'></div></Animation>
          </div>
          <div className='about-holder-contentAndIcon-experience'>
          <AnimationChildren><div className='about-titleAndSubtitle-experience'>
          <div className='about-title-experience'>💪 Completed 18 months of mandatory military service in Korea</div> 
          <div className='about-date-experience'>18/11/2020 ~ 17/05/2023</div>
          <div className='about-subtitle-experience'>Served as a driver-soldier Successfully fulfilled national service with discipline and responsibility. During my service, I learned how to stay calm under pressure, work efficiently in structured environments, 
          and collaborate closely with teammates to achieve collective goals.</div>
          </div></AnimationChildren>
          <Animation><div className='checked'></div></Animation>
          </div>
          <div className='about-holder-contentAndIcon-experience'>
          <AnimationChildren><div className='about-titleAndSubtitle-experience'>
          <div className='about-title-experience'>🏡 Running an Airbnb business in Leeds, UK (with my wife)</div>   
          <div className='about-date-experience'>01/03/2025 ~ 01/09/2025</div>
          <div className='about-subtitle-experience'>6 months of hands-on experience in property management and customer service Co-managed an Airbnb property, handling guest communication, logistics, and maintenance. This experience strengthened my communication skills, 
          attention to detail, and ability to provide excellent user experiences — qualities that I also value as a developer when building digital products.</div>
          </div></AnimationChildren>
          <Animation><div className='checked'></div></Animation>
          </div>
          </div>
          </div>
        </div>
        </div>
      )}
      
      {focus === 'mars' && (
        <motion.div className='project-sentence' initial={{opacity: 0}}
        animate={{opacity:1}} transition={{duration: 0}}>
        <div className='holder-projects'>
          <div className='button-previous' onClick={() => {
            PrevSlide();
          }}></div>
          <div className='slides-wrapper'>
          <div className='slides' style={{ transform: `translateX(-${index * 100}%)`}}>
          
          <div className='slide'>
          <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className='holder-picture-project'>
            <div className='picture-project1'>{hover && (
              <div className='liveAndGit-button'>
              <a id='live' target='_blank' href='https://mainresgisterlogin.netlify.app/'>
              <div className='live-button'>Live</div>
              <a id='git' target='_blank' href='https://github.com/wprkftlgus/mainresisterlogin'><div className='holder-git-button'><div className='git-button'></div></div></a>
              </a>
              </div>)}</div>
          </div>
          
          <div className='title-project'>Loop Market</div>
          <div className='rightsection-project1'>
          <div className='text-project1'>Second-Hand market that people can make their own account, login, upload the post</div>
          <div className='holder-project-skills'>
            <div className='css-skill'>Full-Stack</div>
            <div className='css-skill'>React</div>
            <div className='css-skill'>HTML</div>
            <div className='css-skill'>CSS</div>
            <div className='css-skill'>MongoDB</div>
            <div className='css-skill'>Express</div>
            <div className='css-skill'>Router</div>
          </div>
          </div>
          </div>
          
          <div className='slide'>
          <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className='holder-picture-project'>
            <div className='picture-project2'>{hover && (
              <div className='liveAndGit-button'>
              <a id='live' target='_blank' href='https://recipeapibysihyeon.netlify.app/'>
              <div className='live-button'>Live</div>
              <a id='git' target='_blank' href='https://github.com/wprkftlgus/RecipeAPI'><div className='holder-git-button'><div className='git-button'></div></div></a>
              </a>
              </div>)}</div>
          </div>
          <div className='title-project'>MyRecipe</div>
          <div className='rightsection-project1'>
          <div className='text-project1'>User can search the recipe of the food what they want, while showing all instructions and Youtube video as well!</div>
          <div className='holder-project-skills'>
            <div className='css-skill'>Full-Stack</div>
            <div className='css-skill'>React</div>
            <div className='css-skill'>HTML</div>
            <div className='css-skill'>CSS</div>
            <div className='css-skill'>MongoDB</div>
            <div className='css-skill'>Express</div>
            <div className='css-skill'>Router</div>
          </div>
          </div>
          </div>

          <div className='slide'>
          <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className='holder-picture-project'>
            <div className='picture-project3'>{hover && (
              <div className='liveAndGit-button'>
              <a id='live' target='_blank' href='https://spacebysihyeon.netlify.app/'>
              <div className='live-button'>Live</div>
              <a id='git' target='_blank' href='https://github.com/wprkftlgus/portpolioMain'><div className='holder-git-button'><div className='git-button'></div></div></a>
              </a>
              </div>)}</div>
          </div>
          <div className='title-project'>The Space</div>
          <div className='rightsection-project1'>
          <div className='text-project1'>My main portfolio website that got inspired from movie 'Interstellar'. User can watch all of my work here!</div>
          <div className='holder-project-skills'>
            <div className='css-skill'>Full-Stack</div>
            <div className='css-skill'>React</div>
            <div className='css-skill'>HTML</div>
            <div className='css-skill'>CSS</div>
            <div className='css-skill'>MongoDB</div>
            <div className='css-skill'>Express</div>
            <div className='css-skill'>Router</div>
          </div>
          </div>
          </div>

          <div className='slide'>
          <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className='holder-picture-project'>
            <div className='picture-project4'>{hover && (
              <div className='liveAndGit-button'>
              <a id='live' target='_blank' href='https://netflisclonebysihyeon.netlify.app/'>
              <div className='live-button'>Live</div>
              <a id='git' target='_blank' href='https://github.com/wprkftlgus/Netflix'><div className='holder-git-button'><div className='git-button'></div></div></a>
              </a>
              </div>)}</div>
          </div>
          <div className='title-project'>SeanFlix</div>
          <div className='rightsection-project1'>
          <div className='text-project1'>Built a Netflix clone using React and styled-components, replicating the original platform’s design and interactivity. Features include responsive layout, video playback, animated sections, and collapsible FAQ interactions.</div>
          <div className='holder-project-skills'>
            <div className='css-skill'>Full-Stack</div>
            <div className='css-skill'>React</div>
            <div className='css-skill'>HTML</div>
            <div className='css-skill'>CSS</div>
            <div className='css-skill'>MongoDB</div>
            <div className='css-skill'>Express</div>
            <div className='css-skill'>Router</div>
          </div>
          </div>
          </div>

          <div className='slide'>
          <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className='holder-picture-project'>
            <div className='picture-project5'>{hover && (
              <div className='liveAndGit-button'>
              <a id='live' target='_blank' href='https://sean-calculator.netlify.app/'>
              <div className='live-button'>Live</div>
              <a id='git' target='_blank' href='https://github.com/wprkftlgus/Calculator'><div className='holder-git-button'><div className='git-button'></div></div></a>
              </a>
              </div>)}</div>
          </div>
          <div className='title-project'>Calculator</div>
          <div className='rightsection-project1'>
          <div className='text-project1'>Built a functional calculator using React and JavaScript, featuring real-time input display, operator validation, and error handling for invalid expressions.</div>
          <div className='holder-project-skills'>
            <div className='css-skill'>Full-Stack</div>
            <div className='css-skill'>React</div>
            <div className='css-skill'>HTML</div>
            <div className='css-skill'>CSS</div>
            <div className='css-skill'>MongoDB</div>
            <div className='css-skill'>Express</div>
            <div className='css-skill'>Router</div>
          </div>
          </div>
          </div>
          </div>
          </div>
          <div className='button-next' onClick={() => {
            nextSlide();
          }}></div>
        </div>
        </motion.div>
      )}
      {focus === 'moon' && (
        <motion.div className='contact-sentence' initial={{opacity: 0}}
        animate={{opacity:10}} transition={{duration: 0}}>
        <div className='holder-contact'>
          <div className='name-contact'>Contact</div>
          <input placeholder='Your Email' className='email'></input>
          <input placeholder='Title' className='title'></input>
          <textarea placeholder='Content' className='content'></textarea>
          <div className='holder-check'>
            <div className='check'></div>
          </div>
        </div>
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
      }
      </div>
      {!isLoaded ? (<div></div>) : (
      <div className='holder-bottom'>
      <div className='copyRight'>© 2025 Sihyeon. All rights reserved</div>
      <div className='bottom'>
        <div className='popup-nameAndImg-github'>
        <a href='https://github.com/wprkftlgus' target='_blank'>
        <div className='bottomgit'><div className='popup-name'>Github</div></div></a>
        
        </div>
      </div>
      </div>
      )}
      
      <Canvas className='canvas' camera={{ position: [0, 0, 18] }} >
        <Suspense fallback={
          <Html fullscreen>
              <div className="bugAndLoading">
              <div className="bug"></div>
              <div className="loading">Loading...</div>
              </div>
          </Html>
        }>
         <Scene className="scene" focus = {focus} onLoad={onSceneLoaded}/>
        </Suspense>
        <pointLight position={[0, 0, 0]} intensity={400} color="#edebe1ff" />
        <EffectComposer>
         <Bloom luminanceThreshold={100} 
         luminanceSmoothing={1} radius={0.7} height={100} />
         </EffectComposer>
        <directionalLight position={[-2, 2, 2]} intensity={1} />
        <ambientLight position={[2, 2, 2]} intensity={2} />
      </Canvas>
      
      </div>
  </div>
  );
}

export default App;
