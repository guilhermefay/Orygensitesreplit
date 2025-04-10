
import React from 'react';
import {
  PageFormatter,
  SectionFormatter,
  ImageSuggestionFormatter,
  TitleFormatter,
  DescriptionFormatter,
  CTAFormatter,
  HighlightFormatter,
  BulletFormatter,
  QuestionFormatter,
  AnswerFormatter,
  ImpactFormatter,
  ParagraphFormatter,
  SpaceFormatter,
  CalloutFormatter
} from './content-formatters';

interface ContentFormatterProps {
  content: string;
}

const ContentFormatter: React.FC<ContentFormatterProps> = ({ content }) => {
  const formatContent = (content: string): JSX.Element[] => {
    const lines = content.split('\n');
    const result: JSX.Element[] = [];
    
    let currentPageIndex = -1;
    let lastLineWasQuestion = false;
    let inCalloutSection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detectar páginas
      if (line.includes('==== PÁGINA:')) {
        currentPageIndex++;
        result.push(
          <PageFormatter 
            key={`page-${currentPageIndex}`} 
            line={line} 
            currentPageIndex={currentPageIndex} 
          />
        );
        continue;
      }
      
      // Detectar seções
      if (line.startsWith('SEÇÃO:') || line.includes('- SEÇÃO:')) {
        result.push(
          <SectionFormatter key={`section-${i}`} line={line} />
        );
        inCalloutSection = false;
        continue;
      }
      
      // Detectar sugestões de imagens
      if (line.includes('SUGESTÃO DE IMAGEM:')) {
        const imageDesc = line.replace('SUGESTÃO DE IMAGEM:', '').trim();
        if (imageDesc) {
          result.push(
            <ImageSuggestionFormatter key={`image-${i}`} line={line} />
          );
          continue;
        }
      }
      
      // Detectar títulos
      if (line.startsWith('TÍTULO:')) {
        result.push(
          <TitleFormatter key={`title-${i}`} line={line} />
        );
        inCalloutSection = false;
        continue;
      }
      
      // Detectar descrições
      if (line.startsWith('DESCRIÇÃO:')) {
        result.push(
          <DescriptionFormatter key={`desc-${i}`} line={line} />
        );
        inCalloutSection = false;
        continue;
      }
      
      // Detectar CTA ou botões
      if (line.startsWith('CTA:')) {
        result.push(
          <CTAFormatter key={`cta-${i}`} line={line} />
        );
        inCalloutSection = false;
        continue;
      }
      
      // Detectar frases de destaque iniciadas com símbolo
      if ((line.startsWith('✓') || line.startsWith('✔')) && line.length > 2) {
        result.push(
          <HighlightFormatter key={`highlight-${i}`} line={line} />
        );
        continue;
      }
      
      // Detectar bullet points ou listas
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.match(/^\d+\./)) {
        const bulletText = line.replace(/^[•\-*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
        
        if (bulletText) {
          result.push(
            <BulletFormatter key={`bullet-${i}`} line={line} index={i} />
          );
        }
        continue;
      }
      
      // Detectar perguntas ou frases interrogativas
      if (line.trim().endsWith('?')) {
        result.push(
          <QuestionFormatter key={`question-${i}`} line={line} />
        );
        lastLineWasQuestion = true;
        continue;
      }
      
      // Detectar resposta a uma pergunta
      if (lastLineWasQuestion && line) {
        result.push(
          <AnswerFormatter key={`answer-${i}`} line={line} />
        );
        lastLineWasQuestion = false;
        continue;
      }
      
      // Detectar frases de impacto (frases curtas sem pontuação final)
      if (line && line.length < 65 && !line.endsWith('.') && !line.includes('SEÇÃO') && !line.includes('PÁGINA') 
          && !line.startsWith('TÍTULO:') && !line.startsWith('DESCRIÇÃO:') && !line.startsWith('CTA:')) {
        result.push(
          <ImpactFormatter key={`impact-${i}`} line={line} currentPageIndex={currentPageIndex} />
        );
        continue;
      }
      
      // Detectar uma sequência de linhas curtas e transformá-las em uma callout section
      if (line && line.length < 100 && !lastLineWasQuestion && !inCalloutSection &&
          i < lines.length - 1 && lines[i+1].trim().length < 100) {
        result.push(
          <CalloutFormatter key={`callout-start-${i}`} line={line} />
        );
        inCalloutSection = true;
        continue;
      }
      
      // Continuar a callout section
      if (inCalloutSection && line && line.length < 100) {
        const prevElement = result[result.length - 1];
        // Adicionar à div da callout
        const newElement = (
          <CalloutFormatter key={`callout-${i}`} line={line} prevContent={prevElement.props.children} />
        );
        result[result.length - 1] = newElement;
        continue;
      } else {
        inCalloutSection = false;
      }
      
      // Parágrafos normais
      if (line && !line.startsWith('SEÇÃO:') && !line.includes('==== PÁGINA:')) {
        result.push(
          <ParagraphFormatter key={`para-${i}`} line={line} />
        );
        continue;
      }
      
      // Espaçamentos
      if (i > 0 && !lines[i-1].trim() && !line) {
        result.push(<SpaceFormatter key={`space-${i}`} />);
      }
    }
    
    return result;
  };

  return (
    <div className="prose prose-sm max-w-none">
      {formatContent(content)}
    </div>
  );
};

export default ContentFormatter;
