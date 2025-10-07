import React, { useEffect, useState } from 'react';
import { Button } from './common/Button';
import { InfoNotice } from './common/InfoNotice';
import { Volume2Icon, VolumeXIcon } from 'lucide-react';

export function SoundTest({ onContinue, audioRef }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((error) => {
          console.error('Error playing audio:', error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const adjustVolume = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  useEffect(() => {
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    if (audioRef.current) {
      audioRef.current.addEventListener('play', handlePlay);
      audioRef.current.addEventListener('pause', handlePause);
      audioRef.current.volume = volume / 100;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('play', handlePlay);
        audioRef.current.removeEventListener('pause', handlePause);
      }
    };
  }, [audioRef, volume]);

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
      <h2 className="text-2xl font-bold text-center mb-6">Sound Check</h2>
      
      <InfoNotice>
        Please test your audio before starting the exam. Make sure you can hear clearly and adjust the volume to a comfortable level.
      </InfoNotice>

      <div className="my-8 flex flex-col items-center">
        <button
          onClick={togglePlayback}
          className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors mb-4"
        >
          {isPlaying ? <VolumeXIcon size={32} /> : <Volume2Icon size={32} />}
        </button>
        
        <p className="text-center mb-4">
          {isPlaying ? 'Click to stop' : 'Click to play test audio'}
        </p>

        <div className="w-full max-w-md flex items-center">
          <VolumeXIcon className="w-5 h-5 text-gray-500 mr-2" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={adjustVolume}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <Volume2Icon className="w-5 h-5 text-gray-500 ml-2" />
        </div>
        <p className="text-sm text-gray-500 mt-2">Volume: {volume}%</p>
      </div>

      <div className="flex justify-center">
        <Button onClick={onContinue}>Continue to Instructions</Button>
      </div>
    </div>
  );
}