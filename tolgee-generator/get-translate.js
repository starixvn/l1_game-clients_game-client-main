const fs = require('fs');
const path = require('path');

// Function to recursively find all files with pattern
function findFiles(dir, pattern) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(filePath, pattern));
    } else if (pattern.test(file)) {
      results.push(filePath);
    }
  });

  return results;
}

// Function to extract phrases from a file
function extractPhrases(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Find the phrases object using regex
    const phrasesMatch = content.match(/export\s+const\s+phrases\s*=\s*({[\s\S]*?});/);

    if (!phrasesMatch) {
      return null;
    }

    // Extract the phrases object content
    const phrasesContent = phrasesMatch[1];

    // Try to evaluate the object (safely)
    try {
      // Create a safe evaluation context
      const phrases = eval(`(${phrasesContent})`);
      return {
        filePath,
        phrases,
        content: phrasesContent
      };
    } catch (evalError) {
      // If eval fails, return the raw content
      return {
        filePath,
        phrases: null,
        content: phrasesContent,
        error: evalError.message
      };
    }
  } catch (error) {
    return {
      filePath,
      error: error.message
    };
  }
}

// Function to flatten phrases object into key-value pairs
function flattenPhrases(obj, prefix = '') {
  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenPhrases(value, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

// Function to extract game name from file path
function extractGameName(filePath) {
  // Remove the base path and get the relative path
  const basePath = path.join(__dirname, '../assets/games');
  const relativePath = path.relative(basePath, filePath);

  // Split the path and get the game folder name
  const pathParts = relativePath.split(path.sep);
  return pathParts[0]; // First part is the game folder name
}

// Main function to extract translations for any language
function extractAllTranslations(languageCode = 'en') {
  const gamesDir = path.join(__dirname, '../assets/games');

  if (!fs.existsSync(gamesDir)) {
    console.error('Games directory not found:', gamesDir);
    return;
  }

  console.log(`Scanning for ${languageCode} translation files...`);

  // Find all translation files for the specified language
  const languageFiles = findFiles(gamesDir, new RegExp(`-${languageCode}\\.ts$`));

  console.log(`Found ${languageFiles.length} ${languageCode} translation files`);

  const allTranslations = {};
  const gameTranslations = {};
  const errors = [];

  languageFiles.forEach(filePath => {
    console.log(`Processing: ${filePath}`);

    const result = extractPhrases(filePath);

    if (result.error) {
      errors.push({
        file: filePath,
        error: result.error
      });
      return;
    }

    if (result.phrases) {
      const flattened = flattenPhrases(result.phrases);
      const gameName = extractGameName(filePath);

      // Add to game-specific translations
      gameTranslations[gameName] = flattened;

      // Add to all translations with game prefix to avoid conflicts
      Object.keys(flattened).forEach(key => {
        const prefixedKey = `${gameName}.${key}`;
        allTranslations[prefixedKey] = flattened[key];
      });
    }
  });

  // Create output directory
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save all translations
  const allTranslationsFile = path.join(outputDir, `all-${languageCode}-translations.json`);
  fs.writeFileSync(allTranslationsFile, JSON.stringify(allTranslations, null, 2));

  // Save game-specific translations
  const gameTranslationsFile = path.join(outputDir, `game-specific-${languageCode}-translations.json`);
  fs.writeFileSync(gameTranslationsFile, JSON.stringify(gameTranslations, null, 2));

  // Save errors
  if (errors.length > 0) {
    const errorsFile = path.join(outputDir, `extraction-errors-${languageCode}.json`);
    fs.writeFileSync(errorsFile, JSON.stringify(errors, null, 2));
  }

  // Generate summary
  const summary = {
    language: languageCode,
    totalFiles: languageFiles.length,
    successfulExtractions: Object.keys(gameTranslations).length,
    totalTranslationKeys: Object.keys(allTranslations).length,
    errors: errors.length,
    games: Object.keys(gameTranslations),
    outputFiles: [
      allTranslationsFile,
      gameTranslationsFile,
      ...(errors.length > 0 ? [path.join(outputDir, `extraction-errors-${languageCode}.json`)] : [])
    ]
  };

  const summaryFile = path.join(outputDir, `extraction-summary-${languageCode}.json`);
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

  // Print summary
  console.log('\n=== EXTRACTION SUMMARY ===');
  console.log(`Language: ${summary.language}`);
  console.log(`Total files processed: ${summary.totalFiles}`);
  console.log(`Successful extractions: ${summary.successfulExtractions}`);
  console.log(`Total translation keys: ${summary.totalTranslationKeys}`);
  console.log(`Errors: ${summary.errors}`);
  console.log(`\nGames found:`);
  summary.games.forEach(game => {
    console.log(`  - ${game}`);
  });
  console.log(`\nOutput files:`);
  summary.outputFiles.forEach(file => {
    console.log(`  - ${file}`);
  });

  // Show sample translations
  console.log('\n=== SAMPLE TRANSLATIONS ===');
  const sampleKeys = Object.keys(allTranslations).slice(0, 10);
  sampleKeys.forEach(key => {
    console.log(`${key}: "${allTranslations[key]}"`);
  });

  if (errors.length > 0) {
    console.log('\n=== ERRORS ===');
    errors.forEach(error => {
      console.log(`${error.file}: ${error.error}`);
    });
  }

  return summary;
}

// Legacy function for backward compatibility
function extractAllEnglishTranslations() {
  return extractAllTranslations('en');
}


if (require.main === module) {
  const languageCode = process.argv[2];
  extractAllTranslations(languageCode);
}

module.exports = {
  extractAllTranslations,
  extractAllEnglishTranslations,
  extractPhrases,
  flattenPhrases,
  findFiles
};
