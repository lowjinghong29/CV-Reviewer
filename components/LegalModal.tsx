import React from 'react';
import { X } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

// A simple component to render markdown-like text safely.
// This is a basic implementation for this POC.
const SimpleMarkdownRenderer: React.FC<{ markdown: string }> = ({ markdown }) => {
    const sections = markdown.split(/(#+ .*\n)/).filter(Boolean);

    return (
        <div>
            {sections.map((section, index) => {
                if (section.startsWith('# ')) {
                    return <h1 key={index} className="text-2xl font-bold mt-6 mb-3 text-gray-100">{section.substring(2).trim()}</h1>;
                }
                if (section.startsWith('## ')) {
                    return <h2 key={index} className="text-xl font-bold mt-4 mb-2 text-gray-200">{section.substring(3).trim()}</h2>;
                }
                
                const paragraphs = section.split('\n').filter(p => p.trim() !== '');
                return paragraphs.map((para, pIndex) => {
                     if (para.trim().startsWith('*   ')) {
                        return <li key={`${index}-${pIndex}`} className="ml-6 list-disc text-gray-300">{para.trim().substring(4)}</li>;
                    }
                    return <p key={`${index}-${pIndex}`} className="mb-3 text-gray-300">{para}</p>
                });
            })}
        </div>
    );
};


const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        <div className="overflow-y-auto p-6">
            <SimpleMarkdownRenderer markdown={content} />
        </div>
      </div>
    </div>
  );
};

export default LegalModal;