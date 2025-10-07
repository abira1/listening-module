import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Link as LinkIcon, Music, AlertCircle, CheckCircle, ArrowLeft, Loader } from 'lucide-react';
import { BackendService } from '../../services/BackendService';
import { AudioService } from '../../services/AudioService';
import { useToast } from '../common/Toast';

export function AudioUpload() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadMethod, setUploadMethod] = useState('local');
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    const loadExam = async () => {
      if (examId) {
        try {
          const examData = await FirebaseService.getExam(examId);
          if (examData) {
            setExam(examData);
            if (examData.audio_url) {
              setAudioUrl(examData.audio_url);
              setUploadMethod(examData.audio_source_method || 'url');
              setUploadSuccess(true);
            }
          } else {
            showToast('Test not found', 'error');
            navigate('/admin/tests');
          }
        } catch (error) {
          console.error('Error loading exam:', error);
          showToast('Error loading test', 'error');
        } finally {
          setLoading(false);
        }
      }
    };

    loadExam();
  }, [examId, navigate, showToast]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setErrors({});
    } else {
      setAudioFile(null);
      setErrors({ file: 'Please select a valid audio file' });
    }
  };

  const handleUrlChange = (e) => {
    setAudioUrl(e.target.value);
    if (errors.url) {
      setErrors({ ...errors, url: '' });
    }
  };

  const validateUrl = () => {
    if (!audioUrl) {
      setErrors({ ...errors, url: 'Please enter an audio URL' });
      return false;
    }
    try {
      new URL(audioUrl);
      return true;
    } catch (error) {
      setErrors({ ...errors, url: 'Please enter a valid URL' });
      return false;
    }
  };

  const handleUpload = async () => {
    if (uploadMethod === 'local' && !audioFile) {
      setErrors({ file: 'Please select an audio file to upload' });
      return;
    }
    if (uploadMethod === 'url' && !validateUrl()) {
      return;
    }

    setIsUploading(true);
    setErrors({});

    try {
      let finalAudioUrl = audioUrl;
      if (uploadMethod === 'local' && audioFile) {
        finalAudioUrl = await AudioService.uploadLocalAudio(audioFile);
      } else if (uploadMethod === 'url') {
        const isValid = await AudioService.validateAudioUrl(audioUrl);
        if (!isValid) {
          setErrors({ url: 'The provided URL is not accessible' });
          setIsUploading(false);
          return;
        }
      }

      const updatedExam = await FirebaseService.uploadAudio(examId, finalAudioUrl, uploadMethod);
      if (updatedExam) {
        setExam(updatedExam);
        setUploadSuccess(true);
        showToast('Audio uploaded successfully', 'success');
        setTimeout(() => {
          navigate(`/admin/tests/${examId}/questions`);
        }, 2000);
      } else {
        setErrors({ submit: 'Failed to update test with audio URL' });
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
      setErrors({ submit: 'An error occurred during upload. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/tests');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />
      <div className="mb-6">
        <button onClick={handleBack} className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Tests
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mt-2">
          {uploadSuccess ? 'Audio Uploaded' : 'Upload Audio'}
        </h2>
        <p className="text-gray-600">{exam?.title}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {uploadSuccess ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Audio Uploaded Successfully</h3>
            <p className="text-gray-600 mb-6">Your test audio has been uploaded and is ready to use.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate(`/admin/tests/${examId}/questions`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Manage Questions
              </button>
              <button onClick={() => setUploadSuccess(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                Change Audio
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-700 mb-4">Upload audio for your IELTS Listening test. The audio will be played during the test.</p>
              <div className="flex border-b border-gray-200">
                <button
                  className={`py-2 px-4 ${uploadMethod === 'local' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setUploadMethod('local')}
                >
                  Upload File
                </button>
                <button
                  className={`py-2 px-4 ${uploadMethod === 'url' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setUploadMethod('url')}
                >
                  External URL
                </button>
              </div>
            </div>

            {uploadMethod === 'local' ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Audio File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                  {audioFile ? (
                    <div className="flex flex-col items-center">
                      <Music className="w-8 h-8 text-blue-500 mb-2" />
                      <p className="text-sm font-medium text-gray-800">{audioFile.name}</p>
                      <p className="text-xs text-gray-500">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      <button onClick={() => setAudioFile(null)} className="mt-2 text-sm text-red-600 hover:text-red-800">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-800">Drag and drop your audio file here, or</p>
                      <label className="mt-2 cursor-pointer">
                        <span className="text-sm text-blue-600 hover:text-blue-800">Browse files</span>
                        <input type="file" className="hidden" accept="audio/*" onChange={handleFileChange} />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Supported formats: MP3, WAV, M4A (max 100MB)</p>
                    </div>
                  )}
                </div>
                {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Audio URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LinkIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={audioUrl}
                    onChange={handleUrlChange}
                    className={`w-full pl-10 pr-4 py-2 border ${errors.url ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="https://example.com/audio.mp3"
                  />
                </div>
                {errors.url ? (
                  <p className="mt-1 text-sm text-red-600">{errors.url}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">Enter a direct URL to an audio file (MP3, WAV, M4A)</p>
                )}
              </div>
            )}

            {errors.submit && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md flex items-center mb-4">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{errors.submit}</span>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button onClick={handleBack} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50" disabled={isUploading}>
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {isUploading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Audio
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}