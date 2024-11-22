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
    const gridSize = grid.length;

    if (isHorizontal) {
        if (col + word.length > gridSize) return false; // Out of bounds

        // Ensure that the starting cell is valid
        if (col > 0 && grid[row][col - 1] !== null) return false; // Can't start in the middle of a word
        if (col + word.length < gridSize && grid[row][col + word.length] !== null) return false; // Cell after word must be empty or out of bounds

        for (let i = 0; i < word.length; i++) {
            const currentCell = grid[row][col + i];
            if (currentCell !== null && currentCell !== word[i]) {
                return false; // Conflict with existing letter
            }
            // Check for adjacent cells
            if (row > 0 && grid[row - 1][col + i] !== null) return false; // Cell above must be empty
            if (row < gridSize - 1 && grid[row + 1][col + i] !== null) return false; // Cell below must be empty
        }
    } else {
        if (row + word.length > gridSize) return false; // Out of bounds

        // Ensure that the starting cell is valid
        if (row > 0 && grid[row - 1][col] !== null) return false; // Can't start in the middle of a word
        if (row + word.length < gridSize && grid[row + word.length][col] !== null) return false; // Cell after word must be empty or out of bounds

        for (let i = 0; i < word.length; i++) {
            const currentCell = grid[row + i][col];
            if (currentCell !== null && currentCell !== word[i]) {
                return false; // Conflict with existing letter
            }
            // Check for adjacent cells
            if (col > 0 && grid[row + i][col - 1] !== null) return false; // Cell to the left must be empty
            if (col < gridSize - 1 && grid[row + i][col + 1] !== null) return false; // Cell to the right must be empty
        }
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
 * @returns {Object|null} - The placement data or null if placement failed.
 */
function tryPlaceWord(grid, word) {
    const gridSize = grid.length;

    // Try every cell in the grid
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            for (let isHorizontal of [true, false]) {
                for (let offset = 0; offset < word.length; offset++) {
                    const startRow = isHorizontal ? row : row - offset;
                    const startCol = isHorizontal ? col - offset : col;

                    if (startRow < 0 || startCol < 0) continue;

                    const canPlace = canPlaceWordAt(grid, word, startRow, startCol, isHorizontal);

                    if (canPlace) {
                        // Check if the word overlaps with existing letters correctly
                        let validPlacement = true;
                        for (let i = 0; i < word.length; i++) {
                            const currentRow = isHorizontal ? startRow : startRow + i;
                            const currentCol = isHorizontal ? startCol + i : startCol;
                            const cellValue = grid[currentRow][currentCol];

                            if (cellValue !== null && cellValue !== word[i]) {
                                validPlacement = false;
                                break;
                            }
                        }

                        if (validPlacement) {
                            placeWordAt(grid, word, startRow, startCol, isHorizontal);
                            return { word, row: startRow, col: startCol, isHorizontal };
                        }
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

    if (canPlaceWordAt(grid, firstWord, midRow, firstWordStartCol, true)) {
        placeWordAt(grid, firstWord, midRow, firstWordStartCol, true);
        placedWords.push({
            word: firstWord,
            clue: firstWordObj.clue,
            row: midRow,
            col: firstWordStartCol,
            isHorizontal: true,
        });
    } else {
        console.error(`Failed to place word: ${firstWord}`);
    }

    // Place the remaining words
    for (let i = 1; i < wordBank.length; i++) {
        const wordObj = wordBank[i];
        const word = wordObj.word;
        const placement = tryPlaceWord(grid, word);

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
    let number = 1;
    const numberMap = {};

    // Iterate over the grid to assign numbers in the correct order
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            if (grid[row][col] !== null) {
                let startsWord = false;

                // Check if this cell is the start of a horizontal word
                if ((col === 0 || grid[row][col - 1] === null) && (col + 1 < grid[row].length && grid[row][col + 1] !== null)) {
                    startsWord = true;
                }

                // Check if this cell is the start of a vertical word
                if ((row === 0 || grid[row - 1][col] === null) && (row + 1 < grid.length && grid[row + 1][col] !== null)) {
                    startsWord = true;
                }

                if (startsWord && !numberMap[`${row}-${col}`]) {
                    numberMap[`${row}-${col}`] = number;
                    number++;
                }
            }
        }
    }

    // Update placedWords with the correct numbers
    placedWords.forEach(word => {
        const key = `${word.row}-${word.col}`;
        word.number = numberMap[key];
    });

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
                input.style.textTransform = "uppercase";
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
    const gridSize = 15; // Standard crossword size
    const grid = createEmptyGrid(gridSize);
    const placedWords = placeWordsOnGrid(grid, wordBank);
    const numberedWords = numberGrid(grid, placedWords);

    renderGrid(grid, numberedWords);
    renderClues(numberedWords);
});
