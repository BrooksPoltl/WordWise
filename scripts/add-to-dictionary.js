#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * WordWise Dictionary Manager
 * 
 * This script adds words to the Hunspell dictionary file using binary search
 * to maintain alphabetical order.
 */

const DICTIONARY_PATH = path.join(__dirname, '../public/dictionaries/index.dic');

/**
 * Extract the base word from a dictionary entry (removes flags like /SM, /M, etc.)
 */
function extractBaseWord(entry) {
  const slashIndex = entry.indexOf('/');
  return slashIndex === -1 ? entry : entry.substring(0, slashIndex);
}

/**
 * Compare two dictionary entries using ASCII lexicographic order
 * This matches the sorting used in Hunspell dictionaries where
 * uppercase letters come before lowercase letters
 */
function compareWords(a, b) {
  const wordA = extractBaseWord(a);
  const wordB = extractBaseWord(b);
  
  if (wordA < wordB) return -1;
  if (wordA > wordB) return 1;
  return 0;
}

/**
 * Use binary search to find the correct insertion position for a word
 */
function findInsertionIndex(words, newWord) {
  let left = 0;
  let right = words.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const comparison = compareWords(words[mid], newWord);
    
    if (comparison < 0) {
      left = mid + 1;
    } else if (comparison > 0) {
      right = mid - 1;
    } else {
      // Word already exists
      return -1;
    }
  }
  
  return left;
}

/**
 * Check if a word already exists in the dictionary
 */
function wordExists(words, word) {
  return findInsertionIndex(words, word) === -1;
}

/**
 * Add a word to the dictionary file
 */
function addWordToDictionary(word, flags = '') {
  try {
    // Validate input
    if (!word || typeof word !== 'string') {
      throw new Error('Word must be a non-empty string');
    }
    
    // Clean the word (remove extra spaces, convert to lowercase for consistency)
    const cleanWord = word.trim();
    if (!cleanWord) {
      throw new Error('Word cannot be empty after trimming');
    }
    
    // Create the dictionary entry
    // Remove leading slash from flags if present
    const cleanFlags = flags.startsWith('/') ? flags.substring(1) : flags;
    const entry = cleanFlags ? `${cleanWord}/${cleanFlags}` : cleanWord;
    
    console.log(`Adding word: "${entry}" to dictionary...`);
    
    // Read the dictionary file
    if (!fs.existsSync(DICTIONARY_PATH)) {
      throw new Error(`Dictionary file not found: ${DICTIONARY_PATH}`);
    }
    
    const content = fs.readFileSync(DICTIONARY_PATH, 'utf8');
    const lines = content.split('\n');
    
    // First line is the count, rest are words
    const count = parseInt(lines[0], 10);
    const words = lines.slice(1).filter(line => line.trim() !== '');
    
    console.log(`Current dictionary has ${count} words`);
    
    // Check if word already exists
    if (wordExists(words, entry)) {
      console.log(`Word "${cleanWord}" already exists in dictionary`);
      return false;
    }
    
    // Find insertion position using binary search
    const insertionIndex = findInsertionIndex(words, entry);
    console.log(`Insertion position: ${insertionIndex}`);
    
    // Insert the word at the correct position
    words.splice(insertionIndex, 0, entry);
    
    // Update the count
    const newCount = count + 1;
    
    // Reconstruct the file content
    const newContent = [newCount.toString(), ...words, ''].join('\n');
    
    // Create backup
    const backupPath = `${DICTIONARY_PATH}.backup.${Date.now()}`;
    fs.copyFileSync(DICTIONARY_PATH, backupPath);
    console.log(`Backup created: ${backupPath}`);
    
    // Write the updated dictionary
    fs.writeFileSync(DICTIONARY_PATH, newContent, 'utf8');
    
    console.log(`✅ Successfully added "${entry}" to dictionary`);
    console.log(`Dictionary now has ${newCount} words`);
    
    return true;
  } catch (error) {
    console.error('❌ Error adding word to dictionary:', error.message);
    return false;
  }
}

/**
 * Validate dictionary integrity (check if words are in alphabetical order)
 */
function validateDictionary() {
  try {
    console.log('Validating dictionary alphabetical order...');
    
    const content = fs.readFileSync(DICTIONARY_PATH, 'utf8');
    const lines = content.split('\n');
    const words = lines.slice(1).filter(line => line.trim() !== '');
    
    let isValid = true;
    let errorCount = 0;
    
    for (let i = 1; i < words.length; i++) {
      if (compareWords(words[i - 1], words[i]) > 0) {
        if (errorCount < 10) { // Only show first 10 errors
          console.error(`❌ Order error: "${words[i - 1]}" should come after "${words[i]}"`);
        }
        errorCount++;
        isValid = false;
      }
    }
    
    if (isValid) {
      console.log('✅ Dictionary is properly sorted');
    } else {
      console.error(`❌ Found ${errorCount} ordering errors in dictionary`);
    }
    
    return isValid;
  } catch (error) {
    console.error('❌ Error validating dictionary:', error.message);
    return false;
  }
}

/**
 * Main function - handle command line arguments
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
WordWise Dictionary Manager

Usage:
  node add-to-dictionary.js <word> [flags]     Add a word to the dictionary
  node add-to-dictionary.js --validate         Validate dictionary order
  node add-to-dictionary.js --help             Show this help

Examples:
  node add-to-dictionary.js hello              Add "hello" to dictionary
  node add-to-dictionary.js running /DGSJ      Add "running" with flags
  node add-to-dictionary.js --validate         Check dictionary order

Flags (optional):
  Common Hunspell flags include:
  /S    - Plural forms
  /M    - Can be used as a noun
  /G    - Gerund forms (-ing)
  /D    - Past tense forms (-ed)
  /J    - Adjective forms
  
Dictionary location: ${DICTIONARY_PATH}
`);
    return;
  }
  
  if (args[0] === '--help') {
    // Help is shown when no args are provided
    console.log(`
WordWise Dictionary Manager

Usage:
  node add-to-dictionary.js <word> [flags]     Add a word to the dictionary
  node add-to-dictionary.js --validate         Validate dictionary order
  node add-to-dictionary.js --help             Show this help

Examples:
  node add-to-dictionary.js hello              Add "hello" to dictionary
  node add-to-dictionary.js running /DGSJ      Add "running" with flags
  node add-to-dictionary.js --validate         Check dictionary order

Flags (optional):
  Common Hunspell flags include:
  /S    - Plural forms
  /M    - Can be used as a noun
  /G    - Gerund forms (-ing)
  /D    - Past tense forms (-ed)
  /J    - Adjective forms
  
Dictionary location: ${DICTIONARY_PATH}
`);
    return;
  }
  
  if (args[0] === '--validate') {
    validateDictionary();
    return;
  }
  
  const word = args[0];
  const flags = args[1] || '';
  
  addWordToDictionary(word, flags);
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
    addWordToDictionary, compareWords, extractBaseWord, findInsertionIndex, validateDictionary
};
