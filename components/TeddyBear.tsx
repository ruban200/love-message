
import React from 'react';

interface TeddyBearProps {
  mood?: 'happy' | 'shy' | 'love';
  className?: string;
}

const TeddyBear: React.FC<TeddyBearProps> = ({ mood = 'happy', className = "" }) => {
  return (
    <div className={`relative flex justify-center items-center ${className}`}>
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Ears */}
        <circle cx="60" cy="60" r="25" fill="#B08968" />
        <circle cx="140" cy="60" r="25" fill="#B08968" />
        <circle cx="60" cy="60" r="15" fill="#DDB892" />
        <circle cx="140" cy="60" r="15" fill="#DDB892" />
        
        {/* Head */}
        <circle cx="100" cy="110" r="60" fill="#B08968" />
        
        {/* Muzzle */}
        <ellipse cx="100" cy="130" rx="25" ry="20" fill="#DDB892" />
        <path d="M90 135C90 140 110 140 110 135" stroke="#7F5539" strokeWidth="2" strokeLinecap="round" />
        <circle cx="100" cy="122" r="6" fill="#7F5539" />
        
        {/* Eyes */}
        <circle cx="75" cy="105" r="5" fill="#333" className="teddy-blink" />
        <circle cx="125" cy="105" r="5" fill="#333" className="teddy-blink" />
        
        {/* Cheeks */}
        {mood !== 'happy' && (
          <>
            <circle cx="65" cy="125" r="8" fill="#FFB3C1" opacity="0.6" />
            <circle cx="135" cy="125" r="8" fill="#FFB3C1" opacity="0.6" />
          </>
        )}

        {mood === 'love' && (
           <path d="M100 160 Q110 150 120 160 T140 160" stroke="#ff4d6d" strokeWidth="3" fill="none" />
        )}
      </svg>
      {mood === 'love' && (
         <div className="absolute top-0 right-0 animate-bounce text-4xl">💖</div>
      )}
    </div>
  );
};

export default TeddyBear;
