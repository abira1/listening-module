import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from './Header';
import { ConfirmDetails } from './ConfirmDetails';
import { SoundTest } from './SoundTest';
import { ListeningInstructions } from './ListeningInstructions';
import { ListeningTest } from './ListeningTest';
import { BackendService } from '../services/BackendService';

export function ExamTest() {
  const { examId } = useParams();
  const [currentScreen, setCurrentScreen] = useState('confirmDetails');
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    const loadExam = async () => {
      if (examId) {
        try {
          const examData = await BackendService.getExam(examId);
          setExam(examData);
          setLoading(false);
        } catch (error) {
          console.error('Error loading exam:', error);
          setLoading(false);
        }
      }
    };

    loadExam();
  }, [examId]);

  const handleContinue = () => {
    if (currentScreen === 'confirmDetails') {
      setCurrentScreen('soundTest');
    } else if (currentScreen === 'soundTest') {
      setCurrentScreen('instructions');
    } else if (currentScreen === 'instructions') {
      setCurrentScreen('test');
      if (audioRef.current) {
        audioRef.current.play().catch((error) => {
          console.error('Error playing audio:', error);
        });
      }
    }
  };

  const setupAudio = () => {
    if (exam && exam.audio_url) {
      if (audioRef.current) {
        audioRef.current.src = exam.audio_url;
        audioRef.current.loop = exam.loop_audio || false;
        
        audioRef.current.addEventListener('ended', () => {
          console.log('Audio playback ended');
        });
        
        audioRef.current.addEventListener('error', (e) => {
          console.error('Audio playback error:', e);
        });
      }
    }
  };

  useEffect(() => {
    if (exam) {
      setupAudio();
    }
  }, [exam]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-blue-50 to-blue-100 justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading test...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-blue-50 to-blue-100 justify-center items-center">
        <p className="text-gray-600">Test not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-blue-50 to-blue-100">
      <audio ref={audioRef} style={{ display: 'none' }} controls={false} />
      
      {currentScreen !== 'test' && <Header />}
      
      <main className={`flex-1 ${currentScreen !== 'test' ? 'flex justify-center items-center p-4' : ''}`}>
        {currentScreen === 'confirmDetails' && (
          <ConfirmDetails onContinue={handleContinue} />
        )}
        {currentScreen === 'soundTest' && (
          <SoundTest onContinue={handleContinue} audioRef={audioRef} />
        )}
        {currentScreen === 'instructions' && (
          <ListeningInstructions onStart={handleContinue} examTitle={exam?.title} />
        )}
        {currentScreen === 'test' && (
          <ListeningTest examId={examId} audioRef={audioRef} />
        )}
      </main>
    </div>
  );
}