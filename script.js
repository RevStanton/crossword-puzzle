// Import the word bank
import { wordBank } from './wordBank.js';

/**
 * Shuffle the word bank to ensure randomness.
 * @param {Array} words - The word bank array to shuffle.
 * @returns {Array} - A shuffled array of word objects.
 */
function shuffleWordBank(words) {
    return words.sort(() => Math.random() - 0.5);
}

/**
 * Create an empty grid.
 * @param {number} size - The size of the grid (size x size).
 * @returns {Array} - A 2D array representing the grid.
 */
function createEmptyGrid(size) {
    const grid = [];
    for (let i = 0; i < size; i++) {
        grid.push(new Array(size).fill(null)); // Fill each row with `null`
    }
    return grid;
}

/**
 * Attempt to place a word on the grid.
 * @param {Array} grid - The crossword grid.
 * @param {string} word - The word to place.
 * @param {number} row - The starting row.
 * @param {number} col - The starting column.
 * @param {boolean} isHorizontal - Whether the word is placed horizontally.
 * @returns {boolean} - Whether the placement was successful.
 */
function placeWord(grid, word, row, col, isHorizontal) {
    if (isHorizontal) {
        if (col + word.length > grid.length) return false; // Out of bounds
        for (let i = 0; i < word.length; i++) {
            if (grid[row][col + i] !== null && grid[row][col + i] !== word[i]) {
                return false; // Overlap conflict
            }
        }
        for (let i = 0; i < word.length; i++) {
            grid[row][col + i] = word[i];
        }
    } else {
        if (row + word.length > grid.length) return false; // Out of bounds
        for (let i = 0; i < word.length; i++) {
            if (grid[row + i][col] !== null && grid[row + i][col] !== word[i]) {
                return false; // Overlap conflict
            }
        }
        for (let i = 0; i < word.length; i++) {
            grid[row + i][col] = word[i];
        }
    }
    return true;
}

/**
 * Place all words on the grid with starting numbers.
 * @param {Array} grid - The crossword grid.
 * @param {Array} wordBank - The word bank with words and clues.
 * @returns {Array} - An array of word starting points with their numbers.
 */
function placeWordsOnGrid(grid, wordBank) {
    const placedWords = [];
    let wordNumber = 1;

    for (const wordObj of wordBank) {
        const word = wordObj.word;
        let placed = false;

        for (let attempt = 0; attempt < 100; attempt++) { // Try up to 100 times
            const row = Math.floor(Math.random() * grid.length);
            const col = Math.floor(Math.random() * grid.length);
            const isHorizontal = Math.random() > 0.5;

            if (placeWord(grid, word, row, col, isHorizontal)) {
                placedWords.push({
                    word,
                    clue: wordObj.clue,
                    number: wordNumber,
                    row,
                    col,
                    isHorizontal,
                });
                wordNumber++;
                placed = true;
                break;
            }
        }

        if (!placed) {
            console.error(`Failed to place word: ${word}`);
        }
    }

    return placedWords;
}

/**
 * Render the grid with word starting numbers and black cells.
 * @param {Array} grid - The crossword grid.
 * @param {Array} placedWords - Array of placed words with their metadata.
 */
function renderGrid(grid, placedWords) {
    const gridContainer = document.getElementById("grid-container");

    if (!gridContainer) {
        console.error("Error: Grid container not found!");
        return;
    }

    const table = document.createElement("table");

    for (let row = 0; row < grid.length; row++) {
        const tableRow = document.createElement("tr");

        for (let col = 0; col < grid[row].length; col++) {
            const tableCell = document.createElement("td");
            const cellValue = grid[row][col];

            if (cellValue === null) {
                tableCell.style.backgroundColor = "black"; // Black cell
            } else {
                const input = document.createElement("input");
                input.setAttribute("maxlength", "1");
                tableCell.appendChild(input);

                // Check if this is the start of a word
                const wordStart = placedWords.find(
                    word =>
                        word.row === row &&
                        word.col === col &&
                        grid[row][col] === word.word[0]
                );

                if (wordStart) {
                    const number = document.createElement("span");
                    number.textContent = wordStart.number;
                    number.style.fontSize = "10px";
                    number.style.position = "absolute";
                    number.style.top = "2px";
                    number.style.left = "2px";
                    tableCell.style.position = "relative";
                    tableCell.appendChild(number);
                }
            }

            tableRow.appendChild(tableCell);
        }

        table.appendChild(tableRow);
    }

    gridContainer.innerHTML = "";
    gridContainer.appendChild(table);
}

/**
 * Render clues below the grid.
 * @param {Array} placedWords - Array of placed words with their metadata.
 */
function renderClues(placedWords) {
    const cluesContainer = document.getElementById("clues");

    if (!cluesContainer) {
        console.error("Error: Clues container not found!");
        return;
    }

    cluesContainer.innerHTML = "<h2>Clues</h2><ol>";
    placedWords.forEach(word => {
        const clueItem = document.createElement("li");
        clueItem.textContent = `${word.number}. ${word.clue}`;
        cluesContainer.querySelector("ol").appendChild(clueItem);
    });
}

/**
 * Initialize the crossword puzzle.
 */
document.addEventListener("DOMContentLoaded", () => {
    const gridSize = 10;
    const grid = createEmptyGrid(gridSize);
    const shuffledWordBank = shuffleWordBank(wordBank);
    const placedWords = placeWordsOnGrid(grid, shuffledWordBank);

    renderGrid(grid, placedWords);
    renderClues(placedWords);
});
