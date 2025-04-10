
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  endDate?: Date;
  hours?: number;
  minutes?: number;
  seconds?: number;
  className?: string;
}

const CountdownTimer = ({ endDate, hours = 0, minutes = 0, seconds = 0, className = "" }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      // If endDate is provided, calculate time difference from now
      if (endDate) {
        const difference = endDate.getTime() - new Date().getTime();
        
        if (difference <= 0) {
          return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
          };
        }
        
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      } 
      // If individual units are provided, use them directly
      else {
        // Create date object for the target time
        const now = new Date();
        const target = new Date(now);
        target.setHours(now.getHours() + hours);
        target.setMinutes(now.getMinutes() + minutes);
        target.setSeconds(now.getSeconds() + seconds);
        
        const difference = target.getTime() - now.getTime();
        
        if (difference <= 0) {
          return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
          };
        }
        
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
    };
    
    // Set initial time
    setTimeLeft(calculateTimeLeft());
    
    // Update time every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [endDate, hours, minutes, seconds]);
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {timeLeft.days > 0 && (
        <>
          <span className="font-mono font-bold">{timeLeft.days.toString().padStart(2, '0')}</span>
          <span className="font-mono font-bold">:</span>
        </>
      )}
      <span className="font-mono font-bold">{timeLeft.hours.toString().padStart(2, '0')}</span>
      <span className="font-mono font-bold">:</span>
      <span className="font-mono font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
      <span className="font-mono font-bold">:</span>
      <span className="font-mono font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</span>
    </div>
  );
};

export default CountdownTimer;
