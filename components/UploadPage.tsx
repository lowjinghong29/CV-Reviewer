import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AppMode } from '../types';
import { Upload, FileText, Image as ImageIcon, Wind, AlertTriangle } from 'lucide-react';
import Spinner from './Spinner';

interface UploadPageProps {
  mode: AppMode;
  onCvUpload: (file: File) => void;
  onImageAnalyze: (file: File, prompt: string) => void;
  isLoading: boolean;
  error: string | null;
  imageAnalysisResult: string | null;
}

const UploadPage: React.FC<UploadPageProps> = ({
  mode,
  onCvUpload,
  onImageAnalyze,
  isLoading,
  error,
  imageAnalysisResult,
}) => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (file) {
      if (mode === 'cv') {
        onCvUpload(file);
      } else {
        onImageAnalyze(file, prompt);
      }
    }
  };
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const acceptedCvTypes = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const acceptedImageTypes = 'image/jpeg,image/png,image/webp';

  const renderCvUploader = () => (
    <>
      <p className="text-center text-gray-400 mb-6">
        {t('upload.cv.description')}
      </p>
      {renderDropzone(acceptedCvTypes)}
      <button
        onClick={handleSubmit}
        disabled={!file || isLoading}
        data-onboarding="upload-button"
        className="w-full mt-6 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg"
      >
        {isLoading ? <><Spinner /><span className="ml-2">{t('upload.cv.loading')}</span></> : <><Wind className="mr-2" /> {t('upload.cv.button')}</>}
      </button>
    </>
  );

  const renderImageAnalyzer = () => (
    <>
      <p className="text-center text-gray-400 mb-6">
        {t('upload.image.description')}
      </p>
      {renderDropzone(acceptedImageTypes)}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={t('upload.image.placeholder')}
        className="w-full mt-4 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
        rows={3}
      />
      <button
        onClick={handleSubmit}
        disabled={!file || !prompt || isLoading}
        className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg"
      >
        {isLoading ? <><Spinner /><span className="ml-2">{t('upload.image.loading')}</span></> : <><ImageIcon className="mr-2" /> {t('upload.image.button')}</>}
      </button>
      {imageAnalysisResult && (
        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">{t('upload.image.resultTitle')}</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{imageAnalysisResult}</p>
        </div>
      )}
    </>
  );
  
  const renderDropzone = (acceptedTypes: string) => (
    <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={openFilePicker}
        data-onboarding="upload-area"
        className={`relative p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${dragActive ? 'border-blue-500 bg-gray-700/50' : 'border-gray-600 hover:border-blue-400'}`}
      >
        <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept={acceptedTypes}
        />
        <div className="flex flex-col items-center justify-center text-gray-400">
            <Upload size={48} className="mb-4 text-gray-500"/>
            {file ? (
                <div className="text-center">
                    <p className="font-semibold text-blue-300 break-all">{file.name}</p>
                    <p className="text-sm">({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
                </div>
            ) : (
                <p>{t('upload.dropzone')}</p>
            )}
        </div>
    </div>
  );

  return (
    <div className="w-full">
      {mode === 'cv' ? renderCvUploader() : renderImageAnalyzer()}
      {error && (
        <div className="mt-6 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg flex items-center">
          <AlertTriangle className="mr-3"/>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default UploadPage;