// src/data/words.js - Updated to use dynamic categories/levels
import { 
    getWordsFromLocalFiles, 
    getAvailableFiltersFromLocal,
    getAllCategories,
    getAllLevels
  } from './dataLoader';
  
  // Languages available (update based on your JSON files)
  export const languages = [
    { id: "en", name: "English", flag: "🇺🇸", nativeName: "English" },
    { id: "es", name: "Spanish", flag: "🇪🇸", nativeName: "Español" },
    { id: "de", name: "German", flag: "🇩🇪", nativeName: "Deutsch" },
    { id: "fr", name: "French", flag: "🇫🇷", nativeName: "Français" },
    { id: "it", name: "Italian", flag: "🇮🇹", nativeName: "Italiano" },
    { id: "pt", name: "Portuguese", flag: "🇵🇹", nativeName: "Português" },
    { id: "ru", name: "Russian", flag: "🇷🇺", nativeName: "Русский" }
  ];
  
  // Get levels dynamically from data
  export const levels = getAllLevels();
  
  // Get categories dynamically from data
  export const categories = getAllCategories();
  
  // Emergency fallback data (keep as backup)
  export const emergencyWords = [
    { id: 1, key: "hello", source: "hello", target: "hola", metadata: { level: "A1", category: "common", type: "greeting" } },
    { id: 2, key: "goodbye", source: "goodbye", target: "adiós", metadata: { level: "A1", category: "common", type: "greeting" } },
    { id: 3, key: "thank you", source: "thank you", target: "gracias", metadata: { level: "A1", category: "common", type: "expression" } },
    { id: 4, key: "please", source: "please", target: "por favor", metadata: { level: "A1", category: "common", type: "expression" } },
    { id: 5, key: "yes", source: "yes", target: "sí", metadata: { level: "A1", category: "common", type: "word" } },
    { id: 6, key: "no", source: "no", target: "no", metadata: { level: "A1", category: "common", type: "word" } }
  ];
  
  // Main function to get words - Now uses local files
  export async function getWordsForLanguages(sourceLang, targetLang, selectedLevel = "all", selectedCategory = "all") {
    console.log("🔄 Getting words from local JSON files...");
    console.log(`   ${sourceLang} → ${targetLang}, Level: ${selectedLevel}, Category: ${selectedCategory}`);
    
    try {
      // Try to get from local files first
      const words = await getWordsFromLocalFiles(sourceLang, targetLang, selectedLevel, selectedCategory);
      
      if (words.length > 0) {
        console.log(`✅ Successfully loaded ${words.length} words from local files`);
        return words;
      }
      
      // Fallback to emergency words
      console.log("📦 No words found in local files, using emergency words");
      return emergencyWords;
      
    } catch (error) {
      console.error("❌ Error in getWordsForLanguages:", error);
      
      // Return emergency words as last resort
      console.log("🚨 Using emergency words due to error");
      return emergencyWords;
    }
  }
  
  // Get available filters - Now uses local files
  export async function getAvailableFilters(sourceLang, targetLang) {
    console.log("📊 Getting available filters from local files...");
    
    try {
      const filters = await getAvailableFiltersFromLocal(sourceLang, targetLang);
      return filters;
      
    } catch (error) {
      console.error("❌ Error in getAvailableFilters:", error);
      
      // Fallback to emergency data
      const categoriesSet = new Set();
      const levelsSet = new Set();
      
      emergencyWords.forEach(word => {
        if (word.metadata.category) categoriesSet.add(word.metadata.category);
        if (word.metadata.level) levelsSet.add(word.metadata.level);
      });
      
      return {
        source: 'emergency',
        totalConcepts: emergencyWords.length,
        totalWithTranslations: emergencyWords.length,
        categories: Array.from(categoriesSet),
        levels: Array.from(levelsSet)
      };
    }
  }
  
  // Test function (optional, for debugging)
  export async function testLocalData() {
    console.log("🧪 Testing local data loading...");
    
    // Test English to Spanish
    const words = await getWordsFromLocalFiles('en', 'es');
    console.log(`Test result: ${words.length} words loaded`);
    
    if (words.length > 0) {
      console.log("Sample:", words[0]);
    }
    
    return words.length;
  }