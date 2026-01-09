import React from "react";

const Wordflow = ({ words, answers, onChange, checked }) => {
  return (
    <div>
      <h2 className="section-header">Translate these words from English to Spanish:</h2>
      
      <div>
        {words.map((word, index) => {
          const userAnswer = answers[index] || "";
          const isCorrect = userAnswer.trim().toLowerCase() === word.es.toLowerCase();
          
          return (
            <div key={word.id} className="word-item">
              <div className="english-word">{word.en}</div>
              <span className="word-number">
                <a href={`#word-${index + 1}`}>Word {index + 1} of {words.length}</a>
              </span>
              
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => onChange(index, e.target.value)}
                disabled={checked}
                placeholder="Type Spanish translation..."
                className="text-input"
                id={`word-${index + 1}`}
              />
              
              {checked && (
                <div className={`feedback ${isCorrect ? 'correct-feedback' : 'incorrect-feedback'}`}>
                  {isCorrect ? (
                    <span>
                      <span className="checkmark">✓</span> Correct! "{word.en}" = "{word.es}"
                    </span>
                  ) : (
                    <span>
                      <span className="x-mark">✗</span>{" "}
                      {userAnswer.trim() 
                        ? `You wrote: "${userAnswer}" - Correct is: "${word.es}"`
                        : `You didn't answer - Correct is: "${word.es}"`
                      }
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wordflow;