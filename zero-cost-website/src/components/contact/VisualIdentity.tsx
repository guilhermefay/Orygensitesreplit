import React from 'react';
import { Trash2, Upload, PlusCircle } from 'lucide-react';
import { ContactFormData, FileData } from './types';
import { useLanguage } from '@/contexts/LanguageContext';

interface VisualIdentityProps {
  formData: ContactFormData;
  files: FileData;
  colorPalette: string[];
  handleColorChange: (index: number, value: string) => void;
  handleFileChange: (type: 'photos' | 'logo', e: React.ChangeEvent<HTMLInputElement>) => void;
  setFiles: React.Dispatch<React.SetStateAction<FileData>>;
  addColor: () => void;
  removeColor: (index: number) => boolean;
}

const VisualIdentity: React.FC<VisualIdentityProps> = ({
  formData,
  files,
  colorPalette,
  handleColorChange,
  handleFileChange,
  setFiles,
  addColor,
  removeColor,
}) => {
  const { language } = useLanguage();
  
  const removeFile = (type: 'photos' | 'logo', index?: number) => {
    if (type === 'photos' && typeof index === 'number' && files.photos) {
      const newPhotos = [...files.photos];
      newPhotos.splice(index, 1);
      setFiles({ ...files, photos: newPhotos.length ? newPhotos : null });
    } else if (type === 'logo' && files.logo) {
      setFiles({ ...files, logo: null });
    }
  };
  
  const renderPhotoPreview = () => {
    if (!files.photos || files.photos.length === 0) return null;
    
    return (
      <div className="grid grid-cols-3 gap-2 mt-3">
        {files.photos.map((file, index) => (
          <div key={index} className="relative group overflow-hidden rounded-lg">
            <img 
              src={URL.createObjectURL(file)} 
              alt={`${language === 'en' ? 'Photo' : 'Foto'} ${index + 1}`} 
              className="w-full h-20 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                className="bg-red-500 text-white rounded-full p-1 transform transition-transform duration-300 hover:scale-110"
                onClick={() => removeFile('photos', index)}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLogoPreview = () => {
    if (!files.logo) return null;
    
    return (
      <div className="mt-3">
        <div className="relative group inline-block overflow-hidden rounded-lg bg-gray-50 p-2 border border-gray-200">
          <img 
            src={URL.createObjectURL(files.logo)} 
            alt={`Logo`} 
            className="h-16 object-contain rounded-md transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              className="bg-red-500 text-white rounded-full p-1 transform transition-transform duration-300 hover:scale-110"
              onClick={() => removeFile('logo')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-full mx-auto p-4 animate-fade-in">
      <h3 className="text-2xl font-bold mb-6 text-center text-gray-900">
        {language === 'en' ? 'Visual Identity' : 'Identidade Visual'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
          <h4 className="font-medium text-base mb-4 flex items-center">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white mr-2">
              <span className="text-sm">1</span>
            </div>
            {language === 'en' ? 'Select your website colors' : 'Selecione as cores do seu site'}
          </h4>
          
          <div className="space-y-4">
            {colorPalette.map((color, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  style={{ backgroundColor: color || '#FFFFFF' }}
                >
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    className="w-12 h-12 cursor-pointer opacity-0"
                  />
                </div>
                <span className={`text-sm ${index < 2 ? 'font-medium' : ''}`}>
                  {language === 'en' ? 
                    (index === 0 ? 'Color 1' : 
                     index === 1 ? 'Color 2' : 
                     index === 2 ? 'Color 3' : 
                     `Color ${index + 1}`) : 
                    (index === 0 ? 'Cor 1' : 
                     index === 1 ? 'Cor 2' : 
                     index === 2 ? 'Cor 3' : 
                     `Cor ${index + 1}`)}
                </span>
                {index > 1 && (
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                    onClick={() => removeColor(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            
            {colorPalette.length < 5 && (
              <button
                type="button"
                className="text-sm flex items-center px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                onClick={addColor}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Add another color' : 'Adicionar outra cor'}
              </button>
            )}
          </div>
        </div>
        
        <div className="md:col-span-4 bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
          <h4 className="font-medium text-base mb-4 flex items-center">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white mr-2">
              <span className="text-sm">2</span>
            </div>
            {language === 'en' ? 'Add your logo' : 'Adicione seu logo'}
          </h4>
          
          <div>
            <label className="flex flex-col items-center px-4 py-6 bg-gray-50 text-blue-500 rounded-lg border border-dashed border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors">
              <Upload className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">
                {language === 'en' ? 'Select your logos' : 'Selecione seus logos'}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {language === 'en' ? 'PNG, JPG or SVG (max. 10MB)' : 'PNG, JPG ou SVG (max. 10MB)'}
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange('logo', e)}
              />
            </label>
            {renderLogoPreview()}
          </div>
        </div>
        
        <div className="md:col-span-4 bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
          <h4 className="font-medium text-base mb-4 flex items-center">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white mr-2">
              <span className="text-sm">3</span>
            </div>
            {language === 'en' ? 'Add photos to use on your site' : 'Adicione fotos para usar no site'}
          </h4>
          
          <div>
            <label className="flex flex-col items-center px-4 py-6 bg-gray-50 text-blue-500 rounded-lg border border-dashed border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors">
              <Upload className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">
                {language === 'en' ? 'Select your photos' : 'Selecione suas fotos'}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {language === 'en' ? 'PNG or JPG (max. 10MB)' : 'PNG ou JPG (max. 10MB)'}
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange('photos', e)}
              />
            </label>
            {renderPhotoPreview()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualIdentity;
