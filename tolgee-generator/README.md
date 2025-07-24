# Tolgee Generator

A translation management tool for extracting and binding translations in the game client project.

## Overview

This toolset consists of two main utilities:

-   `get-translate.js` - Extracts translations from game files
-   `bind-translate.js` - Binds extracted translations back to game files

## Tools

### get-translate.js

Extracts translation phrases from TypeScript files in the games directory.

#### Features

-   Recursively scans the `assets/games` directory for translation files
-   Supports multiple languages (default: English)
-   Extracts phrases from TypeScript files matching the pattern `-{languageCode}.ts`
-   Flattens nested translation objects into key-value pairs
-   Generates comprehensive output files with extraction summaries

#### Usage

```bash
# Extract English translations (default)
node get-translate.js

# Extract translations for a specific language
node get-translate.js <languageCode>
```

#### Output Files

The tool generates several output files in the `output/` directory:

-   `all-{language}-translations.json` - All translations with game prefixes
-   `game-specific-{language}-translations.json` - Translations organized by game
-   `extraction-errors-{language}.json` - Any errors encountered during extraction
-   `extraction-summary-{language}.json` - Summary of the extraction process

#### Example Output

```json
{
    "baccarat.welcome": "Welcome to Baccarat",
    "baccarat.bet": "Place your bet",
    "roulette.spin": "Spin the wheel"
}
```

#### Supported File Structure

The tool expects translation files to follow this pattern:

```
assets/games/{gameName}/i18n/texts/{gameName}-{languageCode}.ts
```

Example:

```
assets/games/baccarat/i18n/texts/baccarat-en.ts
assets/games/roulette/i18n/texts/roulette-ja.ts
```

### bind-translate.js

Binds extracted translations back to the appropriate game files, creating new language-specific translation files.

#### Features

-   Restructures flattened translations back into nested objects
-   Creates new language-specific TypeScript files
-   Automatically handles numeric keys and string escaping
-   Generates proper import statements and export structures

#### Usage

```bash
# Bind Japanese translations (default)
node bind-translate.js

# Bind translations for a specific language
node bind-translate.js <languageCode>
```

#### Input Requirements

The tool expects a file named `new-{languageCode}-apply.json` in the `output/` directory. This file should contain flattened translations in the format:

```json
{
    "gameName.namespace.key": "translation value",
    "gameName.namespace.numericKey": "translation value"
}
```

#### Output Structure

For each game, the tool creates a new TypeScript file:

```
assets/games/{gameName}/i18n/texts/{gameName}-{languageCode}.ts
```

The generated file includes:

-   Import statement for language data reloading
-   Export of the phrases object
-   Call to reload language data

#### Example Generated File

```typescript
import { reloadLanguageData } from "../../../../common/i18n/CustomLanguageData";

export const phrases = {
    welcome: "Bienvenue au Baccarat",
    bet: "Placez votre mise",
    "0": "Premier joueur",
    "1": "Deuxième joueur"
};

reloadLanguageData("ja", phrases);
```

## Workflow

### Complete Translation Process

1. **Extract existing translations:**

    ```bash
    node get-translate.js en
    ```

2. **Review and modify translations:**

    - Edit the generated JSON files as needed
    - Ensure all keys are properly translated

3. **Bind translations back to files:**
    ```bash
    node bind-translate.js ja
    ```

### Multi-language Support

The tools support any language code. Common examples:

-   `en` - English
-   `ja` - Japanese
-   `zh` - Chinese
-   `ko` - Korean
-   `th` - Thai

## Error Handling

Both tools include comprehensive error handling:

-   **File not found errors** - Logged with file paths
-   **Parsing errors** - Detailed error messages for malformed files
-   **Evaluation errors** - Safe handling of complex object structures

## Dependencies

-   Node.js (built-in modules: `fs`, `path`)
-   No external dependencies required

## File Structure

```
tolgee-generator/
├── README.md
├── get-translate.js
├── bind-translate.js
├── output/
│   ├── all-en-translations.json
│   ├── game-specific-en-translations.json
│   ├── extraction-summary-en.json
│   └── new-ja-apply.json
└── games-translation.json
```

## Notes

-   The tools are designed to work with the specific file structure of the game client project
-   Translation files should export a `phrases` object
-   Numeric keys are automatically handled and preserved
-   Special characters in strings are properly escaped
-   The tools maintain backward compatibility with existing translation workflows
