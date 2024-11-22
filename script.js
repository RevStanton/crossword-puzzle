// Import the word bank
import { wordBank } from './wordBank.js';

// Shuffle function for word bank
function shuffleWordBank(words) {
    return words.sort(() => Math.random() - 0.5);
}

// Generate a blank grid of a given size
function createEmptyGrid(size) {
    const grid = [];
    for (let i = 0; i < size; i++) {
        grid.push(new Array(size).fill(null)); // Each row is an array filled with `null`
    }
    return grid;
}

// Render the grid as an HTML table
function renderGrid(grid) {
    const gridContainer = document.getElementById("grid-container");
    const table = document.createElement("table");

    grid.forEach(row => {
        const tableRow = document.createElement("tr");
        row.forEach(cell => {
            const tableCell = document.createElement("td");
            if (cell === null) {
                const input = document.createElement("input");
                input.setAttribute("maxlength", "1"); // Limit each input box to one character
                tableCell.appendChild(input);
            } else {
                tableCell.textContent = cell; // Add predefined letters (if applicable in the future)
                tableCell.style.backgroundColor = "black"; // Style black cells
            }
            tableRow.appendChild(tableCell);
        });
        table.appendChild(tableRow);
    });

    gridContainer.innerHTML = ""; // Clear any existing content
    gridContainer.appendChild(table); // Add the table to the container
}

// Render clues
function renderClues() {
    const cluesContainer = document.getElementById("clues");
    const shuffledWordBank = shuffleWordBank(wordBank);

    cluesContainer.innerHTML = "<h2>Clues</h2><ol>";
    shuffledWordBank.forEach((entry, index) => {
        const clueItem = document.createElement("li");
        clueItem.textContent = `${entry.clue}`;
        cluesContainer.querySelector("ol").appendChild(clueItem);
    });
}

// Initialize the crossword puzzle
document.addEventListener("DOMContentLoaded", () => {
    console.log("Crossword Puzzle App Initialized");

    // Create a 10x10 blank grid for now
    const grid = createEmptyGrid(10);

    // Render the grid and clues
    renderGrid(grid);
    renderClues();
});
