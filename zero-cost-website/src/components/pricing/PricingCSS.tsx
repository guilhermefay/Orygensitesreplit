
import React from "react";

const PricingCSS: React.FC = () => {
  return (
    <style>{`
      @keyframes float {
        0% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
        100% {
          transform: translateY(0px);
        }
      }
      
      .animated-ad {
        animation: float 4s ease-in-out infinite;
        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
      }
      
      .animated-border {
        box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.5);
      }
      
      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.05);
          opacity: 0.9;
        }
      }
      
      .pulse-button {
        animation: pulse 2s infinite;
        box-shadow: 0 0 0 0 rgba(0, 0, 0, 1);
      }
      
      @keyframes strikethrough {
        from { width: 0; }
        to { width: 100%; }
      }
      
      .strikethrough-animation {
        animation: strikethrough 1s ease-in-out forwards;
      }
      
      @keyframes glow {
        0%, 100% {
          box-shadow: 0 0 5px rgba(76, 175, 80, 0.6);
        }
        50% {
          box-shadow: 0 0 15px rgba(76, 175, 80, 0.8);
        }
      }
      
      .hover-glow:hover {
        animation: glow 1.5s ease-in-out infinite;
      }
      
      /* Gooey effect for premium blob */
      .premium-blob-gooey {
        filter: blur(40px) contrast(150%);
        mix-blend-mode: screen;
        transform-origin: center;
        transition: all 0.3s ease;
      }
      
      /* 3D sphere effect for free plan */
      .free-sphere-3d {
        background: radial-gradient(circle at 30% 30%, #e0e0e0 0%, #a9a9a9 70%, #808080 100%);
        box-shadow: 
          inset 2px 2px 10px rgba(255,255,255,0.5), 
          inset -2px -2px 10px rgba(0,0,0,0.2),
          0 8px 24px rgba(0,0,0,0.1);
      }
      
      /* Animated gradient text for the annual plan */
      @keyframes gradient-animation {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
      
      .animated-gradient-text {
        background: linear-gradient(90deg, #E7FF36, #FFFFFF, #B4FF85);
        background-size: 200% auto;
        color: transparent;
        -webkit-background-clip: text;
        background-clip: text;
        animation: gradient-animation 3s ease infinite;
        text-shadow: 0 0 10px rgba(231, 255, 54, 0.3);
      }
    `}</style>
  );
};

export default PricingCSS;
