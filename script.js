// Import the word bank
import { wordBank } from './wordBank.js';

/**
 * Shuffle the word bank to ensure randomness each time the page loads.
 * @param {Array} words - The word bank array to shuffle.
 * @returns {Array} - A shuffled array of word objects.
 */
function shuffleWordBank(words) {
    return words.sort(() => Math.random() - 0.5);
}

/**
 * Generate a blank grid of a given size.
 * @param {number} size - The dimensions of the grid (size x size).
 * @returns {Array} - A 2D array representing the grid, initialized with null values.
 */
function createEmptyGrid(size) {
    const grid = [];
    for (let i = 0; i < size; i++) {
        grid.push(new Array(size).fill(null)); // Fill each row with `null`
    }
    return grid;
}

/**
 * Render the crossword grid as an HTML table.
 * @param {Array} grid - The 2D array representing the crossword grid.
 */
function renderGrid(grid) {
    console.log("Rendering grid...");
    const gridContainer = document.getElementById("grid-container");

    // Check if the container exists
    if (!gridContainer) {
        console.error("Error: Grid container not found!");
        return;
    }

    const table = document.createElement("table");

    // Generate rows and cells for the grid
    grid.forEach(row => {
        const tableRow = document.createElement("tr");
        row.forEach(cell => {
            const tableCell = document.createElement("td");

            if (cell === null) {
                // Create an input box for editable cells
                const input = document.createElement("input");
                input.setAttribute("maxlength", "1");
                tableCell.appendChild(input);
            } else {
                // Render predefined letters (if added later)
                tableCell.textContent = cell;
                tableCell.style.backgroundColor = "black";
            }

            tableRow.appendChild(tableCell);
        });
        table.appendChild(tableRow);
    });

    // Clear existing content and add the new table
    gridContainer.innerHTML = "";
    gridContainer.appendChild(table);

    console.log("Grid rendered successfully!");
}

/**
 * Render clues as a list below the crossword grid.
 */
function renderClues() {
    console.log("Rendering clues...");
    const cluesContainer = document.getElementById("clues");

    // Check if the container exists
    if (!cluesContainer) {
        console.error("Error: Clues container not found!");
        return;
    }

    // Shuffle the word bank and create a list of clues
    const shuffledWordBank = shuffleWordBank(wordBank);

    // Generate clue list
    cluesContainer.innerHTML = "<h2>Clues</h2><ol>";
    shuffledWordBank.forEach(entry => {
        const clueItem = document.createElement("li");
        clueItem.textContent = entry.clue;
        cluesContainer.querySelector("ol").appendChild(clueItem);
    });

    console.log("Clues rendered successfully!");
}

/**
 * Initialize the crossword puzzle application.
 */
document.addEventListener("DOMContentLoaded", () => {
    console.log("Crossword Puzzle App Initialized");

    // Create a 10x10 blank grid (placeholder for dynamic word placement)
    const grid = createEmptyGrid(10);

    // Render the grid and clues
    renderGrid(grid);
    renderClues();
});
