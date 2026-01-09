import React from "react";

const Score = ({ correctCount, total, onCheckAnswers, onReset, checked }) => {
  const percentage = total > 0 ? (correctCount / total) * 100 : 0;
  
  let message = "Fill in all translations then check your answers";
  if (checked) {
    if (correctCount === total) {
      message = "🎉 Perfect score! Well done!";
    } else if (correctCount >= total * 0.7) {
      message = "👍 Good job! Keep practicing!";
    } else {
      message = "💪 Keep learning! Practice makes perfect!";
    }
  }
  
  return (
    <div>
      <div className="score-card">
        <div className="score-header">
          <h3>Your Score</h3>
          <div className="score-number">{correctCount} / {total}</div>
          <div className="score-percentage">{percentage.toFixed(0)}% correct</div>
        </div>
        
        <div className="progress-container">
          <div 
            className="progress-bar"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        
        <div className="progress-labels">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
        
        <div className="button-group">
          {!checked ? (
            <button
              onClick={onCheckAnswers}
              className="btn btn-primary"
            >
              Check Answers
            </button>
          ) : (
            <button
              onClick={onReset}
              className="btn btn-success"
            >
              Try Again
            </button>
          )}
          
          <div className="message">
            {message}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Score;