
import React, { useState, useEffect } from 'react';
import { ContactFormData } from './types';
import { User, Mail, MessageCircle, AlertTriangle, Check } from 'lucide-react';
import { validateName, validateEmail, validatePhone, formatPhone } from './utils/inputValidation';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContactInfoProps {
  formData: ContactFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ formData, handleChange }) => {
  const { translate, language } = useLanguage();
  const [validations, setValidations] = useState({
    name: false,
    email: false,
    phone: false
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Custom handler for phone input with formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhone(e.target.value);
    const syntheticEvent = {
      ...e,
      target: { ...e.target, value: formattedValue, name: 'phone' }
    };
    handleChange(syntheticEvent);
  };

  // Update validations when form data changes
  useEffect(() => {
    const nameValid = validateName(formData.name);
    const emailValid = validateEmail(formData.email);
    const phoneValid = validatePhone(formData.phone);
    
    setValidations({
      name: nameValid,
      email: emailValid,
      phone: phoneValid
    });
  }, [formData.name, formData.email, formData.phone]);

  return (
    <div className="animate-fade-in max-w-xl mx-auto">
      <h3 className="text-2xl font-bold mb-6 text-center text-gray-900">
        {translate('form.contactInfo')}
      </h3>
      
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="space-y-5">
          {/* Name field */}
          <div className="relative">
            <label htmlFor="name" className="block text-base font-semibold text-gray-900 mb-2">
              {translate('form.fullName')}*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User size={18} className={`${focusedField === 'name' ? 'text-highlight' : 'text-gray-400'} transition-colors duration-200`} />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                className={cn(
                  "w-full pl-10 pr-8 py-3 border-2 rounded-lg",
                  "bg-white",
                  "transition-all duration-200",
                  "hover:border-gray-300",
                  focusedField === 'name' ? "border-highlight ring-2 ring-highlight/20" : "border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-200",
                  validations.name ? "border-green-200" : ""
                )}
                placeholder={language === 'en' ? "Enter your full name" : "Digite seu nome completo"}
              />
              {validations.name && (
                <Check className="absolute right-3 top-3.5 text-green-500 animate-scale-in" size={18} />
              )}
            </div>
          </div>
          
          {/* Email field */}
          <div className="relative">
            <label htmlFor="email" className="block text-base font-semibold text-gray-900 mb-2">
              {translate('form.email')}*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail size={18} className={`${focusedField === 'email' ? 'text-highlight' : 'text-gray-400'} transition-colors duration-200`} />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className={cn(
                  "w-full pl-10 pr-8 py-3 border-2 rounded-lg",
                  "bg-white",
                  "transition-all duration-200",
                  "hover:border-gray-300",
                  focusedField === 'email' ? "border-highlight ring-2 ring-highlight/20" : "border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-200",
                  validations.email ? "border-green-200" : ""
                )}
                placeholder={language === 'en' ? "Enter your best email" : "Digite seu melhor e-mail"}
              />
              {validations.email && (
                <Check className="absolute right-3 top-3.5 text-green-500 animate-scale-in" size={18} />
              )}
            </div>
          </div>
          
          {/* Phone field */}
          <div className="relative">
            <label htmlFor="phone" className="block text-base font-semibold text-gray-900 mb-2">
              {translate('form.whatsapp')}*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MessageCircle size={18} className={`${focusedField === 'phone' ? 'text-highlight' : 'text-gray-400'} transition-colors duration-200`} />
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handlePhoneChange}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                className={cn(
                  "w-full pl-10 pr-8 py-3 border-2 rounded-lg",
                  "bg-white",
                  "transition-all duration-200",
                  "hover:border-gray-300",
                  focusedField === 'phone' ? "border-highlight ring-2 ring-highlight/20" : "border-gray-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-200",
                  validations.phone ? "border-green-200" : ""
                )}
                placeholder="(00) 00000-0000"
              />
              {validations.phone && (
                <Check className="absolute right-3 top-3.5 text-green-500 animate-scale-in" size={18} />
              )}
            </div>
            <div className="mt-3 p-3 bg-amber-50 rounded-lg flex items-start gap-2 border border-amber-100">
              <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                {translate('form.whatsappWarning')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
