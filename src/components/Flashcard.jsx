import React, { useState, useEffect } from "react";

const Flashcard = ({ 
  word, 
  index, 
  total, 
  onNext, 
  onPrev, 
  userInput, 
  onInputChange, 
  isCardChecked,
  onCheckAnswer,
  currentScore,
  totalScore,
  sourceLanguage = "English",
  targetLanguage = "Spanish"
}) => {
  const [imageUrl, setImageUrl] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [showDefinition, setShowDefinition] = useState(false);

  // Get image for the word (optional)
  useEffect(() => {
    const imageMap = {
      "hello": "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=500&h=300&fit=crop",
      "goodbye": "https://images.unsplash.com/photo-1529254479751-fbacb4c7a587?w=500&h=300&fit=crop",
      "thank you": "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=500&h=300&fit=crop",
      "please": "https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=500&h=300&fit=crop",
      "yes": "https://images.unsplash.com/photo-1543165365-072d2c432d4d?w=500&h=300&fit=crop",
      "no": "https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=500&h=300&fit=crop",
      "water": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop",
      "food": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=300&fit=crop",
      "house": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=500&h=300&fit=crop",
      "friend": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&h=300&fit=crop"
    };
    
    // Use the key to get image
    const imageKey = word.key || word.en?.toLowerCase();
    setImageUrl(imageMap[imageKey] || "");
  }, [word]);

  // Check if answer is correct - only when this card is checked
  useEffect(() => {
    if (isCardChecked && userInput) {
      setIsCorrect(userInput.trim().toLowerCase() === word.target.toLowerCase());
    } else {
      setIsCorrect(null);
    }
  }, [isCardChecked, userInput, word.target]);

  const handleInputChange = (e) => {
    onInputChange(e.target.value);
  };

  const handleCheckClick = () => {
    if (userInput.trim() && !isCardChecked) {
      onCheckAnswer(index);
    }
  };

  const percentage = totalScore > 0 ? Math.round((currentScore / totalScore) * 100) : 0;

  // Get level color
  const getLevelColor = (level) => {
    const colors = {
      'A1': '#48bb78',
      'A2': '#38a169',
      'B1': '#d69e2e',
      'B2': '#ed8936',
      'C1': '#e53e3e',
      'C2': '#9b2c2c'
    };
    return colors[level] || '#4299e1';
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      'connectors': '🔗',
      'places': '📍',
      'abstract': '💭',
      'daily life': '🏠',
      'people': '👥',
      'communication': '💬',
      'emotions': '😊',
      'time': '⏰',
      'transport': '🚗',
      'art': '🎨',
      'animals': '🐾',
      'food': '🍎',
      'clothes & accessories': '👕',
      'body': '💪',
      'travel': '✈️',
      'education': '🎓',
      'sport': '⚽',
      'money': '💰',
      'household': '🏡',
      'colors': '🎨',
      'relationships': '❤️',
      'work': '💼',
      'technology': '💻',
      'weather': '☀️',
      'drinks': '🥤',
      'numbers': '🔢',
      'health': '🏥',
      'nature': '🌿',
      'geography': '🗺️',
      'plants': '🌱',
      'environment': '🌍',
      'astronomy': '✨',
      'science': '🔬'
    };
    return icons[category] || '📚';
  };

  return (
    <div className="flashcard-container">
      <div className="flashcard-main">
        {/* Header with metadata */}
        <div className="flashcard-header">
          <div className="word-metadata">
            {word.metadata?.level && (
              <span 
                className="word-level" 
                style={{ backgroundColor: getLevelColor(word.metadata.level) }}
              >
                Level: {word.metadata.level}
              </span>
            )}
            {word.metadata?.category && (
              <span className="word-category">
                {getCategoryIcon(word.metadata.category)} {word.metadata.category}
              </span>
            )}
            {word.metadata?.type && (
              <span className="word-type">
                {word.metadata.type}
              </span>
            )}
          </div>
          
          {/* Mini Score Display */}
          <div className="mini-score">
            <span className="mini-score-correct">{currentScore}</span>
            <span className="mini-score-total">/ {totalScore}</span>
            <span className="mini-score-percentage">({percentage}%)</span>
          </div>
        </div>

        {/* Image Section (Optional) */}
        {imageUrl && (
          <div className="image-section">
            <img 
              src={imageUrl} 
              alt={word.source}
              className="word-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Word and Definition */}
        <div className="word-content">
          <div className="source-word-section">
            <div className="source-label">{sourceLanguage.toUpperCase()}</div>
            <div className="source-word">{word.source}</div>
            
            {/* Definition Toggle */}
            {word.metadata?.definition && (
              <div className="definition-section">
                <button 
                  className="definition-toggle"
                  onClick={() => setShowDefinition(!showDefinition)}
                >
                  {showDefinition ? '📖 Hide Definition' : '📖 Show Definition'}
                </button>
                {showDefinition && (
                  <div className="definition-content">
                    <strong>Definition:</strong> {word.metadata.definition}
                    {word.metadata.sentence && (
                      <>
                        <br />
                        <strong>Example:</strong> {word.metadata.sentence}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Target Language Input */}
          <div className="target-input-section">
            <div className="target-label">{targetLanguage.toUpperCase()} TRANSLATION</div>
            <div className="target-input-container">
              <input
                type="text"
                value={userInput}
                onChange={handleInputChange}
                placeholder="Type the translation..."
                className={`target-input ${isCorrect === true ? 'correct' : isCorrect === false ? 'incorrect' : ''}`}
                disabled={isCardChecked}
              />
              {isCorrect !== null && (
                <div className="check-icon">
                  {isCorrect ? '✅' : '❌'}
                </div>
              )}
            </div>
            
            {/* Answer Feedback */}
            {isCardChecked && isCorrect === false && (
              <div className="correct-answer-feedback">
                <span className="feedback-label">Correct answer:</span>
                <span className="correct-answer">{word.target}</span>
              </div>
            )}
            
            {/* Check Answer Button */}
            <button 
              className="check-answer-btn"
              onClick={handleCheckClick}
              disabled={!userInput.trim() || isCardChecked}
            >
              <span>✅</span> {isCardChecked ? 'Checked' : 'Check Answer'}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flashcard-nav">
        <button 
          className="nav-btn"
          onClick={onPrev}
          disabled={index === 0}
        >
          ◀
        </button>
        
        <div className="card-counter">
          Card {index + 1} of {total}
          {word.metadata && (
            <div className="card-metadata">
              <span className="card-level" style={{ color: getLevelColor(word.metadata.level) }}>
                {word.metadata.level}
              </span>
              {word.metadata.category && (
                <span className="card-category">
                  • {word.metadata.category}
                </span>
              )}
            </div>
          )}
        </div>
        
        <button 
          className="nav-btn"
          onClick={onNext}
          disabled={index === total - 1}
        >
          ▶
        </button>
      </div>
    </div>
  );
};

export default Flashcard;