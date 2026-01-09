// src/data/dataLoader.js - Updated with dynamic categories/levels
import enData from '../Words/EN.json';
import enInflectedData from '../Words/EN_iflacted.json';
import esData from '../Words/ES.json';
import deData from '../Words/DE.json';
import frData from '../Words/FR.json';
import itData from '../Words/IT.json';
import ptData from '../Words/PT.json';
import ruData from '../Words/RU.json';
import categoriesData from '../Words/categories.json';

// Create a mapping of language codes to their data
const languageData = {
  'en': { lemmas: enData, inflected: enInflectedData },
  'es': { lemmas: esData, inflected: null },
  'de': { lemmas: deData, inflected: null },
  'fr': { lemmas: frData, inflected: null },
  'it': { lemmas: itData, inflected: null },
  'pt': { lemmas: ptData, inflected: null },
  'ru': { lemmas: ruData, inflected: null },
};

// Helper to find inflected word
function getInflectedWord(conceptId, inflectedData) {
  if (!inflectedData) return null;
  const item = inflectedData.find(item => item.concept_id === conceptId);
  return item ? item.word_inflected : null;
}

// Extract all unique categories and levels from ALL language data
let allCategoriesCache = null;
let allLevelsCache = null;

function extractAllCategoriesAndLevels() {
  if (allCategoriesCache && allLevelsCache) {
    return { categories: allCategoriesCache, levels: allLevelsCache };
  }
  
  const categoriesSet = new Set();
  const levelsSet = new Set();
  
  // Add from categories.json first
  categoriesData.forEach(cat => {
    if (cat.category) {
      categoriesSet.add(cat.category);
    }
  });
  
  // Then add from all language data
  Object.values(languageData).forEach(langData => {
    if (langData.lemmas) {
      langData.lemmas.forEach(item => {
        if (item.category) categoriesSet.add(item.category);
        if (item.level) levelsSet.add(item.level);
      });
    }
  });
  
  // Convert to arrays and sort
  allCategoriesCache = Array.from(categoriesSet).sort();
  allLevelsCache = Array.from(levelsSet).sort((a, b) => {
    // Sort levels in order: A1, A2, B1, B2, C1, C2
    const levelOrder = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
    return (levelOrder[a] || 99) - (levelOrder[b] || 99);
  });
  
  return { categories: allCategoriesCache, levels: allLevelsCache };
}

// Get icon for category
function getCategoryIcon(category) {
  const iconMap = {
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
  return iconMap[category] || '📚';
}

// Get color for level
function getLevelColor(level) {
  const colors = {
    'A1': '#48bb78',
    'A2': '#38a169',
    'B1': '#d69e2e',
    'B2': '#ed8936',
    'C1': '#e53e3e',
    'C2': '#9b2c2c'
  };
  return colors[level] || '#4299e1';
}

// Get display name for level
function getLevelDisplayName(level) {
  const names = {
    'A1': 'Beginner (A1)',
    'A2': 'Elementary (A2)',
    'B1': 'Intermediate (B1)',
    'B2': 'Upper Intermediate (B2)',
    'C1': 'Advanced (C1)',
    'C2': 'Proficient (C2)'
  };
  return names[level] || level;
}

// Main function to get words from local JSON files
export async function getWordsFromLocalFiles(sourceLang, targetLang, selectedLevel = "all", selectedCategory = "all") {
  console.log("📁 Loading from local JSON files...");
  console.log(`   ${sourceLang} → ${targetLang}, Level: ${selectedLevel}, Category: ${selectedCategory}`);
  
  try {
    const sourceData = languageData[sourceLang]?.lemmas;
    const targetData = languageData[targetLang]?.lemmas;
    const sourceInflected = languageData[sourceLang]?.inflected;
    
    if (!sourceData || !targetData) {
      console.error(`❌ No data for languages: ${sourceLang} or ${targetLang}`);
      return [];
    }
    
    // Create a map of concept_id to target language word
    const targetMap = new Map();
    targetData.forEach(item => {
      if (item.concept_id && item.word_lemma) {
        targetMap.set(item.concept_id, {
          word: item.word_lemma,
          definition: item.definiton || '',
          sentence: item.sentence || ''
        });
      }
    });
    
    // Process source language data and match with target
    const concepts = [];
    
    sourceData.forEach(sourceItem => {
      const conceptId = sourceItem.concept_id;
      const targetInfo = targetMap.get(conceptId);
      
      if (targetInfo) {
        // Use inflected form if available, otherwise use lemma
        const sourceWord = sourceInflected 
          ? getInflectedWord(conceptId, sourceInflected) || sourceItem.word_lemma
          : sourceItem.word_lemma;
        
        concepts.push({
          id: conceptId || sourceItem.id,
          key: sourceItem.word_lemma?.toLowerCase() || conceptId,
          source: sourceWord,
          target: targetInfo.word,
          metadata: {
            level: sourceItem.level || 'A1',
            category: sourceItem.category || 'general',
            type: sourceItem.type || 'word',
            definition: sourceItem.definiton || '',
            sentence: sourceItem.sentence || '',
            targetDefinition: targetInfo.definition || '',
            targetSentence: targetInfo.sentence || ''
          }
        });
      }
    });
    
    console.log(`✅ Found ${concepts.length} concepts with translations`);
    
    // Apply filters
    let filteredConcepts = concepts;
    
    if (selectedLevel !== "all") {
      filteredConcepts = filteredConcepts.filter(concept => 
        concept.metadata.level === selectedLevel
      );
      console.log(`   After level filter (${selectedLevel}): ${filteredConcepts.length}`);
    }
    
    if (selectedCategory !== "all") {
      filteredConcepts = filteredConcepts.filter(concept => 
        concept.metadata.category === selectedCategory
      );
      console.log(`   After category filter (${selectedCategory}): ${filteredConcepts.length}`);
    }
    
    // Log sample data
    if (filteredConcepts.length > 0) {
      console.log("Sample concepts from local files:");
      filteredConcepts.slice(0, 3).forEach((c, i) => {
        console.log(`   ${i+1}. ${c.source} → ${c.target} [${c.metadata.level}, ${c.metadata.category}]`);
      });
    }
    
    return filteredConcepts;
    
  } catch (error) {
    console.error("❌ Error loading from local files:", error);
    return [];
  }
}

// Get available filters from local data
export async function getAvailableFiltersFromLocal(sourceLang, targetLang) {
  console.log("📊 Getting available filters from local files...");
  
  try {
    const sourceData = languageData[sourceLang]?.lemmas;
    const targetData = languageData[targetLang]?.lemmas;
    
    if (!sourceData || !targetData) {
      console.error(`❌ No data for languages: ${sourceLang} or ${targetLang}`);
      return {
        source: 'local',
        totalConcepts: 0,
        totalWithTranslations: 0,
        categories: [],
        levels: []
      };
    }
    
    // Create sets for unique categories and levels that have translations
    const categoriesSet = new Set();
    const levelsSet = new Set();
    
    // Create target map for checking translations
    const targetMap = new Map();
    targetData.forEach(item => {
      if (item.concept_id) {
        targetMap.set(item.concept_id, true);
      }
    });
    
    // Process source data
    sourceData.forEach(sourceItem => {
      if (targetMap.has(sourceItem.concept_id)) {
        if (sourceItem.category) categoriesSet.add(sourceItem.category);
        if (sourceItem.level) levelsSet.add(sourceItem.level);
      }
    });
    
    // Get total count of concepts with translations
    const totalWithTranslations = sourceData.filter(sourceItem => 
      targetMap.has(sourceItem.concept_id)
    ).length;
    
    console.log(`✅ Local filters: ${totalWithTranslations} concepts with translations`);
    
    return {
      source: 'local',
      totalConcepts: sourceData.length,
      totalWithTranslations,
      categories: Array.from(categoriesSet).sort(),
      levels: Array.from(levelsSet).sort((a, b) => {
        const levelOrder = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
        return (levelOrder[a] || 99) - (levelOrder[b] || 99);
      })
    };
    
  } catch (error) {
    console.error("❌ Error getting filters from local files:", error);
    return {
      source: 'local',
      totalConcepts: 0,
      totalWithTranslations: 0,
      categories: [],
      levels: []
    };
  }
}

// Get all available languages from local files
export function getAvailableLanguages() {
  return Object.keys(languageData);
}

// Get all categories dynamically from data
export function getAllCategories() {
  const { categories } = extractAllCategoriesAndLevels();
  return [
    { id: "all", name: "All Categories", icon: "📚" },
    ...categories.map(category => ({
      id: category,
      name: category,
      icon: getCategoryIcon(category)
    }))
  ];
}

// Get all levels dynamically from data
export function getAllLevels() {
  const { levels } = extractAllCategoriesAndLevels();
  return [
    { id: "all", name: "All Levels", color: "#4299e1" },
    ...levels.map(level => ({
      id: level,
      name: getLevelDisplayName(level),
      color: getLevelColor(level)
    }))
  ];
}

// Test function (optional, for debugging)
export async function testLocalData() {
  console.log("🧪 Testing local data loading...");
  
  const categories = getAllCategories();
  const levels = getAllLevels();
  
  console.log(`Categories found: ${categories.length}`);
  console.log(`Levels found: ${levels.length}`);
  
  // Test English to Spanish
  const words = await getWordsFromLocalFiles('en', 'es');
  console.log(`Test result: ${words.length} words loaded`);
  
  return { categories, levels, wordCount: words.length };
}