import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const languages = [
    { code: 'en', name: 'EN' },
    { code: 'zh', name: '中文' },
  ];

  return (
    <div className="flex items-center space-x-1 bg-gray-700/50 p-1 rounded-full border border-gray-600">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-300 ${
            i18n.language.startsWith(lang.code)
              ? 'bg-blue-500 text-white'
              : 'text-gray-300 hover:bg-gray-600'
          }`}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
