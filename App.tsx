import React, { useRef, useState, useCallback } from 'react';
import FireworksEngine, { FireworksEngineRef } from './components/FireworksEngine';
import { Button } from './components/Button';
import { Sparkles, MousePointer2 } from 'lucide-react';

const App: React.FC = () => {
  const engineRef = useRef<FireworksEngineRef>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const autoPlayIntervalRef = useRef<number | null>(null);

  const handleLaunch = useCallback(() => {
    if (engineRef.current) {
      // Launch a burst of 5 fireworks
      engineRef.current.launch(5);
    }
  }, []);

  const toggleAutoPlay = () => {
    if (autoPlay) {
      if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
      setAutoPlay(false);
    } else {
      setAutoPlay(true);
      // Fire every 800ms
      autoPlayIntervalRef.current = window.setInterval(() => {
        if (engineRef.current) {
          engineRef.current.launch(randomInt(1, 3));
        }
      }, 800);
    }
  };

  // Helper just for this component
  const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden text-white font-sans">
      {/* Background Canvas */}
      <FireworksEngine ref={engineRef} />

      {/* Foreground UI Layer - Using 'pointer-events-none' on container to let clicks pass to canvas */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-10">
        
        {/* Header */}
        <div className="w-full p-6 bg-gradient-to-b from-black/80 to-transparent">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400 text-center tracking-wider drop-shadow-lg">
            新年快乐
          </h1>
          <p className="text-center text-white/60 text-sm mt-1">
            Tap screen or use buttons below
          </p>
        </div>

        {/* Controls Container - Re-enable pointer events for buttons */}
        <div className="w-full p-6 pb-12 flex flex-col gap-4 items-center bg-gradient-to-t from-black/90 to-transparent pointer-events-auto">
            
            <div className="flex w-full gap-4 max-w-md">
                <Button 
                    onClick={toggleAutoPlay} 
                    variant="secondary"
                    fullWidth
                    className="backdrop-blur-xl"
                >
                    {autoPlay ? 'Stop Show' : 'Auto Show'}
                </Button>
                
                <Button 
                    onClick={handleLaunch} 
                    fullWidth
                    className="animate-pulse"
                >
                    <Sparkles className="w-5 h-5" />
                    Ignite!
                </Button>
            </div>

            <div className="text-xs text-white/30 flex items-center gap-1">
                <MousePointer2 className="w-3 h-3" />
                <span>Powered by React & Canvas</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;