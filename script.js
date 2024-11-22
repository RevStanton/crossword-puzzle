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
        grid.push(new Array(size).fill(null));
    }
    return grid;
}

/**
 * Check if a word can be placed at a given position.
 * @param {Array} grid - The crossword grid.
 * @param {string} word - The word to place.
 * @param {number} row - The starting row.
 * @param {number} col - The starting column.
 * @param {string} direction - 'across' or 'down'.
 * @returns {boolean} - Whether the placement is valid.
 */
function canPlaceWord(grid, word, row, col, direction) {
    const gridSize = grid.length;
    const wordLength = word.length;

    if (direction === 'across') {
        if (col + wordLength > gridSize) return false; // Out of bounds

        // Check surrounding cells
        if (col > 0 && grid[row][col - 1] !== null) return false; // Left cell must be empty
        if (col + wordLength < gridSize && grid[row][col + wordLength] !== null) return false; // Right cell must be empty

        for (let i = 0; i < wordLength; i++) {
            const currentCell = grid[row][col + i];

            // Check for conflicts with existing letters
            if (currentCell !== null && currentCell.letter !== word[i]) return false;

            // Ensure adjacent cells are empty (above and below)
            if (currentCell === null) {
                if (row > 0 && grid[row - 1][col + i] !== null) return false;
                if (row < gridSize - 1 && grid[row + 1][col + i] !== null) return false;
            }
        }
    } else if (direction === 'down') {
        if (row + wordLength > gridSize) return false; // Out of bounds

        // Check surrounding cells
        if (row > 0 && grid[row - 1][col] !== null) return false; // Cell above must be empty
        if (row + wordLength < gridSize && grid[row + wordLength][col] !== null) return false; // Cell below must be empty

        for (let i = 0; i < wordLength; i++) {
            const currentCell = grid[row + i][col];

            // Check for conflicts with existing letters
            if (currentCell !== null && currentCell.letter !== word[i]) return false;

            // Ensure adjacent cells are empty (left and right)
            if (currentCell === null) {
                if (col > 0 && grid[row + i][col - 1] !== null) return false;
                if (col < gridSize - 1 && grid[row + i][col + 1] !== null) return false;
            }
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
 * @param {string} direction - 'across' or 'down'.
 */
function placeWord(grid, word, row, col, direction) {
    const positions = [];

    for (let i = 0; i < word.length; i++) {
        const r = direction === 'across' ? row : row + i;
        const c = direction === 'across' ? col + i : col;

        grid[r][c] = { letter: word[i] };
        positions.push({ row: r, col: c });
    }

    return positions;
}

/**
 * Remove a word from the grid.
 * @param {Array} grid - The crossword grid.
 * @param {Array} positions - Positions where the word was placed.
 */
function removeWord(grid, positions) {
    positions.forEach(pos => {
        grid[pos.row][pos.col] = null;
    });
}

/**
 * Attempt to fill the grid with words using backtracking.
 * @param {Array} grid - The crossword grid.
 * @param {Array} words - Words to place.
 * @param {number} index - Current word index.
 * @param {Array} placedWords - Words that have been placed with their metadata.
 * @returns {boolean} - Whether the grid was successfully filled.
 */
function fillGrid(grid, words, index, placedWords) {
    if (index >= words.length) return true; // All words have been placed

    const wordObj = words[index];
    const word = wordObj.word;
    const gridSize = grid.length;

    const positionsToTry = [];

    if (index === 0) {
        // For the first word, place it at the center of the grid
        const midRow = Math.floor(gridSize / 2);
        const midCol = Math.floor(gridSize / 2) - Math.floor(word.length / 2);
        positionsToTry.push({
            row: midRow,
            col: midCol,
            direction: 'across',
        });
    } else {
        // For subsequent words, try to intersect with placed words
        for (let i = 0; i < word.length; i++) {
            const letter = word[i];
            for (const placedWord of placedWords) {
                for (let j = 0; j < placedWord.word.length; j++) {
                    if (placedWord.word[j] === letter) {
                        const row = placedWord.direction === 'across' ? placedWord.row + j : placedWord.row + i - j;
                        const col = placedWord.direction === 'across' ? placedWord.col + j - i : placedWord.col + j;
                        const direction = placedWord.direction === 'across' ? 'down' : 'across';

                        positionsToTry.push({ row, col, direction });
                    }
                }
            }
        }
    }

    for (const pos of positionsToTry) {
        const { row, col, direction } = pos;

        if (canPlaceWord(grid, word, row, col, direction)) {
            const positions = placeWord(grid, word, row, col, direction);
            placedWords.push({
                word,
                clue: wordObj.clue,
                row,
                col,
                direction,
                positions,
            });

            if (fillGrid(grid, words, index + 1, placedWords)) {
                return true; // Successfully placed all words
            }

            // Backtrack
            placedWords.pop();
            removeWord(grid, positions);
        }
    }

    return false; // Failed to place the word
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

    placedWords.forEach(wordData => {
        const { row, col } = wordData;
        const key = `${row}-${col}`;

        if (!numberMap[key]) {
            numberMap[key] = number++;
        }

        wordData.number = numberMap[key];
    });

    // Assign numbers to grid cells
    for (const key in numberMap) {
        const [row, col] = key.split('-').map(Number);
        if (grid[row][col]) {
            grid[row][col].number = numberMap[key];
        }
    }

    return placedWords;
}

/**
 * Render the grid with word starting numbers and black cells.
 * @param {Array} grid - The crossword grid.
 */
function renderGrid(grid) {
    const gridContainer = document.getElementById('grid-container');

    if (!gridContainer) {
        console.error('Error: Grid container not found!');
        return;
    }

    const table = document.createElement('table');

    for (let row = 0; row < grid.length; row++) {
        const tableRow = document.createElement('tr');

        for (let col = 0; col < grid[row].length; col++) {
            const tableCell = document.createElement('td');
            const cellData = grid[row][col];

            if (cellData === null) {
                tableCell.style.backgroundColor = 'black'; // Black cell
            } else {
                // Render an empty input for the user to fill in
                const input = document.createElement('input');
                input.setAttribute('maxlength', '1');
                input.style.pointerEvents = 'auto'; // Allow editing
                input.style.textTransform = 'uppercase';
                input.autocomplete = 'off';
                input.spellcheck = false;
                tableCell.appendChild(input);

                // Add number if present
                if (cellData.number) {
                    const number = document.createElement('span');
                    number.textContent = cellData.number;
                    number.style.fontSize = '10px';
                    number.style.position = 'absolute';
                    number.style.top = '2px';
                    number.style.left = '2px';
                    tableCell.style.position = 'relative';
                    tableCell.appendChild(number);
                }
            }

            tableRow.appendChild(tableCell);
        }

        table.appendChild(tableRow);
    }

    gridContainer.innerHTML = '';
    gridContainer.appendChild(table);
}

/**
 * Render clues below the grid.
 * @param {Array} placedWords - Array of placed words with their metadata.
 */
function renderClues(placedWords) {
    const cluesContainer = document.getElementById('clues');

    if (!cluesContainer) {
        console.error('Error: Clues container not found!');
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
        if (word.direction === 'across') {
            acrossClues.push(clueEntry);
        } else {
            downClues.push(clueEntry);
        }
    });

    // Sort the clues by their numbers
    acrossClues.sort((a, b) => a.number - b.number);
    downClues.sort((a, b) => a.number - b.number);

    cluesContainer.innerHTML = '<h2>Across</h2>';
    const acrossList = document.createElement('ol');
    acrossClues.forEach(clue => {
        const clueItem = document.createElement('li');
        clueItem.textContent = `${clue.number}. ${clue.clue}`;
        acrossList.appendChild(clueItem);
    });
    cluesContainer.appendChild(acrossList);

    cluesContainer.innerHTML += '<h2>Down</h2>';
    const downList = document.createElement('ol');
    downClues.forEach(clue => {
        const clueItem = document.createElement('li');
        clueItem.textContent = `${clue.number}. ${clue.clue}`;
        downList.appendChild(clueItem);
    });
    cluesContainer.appendChild(downList);
}

/**
 * Initialize the crossword puzzle.
 */
document.addEventListener('DOMContentLoaded', () => {
    const gridSize = 15; // Standard crossword size
    const grid = createEmptyGrid(gridSize);

    // Sort words by length (descending) for better fitting
    const words = wordBank.slice().sort((a, b) => b.word.length - a.word.length);

    const placedWords = [];
    const success = fillGrid(grid, words, 0, placedWords);

    if (!success) {
        console.error('Failed to generate crossword puzzle with the given word bank.');
        return;
    }

    const numberedWords = numberGrid(grid, placedWords);

    renderGrid(grid);
    renderClues(numberedWords);
});
