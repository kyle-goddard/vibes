import { useState, useRef, useEffect } from 'react'
import './App.css'
import StartScreen from './components/StartScreen'
import Cockpit from './components/Cockpit'


import AudioControl from './components/AudioControl'

function App() {
  const [view, setView] = useState('start'); // 'start' | 'game'
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  const handleStart = () => {
    setView('game');
    setAudioEnabled(true);
  };

  const handleBack = () => {
    setView('start');
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <>
      {audioEnabled && (
        <>
          <audio
            ref={audioRef}
            src="/retro-tune.wav"
            autoPlay
            loop
            style={{ display: 'none' }}
          />
          <AudioControl isMuted={isMuted} onToggle={() => setIsMuted(!isMuted)} />
        </>
      )}
      {view === 'start' && <StartScreen onStart={handleStart} />}
      {view === 'game' && <Cockpit onBack={handleBack} />}
    </>
  )
}

export default App
