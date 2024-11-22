// script.js

// Import the word bank
import { wordBank } from './wordBank.js';

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
 * Check if a word can be placed at a given position.
 * @param {Array} grid - The crossword grid.
 * @param {string} word - The word to place.
 * @param {number} row - The starting row.
 * @param {number} col - The starting column.
 * @param {boolean} isHorizontal - Whether the word is placed horizontally.
 * @returns {boolean} - Whether the placement is valid.
 */
function canPlaceWordAt(grid, word, row, col, isHorizontal) {
    if (isHorizontal) {
        if (col + word.length > grid[0].length) return false; // Out of bounds
        for (let i = 0; i < word.length; i++) {
            const currentCell = grid[row][col + i];
            if (currentCell !== null && currentCell !== word[i]) {
                return false; // Conflict with existing letter
            }
            // Check for adjacent words
            if (grid[row][col + i] === null) {
                if (row > 0 && grid[row - 1][col + i] !== null) return false;
                if (row < grid.length - 1 && grid[row + 1][col + i] !== null) return false;
            }
        }
        // Check for cells before and after the word
        if (col > 0 && grid[row][col - 1] !== null) return false;
        if (col + word.length < grid[0].length && grid[row][col + word.length] !== null) return false;
    } else {
        if (row + word.length > grid.length) return false; // Out of bounds
        for (let i = 0; i < word.length; i++) {
            const currentCell = grid[row + i][col];
            if (currentCell !== null && currentCell !== word[i]) {
                return false; // Conflict with existing letter
            }
            // Check for adjacent words
            if (grid[row + i][col] === null) {
                if (col > 0 && grid[row + i][col - 1] !== null) return false;
                if (col < grid[0].length - 1 && grid[row + i][col + 1] !== null) return false;
            }
        }
        // Check for cells before and after the word
        if (row > 0 && grid[row - 1][col] !== null) return false;
        if (row + word.length < grid.length && grid[row + word.length][col] !== null) return false;
    }
    return true;
}

/**
 * Place a word on the grid.
 * @param {Array} grid - The crossword grid.
 * @param {string} word - The word to place.
 * @param {number} row - The starting row.
 * @param {number} col - The starting column.
 * @param {boolean} isHorizontal - Whether the word is placed horizontally.
 */
function placeWordAt(grid, word, row, col, isHorizontal) {
    if (isHorizontal) {
        for (let i = 0; i < word.length; i++) {
            grid[row][col + i] = word[i];
        }
    } else {
        for (let i = 0; i < word.length; i++) {
            grid[row + i][col] = word[i];
        }
    }
}

/**
 * Try to place a word on the grid by finding matching letters.
 * @param {Array} grid - The crossword grid.
 * @param {string} word - The word to place.
 * @param {Array} placedWords - Array of already placed words.
 * @returns {Object|null} - The placement data or null if placement failed.
 */
function tryPlaceWord(grid, word, placedWords) {
    for (let i = 0; i < word.length; i++) {
        const letter = word[i];
        // Search the grid for matching letters
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[0].length; col++) {
                if (grid[row][col] === letter) {
                    // Try to place the word horizontally
                    const colStart = col - i;
                    if (canPlaceWordAt(grid, word, row, colStart, true)) {
                        placeWordAt(grid, word, row, colStart, true);
                        return { word, row, col: colStart, isHorizontal: true };
                    }
                    // Try to place the word vertically
                    const rowStart = row - i;
                    if (canPlaceWordAt(grid, word, rowStart, col, false)) {
                        placeWordAt(grid, word, rowStart, col, false);
                        return { word, row: rowStart, col, isHorizontal: false };
                    }
                }
            }
        }
    }
    return null; // Failed to place the word
}

/**
 * Place all words on the grid with starting numbers.
 * @param {Array} grid - The crossword grid.
 * @param {Array} wordBank - The word bank with words and clues.
 * @returns {Array} - An array of word starting points with their numbers.
 */
function placeWordsOnGrid(grid, wordBank) {
    const placedWords = [];
    const gridSize = grid.length;
    const midRow = Math.floor(gridSize / 2);
    const midCol = Math.floor(gridSize / 2);

    // Place the first word in the middle
    const firstWordObj = wordBank[0];
    const firstWord = firstWordObj.word;
    const firstWordStartCol = midCol - Math.floor(firstWord.length / 2);
    placeWordAt(grid, firstWord, midRow, firstWordStartCol, true);
    placedWords.push({
        word: firstWord,
        clue: firstWordObj.clue,
        row: midRow,
        col: firstWordStartCol,
        isHorizontal: true,
    });

    // Place the remaining words
    for (let i = 1; i < wordBank.length; i++) {
        const wordObj = wordBank[i];
        const word = wordObj.word;
        const placement = tryPlaceWord(grid, word, placedWords);

        if (placement) {
            placedWords.push({
                word,
                clue: wordObj.clue,
                row: placement.row,
                col: placement.col,
                isHorizontal: placement.isHorizontal,
            });
        } else {
            console.error(`Failed to place word: ${word}`);
        }
    }

    return placedWords;
}

/**
 * Generate numbers for the grid cells where words start.
 * @param {Array} grid - The crossword grid.
 * @param {Array} placedWords - Array of placed words.
 * @returns {Array} - Array of word metadata with assigned numbers.
 */
function numberGrid(grid, placedWords) {
    const numbers = [];
    let num = 1;

    // Create a helper grid to store numbers
    const numberGrid = grid.map(row => row.map(cell => null));

    // Assign numbers to starting cells of words
    for (const wordData of placedWords) {
        const { row, col, isHorizontal } = wordData;
        let needsNumber = false;

        if (isHorizontal) {
            // If this is the first letter or the cell above is empty
            if (col === 0 || grid[row][col - 1] === null) {
                needsNumber = true;
            }
        }

        if (!needsNumber && !isHorizontal) {
            // If this is the first letter or the cell to the left is empty
            if (row === 0 || grid[row - 1][col] === null) {
                needsNumber = true;
            }
        }

        if (needsNumber && numberGrid[row][col] === null) {
            numberGrid[row][col] = num;
            wordData.number = num;
            num++;
        } else if (numberGrid[row][col] !== null) {
            wordData.number = numberGrid[row][col];
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

    // Create a map for quick lookup of numbers
    const numberMap = {};
    placedWords.forEach(word => {
        const key = `${word.row}-${word.col}`;
        numberMap[key] = word.number;
    });

    for (let row = 0; row < grid.length; row++) {
        const tableRow = document.createElement("tr");

        for (let col = 0; col < grid[row].length; col++) {
            const tableCell = document.createElement("td");
            const cellValue = grid[row][col];

            if (cellValue === null) {
                tableCell.style.backgroundColor = "black"; // Black cell
            } else {
                // Render an empty input for the user to fill in
                const input = document.createElement("input");
                input.setAttribute("maxlength", "1");
                input.style.pointerEvents = "auto"; // Allow editing
                tableCell.appendChild(input);

                // Check if this cell is the start of a word
                const key = `${row}-${col}`;
                if (numberMap[key]) {
                    const number = document.createElement("span");
                    number.textContent = numberMap[key];
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

    const acrossClues = [];
    const downClues = [];

    placedWords.forEach(word => {
        const clueEntry = {
            number: word.number,
            clue: word.clue,
            word: word.word,
        };
        if (word.isHorizontal) {
            acrossClues.push(clueEntry);
        } else {
            downClues.push(clueEntry);
        }
    });

    // Sort the clues by their numbers
    acrossClues.sort((a, b) => a.number - b.number);
    downClues.sort((a, b) => a.number - b.number);

    cluesContainer.innerHTML = "<h2>Across</h2>";
    const acrossList = document.createElement("ol");
    acrossClues.forEach(clue => {
        const clueItem = document.createElement("li");
        clueItem.textContent = `${clue.number}. ${clue.clue}`;
        acrossList.appendChild(clueItem);
    });
    cluesContainer.appendChild(acrossList);

    cluesContainer.innerHTML += "<h2>Down</h2>";
    const downList = document.createElement("ol");
    downClues.forEach(clue => {
        const clueItem = document.createElement("li");
        clueItem.textContent = `${clue.number}. ${clue.clue}`;
        downList.appendChild(clueItem);
    });
    cluesContainer.appendChild(downList);
}

/**
 * Initialize the crossword puzzle.
 */
document.addEventListener("DOMContentLoaded", () => {
    const gridSize = 15; // Increased grid size for better word fitting
    const grid = createEmptyGrid(gridSize);
    const placedWords = placeWordsOnGrid(grid, wordBank);
    const numberedWords = numberGrid(grid, placedWords);

    renderGrid(grid, numberedWords);
    renderClues(numberedWords);
});
