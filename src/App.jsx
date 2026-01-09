import { useState, useEffect } from "react";
import { 
  languages, 
  getWordsForLanguages,
  levels,
  categories,
  getAvailableFilters
} from "./data/words";
import Flashcard from "./components/Flashcard";
import "./index.css";

export default function App() {
  // Language selection states
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [showLanguageSelection, setShowLanguageSelection] = useState(true);
  const [selectingFor, setSelectingFor] = useState(null);
  
  // Level and category selection
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Available filters (based on actual data)
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableLevels, setAvailableLevels] = useState([]);
  
  // Flashcard states
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [mode, setMode] = useState("flashcards");
  const [flashcardAnswers, setFlashcardAnswers] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [checkedCards, setCheckedCards] = useState([]);
  const [checkedQuiz, setCheckedQuiz] = useState(false);
  const [currentWords, setCurrentWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [filterInfo, setFilterInfo] = useState({});
  
  const sourceLangInfo = languages.find(lang => lang.id === sourceLanguage);
  const targetLangInfo = languages.find(lang => lang.id === targetLanguage);
  const progress = currentWords.length > 0 ? ((currentCardIndex + 1) / currentWords.length) * 100 : 0;
  const currentWord = currentWords[currentCardIndex];

  // Initialize with dynamic categories/levels
  useEffect(() => {
    console.log("📊 Dynamic categories:", categories.length, "categories loaded");
    console.log("📊 Dynamic levels:", levels.length, "levels loaded");
  }, []);

  // Load available filters when languages change
  useEffect(() => {
    const loadAvailableFilters = async () => {
      if (!showLanguageSelection) {
        console.log("📊 Loading available filters...");
        const filters = await getAvailableFilters(sourceLanguage, targetLanguage);
        console.log("✅ Available filters:", filters);
        setFilterInfo(filters);
        
        // Filter categories to only show those with data for this language pair
        const filteredCategories = categories.filter(cat => 
          cat.id === "all" || filters.categories.includes(cat.id)
        );
        setAvailableCategories(filteredCategories);
        
        // Filter levels to only show those with data for this language pair
        const filteredLevels = levels.filter(level => 
          level.id === "all" || filters.levels.includes(level.id)
        );
        setAvailableLevels(filteredLevels);
        
        // If current selections aren't available, reset to "all"
        if (selectedCategory !== "all" && !filters.categories.includes(selectedCategory)) {
          setSelectedCategory("all");
        }
        if (selectedLevel !== "all" && !filters.levels.includes(selectedLevel)) {
          setSelectedLevel("all");
        }
      }
    };
    
    if (!showLanguageSelection) {
      loadAvailableFilters();
    }
  }, [sourceLanguage, targetLanguage, showLanguageSelection]);

  // Fetch words when languages, level, or category changes
  useEffect(() => {
    const fetchWords = async () => {
      setLoading(true);
      console.log("🔄 Fetching concepts from local JSON files...");
      console.log("   Languages:", sourceLanguage, "→", targetLanguage);
      console.log("   Level:", selectedLevel);
      console.log("   Category:", selectedCategory);
      
      try {
        const words = await getWordsForLanguages(
          sourceLanguage, 
          targetLanguage, 
          selectedLevel, 
          selectedCategory
        );
        
        console.log(`✅ Fetched ${words.length} words/concepts`);
        
        if (words.length > 0) {
          setDataSource("local");
          console.log("📁 Data source: Local JSON");
        } else {
          setDataSource("empty");
          console.log("⚠️ No words found with current filters");
          
          // If no words with filters but we know there should be some, show warning
          if (filterInfo.totalWithTranslations > 0) {
            console.log(`ℹ️ There are ${filterInfo.totalWithTranslations} concepts available for ${sourceLanguage}→${targetLanguage}`);
            console.log(`   Available levels: ${filterInfo.levels.join(', ')}`);
            console.log(`   Available categories: ${filterInfo.categories.join(', ')}`);
          }
        }
        
        setCurrentWords(words);
        setWordCount(words.length);
        setFlashcardAnswers(Array(words.length).fill(""));
        setQuizAnswers(Array(words.length).fill(""));
        setCheckedCards(Array(words.length).fill(false));
        setCurrentCardIndex(0);
        
      } catch (error) {
        console.error("❌ Error fetching words:", error);
        setDataSource("error");
        setCurrentWords([]);
      } finally {
        setLoading(false);
      }
    };

    if (!showLanguageSelection) {
      fetchWords();
    }
  }, [sourceLanguage, targetLanguage, selectedLevel, selectedCategory, showLanguageSelection]);

  const handleFlashcardInputChange = (value) => {
    const newAnswers = [...flashcardAnswers];
    newAnswers[currentCardIndex] = value;
    setFlashcardAnswers(newAnswers);
  };

  const handleCheckCardAnswer = (cardIndex) => {
    const newChecked = [...checkedCards];
    newChecked[cardIndex] = true;
    setCheckedCards(newChecked);
  };

  const handleNext = () => {
    if (currentCardIndex < currentWords.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleReset = () => {
    setCurrentCardIndex(0);
    setFlashcardAnswers(Array(currentWords.length).fill(""));
    setQuizAnswers(Array(currentWords.length).fill(""));
    setCheckedCards(Array(currentWords.length).fill(false));
    setCheckedQuiz(false);
  };

  const handleCheckAllAnswers = () => {
    setCheckedCards(Array(currentWords.length).fill(true));
  };

  const handleQuizChange = (index, value) => {
    const newAnswers = [...quizAnswers];
    newAnswers[index] = value;
    setQuizAnswers(newAnswers);
  };

  const handleCheckQuiz = () => {
    setCheckedQuiz(true);
  };

  const handleResetQuiz = () => {
    setQuizAnswers(Array(currentWords.length).fill(""));
    setCheckedQuiz(false);
  };

  // Calculate scores
  const flashcardCorrectCount = currentWords.filter(
    (word, index) => flashcardAnswers[index]?.trim().toLowerCase() === word.target.toLowerCase()
  ).length;

  const checkedCardsCount = checkedCards.filter(Boolean).length;
  const flashcardScorePercentage = currentWords.length > 0 ? Math.round((flashcardCorrectCount / currentWords.length) * 100) : 0;

  const quizCorrectCount = currentWords.filter(
    (word, index) => quizAnswers[index]?.trim().toLowerCase() === word.target.toLowerCase()
  ).length;

  const handleLanguageSelect = (langId) => {
    if (selectingFor === 'source') {
      setSourceLanguage(langId);
    } else if (selectingFor === 'target') {
      setTargetLanguage(langId);
    }
    setSelectingFor(null);
  };

  const handleSwitchLanguages = () => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
  };

  const handleStartLearning = () => {
    setShowLanguageSelection(false);
  };

  const handleResetFilters = () => {
    setSelectedLevel("all");
    setSelectedCategory("all");
  };

  // Get level color - now uses the color from levels array
  const getLevelColor = (levelId) => {
    const level = levels.find(l => l.id === levelId);
    return level ? level.color : '#4299e1';
  };

  // Get category icon - now uses the icon from categories array
  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : '📚';
  };

  // Get category name
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'All Categories';
  };

  // Get level name
  const getLevelName = (levelId) => {
    const level = levels.find(l => l.id === levelId);
    return level ? level.name : 'All Levels';
  };

  if (showLanguageSelection) {
    return (
      <div className="app-container">
        <div className="main-card">
          <header className="header">
            <h1><span>🌍</span>Universal Language Learner</h1>
            <p className="subtitle">Learn any language from any language</p>
            <p className="subtitle-2">Flexible multilingual learning system</p>
            <div className="data-source-indicator" style={{ marginTop: '10px' }}>
              <span className="local-badge">
                📁 Local JSON Database ({categories.length - 1} categories, {levels.length - 1} levels)
              </span>
            </div>
          </header>

          {selectingFor ? (
            <div className="language-selection">
              <div className="language-title">
                Select {selectingFor === 'source' ? 'Source' : 'Target'} Language:
              </div>
              <div className="language-grid">
                {languages.map(language => (
                  <button
                    key={language.id}
                    className={`language-grid-btn ${
                      (selectingFor === 'source' && sourceLanguage === language.id) ||
                      (selectingFor === 'target' && targetLanguage === language.id)
                        ? 'selected' : ''
                    }`}
                    onClick={() => handleLanguageSelect(language.id)}
                  >
                    <span className="language-grid-flag">{language.flag}</span>
                    <span className="language-grid-name">{language.name}</span>
                    <span className="language-grid-native">{language.nativeName}</span>
                  </button>
                ))}
              </div>
              
              <button
                className="action-btn action-btn-secondary"
                onClick={() => setSelectingFor(null)}
                style={{ marginTop: '20px' }}
              >
                ← Back
              </button>
            </div>
          ) : (
            <>
              <div className="language-direction">
                <div className="language-selector">
                  <div className="language-selector-label">Learn From</div>
                  <button 
                    className="selected-language-display"
                    onClick={() => setSelectingFor('source')}
                  >
                    <span className="selected-language-flag">{sourceLangInfo?.flag}</span>
                    <span className="selected-language-name">{sourceLangInfo?.name}</span>
                    <span className="selected-language-native">{sourceLangInfo?.nativeName}</span>
                    <small style={{ color: '#718096', marginTop: '5px' }}>Click to change</small>
                  </button>
                </div>

                <div className="direction-arrow">→</div>

                <div className="language-selector">
                  <div className="language-selector-label">Learn To</div>
                  <button 
                    className="selected-language-display"
                    onClick={() => setSelectingFor('target')}
                  >
                    <span className="selected-language-flag">{targetLangInfo?.flag}</span>
                    <span className="selected-language-name">{targetLangInfo?.name}</span>
                    <span className="selected-language-native">{targetLangInfo?.nativeName}</span>
                    <small style={{ color: '#718096', marginTop: '5px' }}>Click to change</small>
                  </button>
                </div>

                <button 
                  className="switch-button"
                  onClick={handleSwitchLanguages}
                  title="Switch languages"
                >
                  🔄
                </button>
              </div>

              {/* Level Selection */}
              <div className="filter-section">
                <h3 className="filter-title">📊 Select Difficulty Level:</h3>
                <div className="filter-grid">
                  {availableLevels.length > 0 ? (
                    availableLevels.map(level => (
                      <button
                        key={level.id}
                        className={`level-btn ${selectedLevel === level.id ? 'active' : ''} ${
                          availableLevels.length > 0 && !availableLevels.some(l => l.id === level.id) && level.id !== 'all' ? 'unavailable' : ''
                        }`}
                        onClick={() => {
                          if (level.id === 'all' || availableLevels.some(l => l.id === level.id) || availableLevels.length === 0) {
                            setSelectedLevel(level.id);
                          }
                        }}
                        style={{
                          backgroundColor: selectedLevel === level.id ? level.color : '#f7fafc',
                          borderColor: level.color,
                          color: selectedLevel === level.id ? 'white' : level.color,
                          opacity: (availableLevels.length > 0 && !availableLevels.some(l => l.id === level.id) && level.id !== 'all') ? 0.5 : 1,
                          cursor: (availableLevels.length > 0 && !availableLevels.some(l => l.id === level.id) && level.id !== 'all') ? 'not-allowed' : 'pointer'
                        }}
                        title={
                          (availableLevels.length > 0 && !availableLevels.some(l => l.id === level.id) && level.id !== 'all') 
                            ? `No ${level.name} words available for ${sourceLangInfo?.name} → ${targetLangInfo?.name}` 
                            : ''
                        }
                      >
                        {level.name}
                      </button>
                    ))
                  ) : (
                    // Show all levels initially (before filter data loads)
                    levels.map(level => (
                      <button
                        key={level.id}
                        className={`level-btn ${selectedLevel === level.id ? 'active' : ''}`}
                        onClick={() => setSelectedLevel(level.id)}
                        style={{
                          backgroundColor: selectedLevel === level.id ? level.color : '#f7fafc',
                          borderColor: level.color,
                          color: selectedLevel === level.id ? 'white' : level.color
                        }}
                      >
                        {level.name}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Category Selection */}
              <div className="filter-section">
                <div className="filter-header">
                  <h3 className="filter-title">🏷️ Select Category:</h3>
                  <button 
                    className="toggle-filters-btn"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  >
                    {showAdvancedFilters ? 'Show Less' : 'Show All'} →
                  </button>
                </div>
                <div className="category-grid">
                  {(showAdvancedFilters ? 
                    (availableCategories.length > 0 ? availableCategories : categories) : 
                    (availableCategories.length > 0 ? availableCategories.slice(0, 8) : categories.slice(0, 8))
                  ).map(category => (
                    <button
                      key={category.id}
                      className={`category-btn ${selectedCategory === category.id ? 'active' : ''} ${
                        availableCategories.length > 0 && !availableCategories.some(c => c.id === category.id) && category.id !== 'all' ? 'unavailable' : ''
                      }`}
                      onClick={() => {
                        if (category.id === 'all' || availableCategories.some(c => c.id === category.id) || availableCategories.length === 0) {
                          setSelectedCategory(category.id);
                        }
                      }}
                      style={{
                        opacity: (availableCategories.length > 0 && !availableCategories.some(c => c.id === category.id) && category.id !== 'all') ? 0.5 : 1,
                        cursor: (availableCategories.length > 0 && !availableCategories.some(c => c.id === category.id) && category.id !== 'all') ? 'not-allowed' : 'pointer'
                      }}
                      title={
                        (availableCategories.length > 0 && !availableCategories.some(c => c.id === category.id) && category.id !== 'all') 
                          ? `No "${category.name}" words available for ${sourceLangInfo?.name} → ${targetLangInfo?.name}` 
                          : ''
                      }
                    >
                      <span className="category-icon">{category.icon}</span>
                      <span className="category-name">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Filters Display */}
              <div className="active-filters">
                <div className="active-filter-item">
                  <span className="filter-label">Level:</span>
                  <span className="filter-value" style={{ 
                    backgroundColor: selectedLevel !== 'all' ? getLevelColor(selectedLevel) : '#e2e8f0',
                    color: selectedLevel !== 'all' ? 'white' : '#4a5568'
                  }}>
                    {getLevelName(selectedLevel)}
                  </span>
                </div>
                <div className="active-filter-item">
                  <span className="filter-label">Category:</span>
                  <span className="filter-value">
                    {selectedCategory !== 'all' && getCategoryIcon(selectedCategory)} {getCategoryName(selectedCategory)}
                  </span>
                </div>
                <button 
                  className="reset-filters-btn"
                  onClick={handleResetFilters}
                >
                  🔄 Reset Filters
                </button>
              </div>

              {/* Database Info */}
              {filterInfo.totalWithTranslations > 0 && (
                <div className="database-info">
                  <h4>📊 Database Information:</h4>
                  <p>
                    There are <strong>{filterInfo.totalWithTranslations}</strong> concepts available for 
                    <strong> {sourceLangInfo?.name} → {targetLangInfo?.name}</strong>
                  </p>
                  <div className="filter-summary">
                    <span className="summary-item">
                      <span className="summary-label">Available Levels:</span>
                      <span className="summary-value">
                        {filterInfo.levels && filterInfo.levels.length > 0 
                          ? filterInfo.levels.map(l => getLevelName(l)).join(', ') 
                          : 'All levels'}
                      </span>
                    </span>
                    <span className="summary-item">
                      <span className="summary-label">Available Categories:</span>
                      <span className="summary-value">
                        {filterInfo.categories && filterInfo.categories.length > 0 
                          ? filterInfo.categories.slice(0, 3).map(c => getCategoryName(c)).join(', ') 
                          : 'All categories'}
                        {filterInfo.categories && filterInfo.categories.length > 3 && '...'}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              <div className="instructions">
                <h4>🎯 How it works:</h4>
                <ul>
                  <li>Choose the language you know (Source)</li>
                  <li>Choose the language you want to learn (Target)</li>
                  <li>Select difficulty level and category</li>
                  <li>Click the switch button (🔄) to reverse direction</li>
                  <li>Start learning with interactive flashcards and quizzes</li>
                </ul>
              </div>

              <button
                className="start-learning-btn"
                onClick={handleStartLearning}
                disabled={sourceLanguage === targetLanguage}
              >
                🚀 Start Learning {sourceLangInfo?.name} → {targetLangInfo?.name}
              </button>

              {sourceLanguage === targetLanguage && (
                <div className="instructions" style={{ background: '#fff5f5', borderLeftColor: '#f56565' }}>
                  <h4>⚠️ Note:</h4>
                  <p>Source and target languages cannot be the same. Please select different languages.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app-container">
        <div className="main-card">
          <header className="header">
            <h1>🌍 Universal Language Learner</h1>
            <p className="subtitle">Learning: {sourceLangInfo?.name} → {targetLangInfo?.name}</p>
          </header>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading concepts from JSON files...</p>
            <p className="loading-subtext">
              Level: {getLevelName(selectedLevel)} | 
              Category: {getCategoryName(selectedCategory)}
            </p>
            <p className="loading-info">
              {filterInfo.totalWithTranslations ? 
                `📊 ${filterInfo.totalWithTranslations} concepts available` : 
                'Loading database info...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="main-card">
        <header className="header">
          <h1>🌍 Universal Language Learner</h1>
          <p className="subtitle">Learning: {sourceLangInfo?.name} → {targetLangInfo?.name}</p>
          <div className="current-language-pair">
            <div className="current-language-item">
              <span className="current-language-flag">{sourceLangInfo?.flag}</span>
              <span className="current-language-name">{sourceLangInfo?.name}</span>
            </div>
            <span className="direction-arrow" style={{ fontSize: '1.2rem' }}>→</span>
            <div className="current-language-item">
              <span className="current-language-flag">{targetLangInfo?.flag}</span>
              <span className="current-language-name">{targetLangInfo?.name}</span>
            </div>
            <button 
              onClick={() => setShowLanguageSelection(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                cursor: 'pointer',
                fontSize: '0.9rem',
                marginLeft: '10px'
              }}
            >
              (Change)
            </button>
          </div>
          
          {/* Data source indicator */}
          <div className="data-source-indicator">
            <span className={`data-source-badge ${dataSource === 'local' ? 'local-badge' : dataSource === 'empty' ? 'empty-badge' : 'error-badge'}`}>
              {dataSource === 'local' ? '📁 Local JSON Concepts' : dataSource === 'empty' ? '⚠️ No Concepts Found' : '❌ Error'}
            </span>
            <span className="word-count-badge">
              📚 {wordCount} concepts
            </span>
            {filterInfo.totalWithTranslations > 0 && (
              <span className="database-info-badge">
                📊 {filterInfo.totalWithTranslations} available
              </span>
            )}
          </div>
        </header>

        {/* Active Filters Bar */}
        <div className="active-filters-bar">
          <div className="active-filters-content">
            <div className="filter-tags">
              {selectedLevel !== 'all' && (
                <span className="filter-tag" style={{ backgroundColor: getLevelColor(selectedLevel) }}>
                  📊 {getLevelName(selectedLevel)}
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="filter-tag">
                  {getCategoryIcon(selectedCategory)} {getCategoryName(selectedCategory)}
                </span>
              )}
            </div>
            <button 
              className="change-filters-btn"
              onClick={() => setShowLanguageSelection(true)}
            >
              🔧 Change Filters
            </button>
          </div>
        </div>

        {currentWords.length === 0 ? (
          <div className="no-words-found">
            <div className="no-words-icon">📭</div>
            <h3>No Concepts Found</h3>
            <p>No concepts were found with the current filters:</p>
            <ul>
              <li>Languages: <strong>{sourceLangInfo?.name} → {targetLangInfo?.name}</strong></li>
              <li>Level: <strong>{getLevelName(selectedLevel)}</strong></li>
              <li>Category: <strong>{getCategoryName(selectedCategory)}</strong></li>
            </ul>
            
            {filterInfo.totalWithTranslations > 0 && (
              <div className="suggestions">
                <h4>💡 Suggestions:</h4>
                <ul>
                  <li>Try selecting "All Levels" or "All Categories"</li>
                  <li>Try a different language combination</li>
                  <li>Check if the selected category has data for your language pair</li>
                </ul>
                <div className="available-info">
                  <p><strong>Available for {sourceLangInfo?.name} → {targetLangInfo?.name}:</strong></p>
                  <div className="available-tags">
                    {filterInfo.levels && filterInfo.levels.map(level => (
                      <span key={level} className="available-tag" style={{ backgroundColor: getLevelColor(level) }}>
                        {getLevelName(level)}
                      </span>
                    ))}
                  </div>
                  <div className="available-tags">
                    {filterInfo.categories && filterInfo.categories.slice(0, 5).map(category => (
                      <span key={category} className="available-tag">
                        {getCategoryIcon(category)} {getCategoryName(category)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="action-buttons">
              <button 
                className="action-btn action-btn-primary"
                onClick={() => setShowLanguageSelection(true)}
              >
                🔧 Change Filters
              </button>
              <button 
                className="action-btn action-btn-secondary"
                onClick={handleResetFilters}
              >
                🔄 Reset to All
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mode-toggle">
              <button 
                className={`mode-btn ${mode === "flashcards" ? "active" : ""}`}
                onClick={() => {
                  setMode("flashcards");
                  setCheckedQuiz(false);
                }}
              >
                <span>🖼️</span> Flashcard Mode
              </button>
              <button 
                className={`mode-btn ${mode === "quiz" ? "active" : ""}`}
                onClick={() => {
                  setMode("quiz");
                }}
              >
                <span>📝</span> Quiz Mode
              </button>
            </div>

            {mode === "flashcards" ? (
              <>
                <div className="instructions">
                  <h4>🎯 How to Learn</h4>
                  <ul>
                    <li>Look at the word in {sourceLangInfo?.name}</li>
                    <li>Type the {targetLangInfo?.name} translation on the right</li>
                    <li>Click "Check Answer" to verify your answer</li>
                    <li>Use arrow buttons to navigate between cards</li>
                    <li>Complete all cards for a final score</li>
                  </ul>
                </div>

                {currentWord && (
                  <Flashcard 
                    word={currentWord}
                    index={currentCardIndex}
                    total={currentWords.length}
                    onNext={handleNext}
                    onPrev={handlePrev}
                    userInput={flashcardAnswers[currentCardIndex]}
                    onInputChange={handleFlashcardInputChange}
                    isCardChecked={checkedCards[currentCardIndex]}
                    onCheckAnswer={handleCheckCardAnswer}
                    currentScore={flashcardCorrectCount}
                    totalScore={currentWords.length}
                    sourceLanguage={sourceLangInfo?.name}
                    targetLanguage={targetLangInfo?.name}
                  />
                )}

                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    <span>Progress</span>
                    <span>{Math.round(progress)}% • Card {currentCardIndex + 1} of {currentWords.length}</span>
                  </div>
                </div>

                <div className="action-buttons">
                  {checkedCardsCount < currentWords.length ? (
                    <button 
                      className="action-btn action-btn-primary"
                      onClick={handleCheckAllAnswers}
                      disabled={checkedCardsCount === currentWords.length}
                    >
                      <span>✅</span> Check All Answers
                    </button>
                  ) : (
                    <button 
                      className="action-btn action-btn-success"
                      onClick={() => setMode("quiz")}
                    >
                      <span>📝</span> Try Quiz Mode
                    </button>
                  )}
                  <button 
                    className="action-btn action-btn-secondary"
                    onClick={handleReset}
                  >
                    <span>🔄</span> Start Over
                  </button>
                  <button 
                    className="action-btn action-btn-secondary"
                    onClick={() => setShowLanguageSelection(true)}
                  >
                    <span>🔧</span> Change Filters
                  </button>
                  <button 
                    className="action-btn action-btn-secondary"
                    onClick={() => {
                      console.log("🔍 Debug Info:");
                      console.log("Dynamic Categories:", categories.length, "total");
                      console.log("Dynamic Levels:", levels.length, "total");
                      console.log("Available Categories:", availableCategories.length);
                      console.log("Available Levels:", availableLevels.length);
                      console.log("Current Words:", currentWords.length);
                      console.log("DataSource:", dataSource);
                      console.log("Filter Info:", filterInfo);
                    }}
                  >
                    <span>🐛</span> Debug
                  </button>
                </div>
              </>
            ) : (
              <div className="quiz-mode">
                <div className="instructions">
                  <h4>📝 Quiz Mode</h4>
                  <ul>
                    <li>Type {targetLangInfo?.name} translations for all {sourceLangInfo?.name} words below</li>
                    <li>Press "Check Answers" when finished</li>
                    <li>Compare your score with flashcard mode</li>
                    <li>Try to get a perfect score!</li>
                  </ul>
                </div>

                <div className="word-list">
                  {currentWords.map((word, index) => (
                    <div key={word.id} className="word-item">
                      <div className="word-item-header">
                        <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#2d3748' }}>
                          {word.source}
                        </div>
                        {word.metadata && (
                          <div className="word-item-metadata">
                            <span className="word-level-badge" style={{ 
                              backgroundColor: getLevelColor(word.metadata.level) 
                            }}>
                              {word.metadata.level}
                            </span>
                            {word.metadata.category && (
                              <span className="word-category-badge">
                                {getCategoryIcon(word.metadata.category)} {word.metadata.category}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        value={quizAnswers[index] || ""}
                        onChange={(e) => handleQuizChange(index, e.target.value)}
                        disabled={checkedQuiz}
                        placeholder={`Type ${targetLangInfo?.name} translation...`}
                        className="text-input"
                      />
                      {checkedQuiz && (
                        <div className={`feedback ${
                          quizAnswers[index]?.toLowerCase() === word.target.toLowerCase() 
                            ? 'correct-feedback' 
                            : 'incorrect-feedback'
                        }`}>
                          {quizAnswers[index]?.toLowerCase() === word.target.toLowerCase() ? (
                            <span>✅ Correct!</span>
                          ) : (
                            <span>❌ Correct: {word.target}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(quizAnswers.filter(a => a?.trim() !== "").length / currentWords.length) * 100}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    <span>Progress</span>
                    <span>{quizAnswers.filter(a => a?.trim() !== "").length} of {currentWords.length} answered</span>
                  </div>
                </div>

                <div className="action-buttons">
                  {!checkedQuiz ? (
                    <button 
                      className="action-btn action-btn-primary"
                      onClick={handleCheckQuiz}
                      disabled={quizAnswers.some(answer => answer?.trim() === "")}
                    >
                      <span>✅</span> Check Quiz Answers
                    </button>
                  ) : (
                    <>
                      <button 
                        className="action-btn action-btn-success"
                        onClick={handleResetQuiz}
                      >
                        <span>🔄</span> Try Quiz Again
                      </button>
                      <button 
                        className="action-btn action-btn-secondary"
                        onClick={() => setMode("flashcards")}
                      >
                        <span>🖼️</span> Back to Flashcards
                      </button>
                    </>
                  )}
                  <button 
                    className="action-btn action-btn-secondary"
                    onClick={() => setShowLanguageSelection(true)}
                  >
                    <span>🔧</span> Change Filters
                  </button>
                </div>

                {checkedQuiz && (
                  <div className="instructions" style={{ background: '#f0fff4', borderLeftColor: '#48bb78' }}>
                    <h4>📊 Quiz Results</h4>
                    <ul>
                      <li>Your Score: <strong>{quizCorrectCount} / {currentWords.length}</strong></li>
                      <li>Percentage: <strong>{Math.round((quizCorrectCount / currentWords.length) * 100)}%</strong></li>
                      <li>Flashcard Mode Score: <strong>{flashcardCorrectCount} / {currentWords.length}</strong></li>
                      <li>Data Source: <strong>Local JSON Files</strong></li>
                      <li>Filtered by: <strong>{getLevelName(selectedLevel)}, {getCategoryName(selectedCategory)}</strong></li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <footer className="footer">
          <p>🌍 Universal Language Learner - Learn any language from any language</p>
          <div className="footer-tip">
            <span>💡 Tip:</span> Try learning in both directions for better retention!
            {dataSource === 'empty' && filterInfo.totalWithTranslations > 0 && (
              <div className="warning-banner">
                ⚠️ No concepts found with current filters. Try changing level or category.
                <br />
                There are <strong>{filterInfo.totalWithTranslations}</strong> concepts available for {sourceLangInfo?.name} → {targetLangInfo?.name}.
              </div>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}