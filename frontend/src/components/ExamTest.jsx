import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { ConfirmDetails } from './ConfirmDetails';
import { SoundTest } from './SoundTest';
import { ListeningInstructions } from './ListeningInstructions';
import { ReadingInstructions } from './ReadingInstructions';
import { WritingInstructions } from './WritingInstructions';
import { ListeningTest } from './ListeningTest';
import { ReadingTest } from './ReadingTest';
import { WritingTest } from './WritingTest';
import { BackendService } from '../services/BackendService';
import { useAuth } from '../contexts/AuthContext';

export function ExamTest() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('confirmDetails');
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);

  // Check authentication and approval status before allowing exam access
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        navigate('/student');
      } else if (user && user.status !== 'approved') {
        // Only approved students can take exams
        navigate('/waiting-approval');
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  useEffect(() => {
    const loadExam = async () => {
      if (examId && isAuthenticated) {
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

    if (!authLoading) {
      loadExam();
    }
  }, [examId, isAuthenticated, authLoading]);

  const handleContinue = () => {
    const isReadingTest = exam?.exam_type === 'reading';
    
    if (currentScreen === 'confirmDetails') {
      // Skip sound test for reading tests
      if (isReadingTest) {
        setCurrentScreen('instructions');
      } else {
        setCurrentScreen('soundTest');
      }
    } else if (currentScreen === 'soundTest') {
      setCurrentScreen('instructions');
    } else if (currentScreen === 'instructions') {
      setCurrentScreen('test');
      // Only play audio for listening tests
      if (!isReadingTest && audioRef.current) {
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

  const isReadingTest = exam?.exam_type === 'reading';

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-blue-50 to-blue-100">
      {!isReadingTest && <audio ref={audioRef} style={{ display: 'none' }} controls={false} />}
      
      {currentScreen !== 'test' && <Header />}
      
      <main className={`flex-1 ${currentScreen !== 'test' ? 'flex justify-center items-center p-4' : ''}`}>
        {currentScreen === 'confirmDetails' && (
          <ConfirmDetails onContinue={handleContinue} />
        )}
        {currentScreen === 'soundTest' && !isReadingTest && (
          <SoundTest onContinue={handleContinue} audioRef={audioRef} />
        )}
        {currentScreen === 'instructions' && (
          isReadingTest ? (
            <ReadingInstructions onStart={handleContinue} examTitle={exam?.title} />
          ) : (
            <ListeningInstructions onStart={handleContinue} examTitle={exam?.title} />
          )
        )}
        {currentScreen === 'test' && (
          isReadingTest ? (
            <ReadingTest examId={examId} />
          ) : (
            <ListeningTest examId={examId} audioRef={audioRef} />
          )
        )}
      </main>
    </div>
  );
}