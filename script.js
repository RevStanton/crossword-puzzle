// Import the word bank from the separate module
import { wordBank } from './wordBank.js';

/**
 * Function to shuffle the word bank to ensure randomness each time the page loads.
 * @param {Array} words - The word bank array to shuffle.
 * @returns {Array} - A shuffled array of word objects.
 */
function shuffleWordBank(words) {
    return words.sort(() => Math.random() - 0.5);
}

// Shuffle the word bank
const shuffledWordBank = shuffleWordBank(wordBank);
console.log("Shuffled Word Bank:", shuffledWordBank);

// Placeholder for grid generation logic
function generateGrid() {
    console.log("Grid generation logic will go here.");
}

// Placeholder for clue rendering logic
function renderClues() {
    console.log("Clue rendering logic will go here.");
}

// Initialize the crossword puzzle when the page loads
document.addEventListener("DOMContentLoaded", () => {
    console.log("Crossword Puzzle App Initialized");
    generateGrid(); // To be implemented later
    renderClues();  // To be implemented later
});

