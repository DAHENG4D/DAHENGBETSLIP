// --- NEW FUNCTIONS FOR DYNAMIC BIDDING FORM ---

// Global variable to track the total amount
let totalBiddingAmount = 0.00;

/**
 * Calculates and updates the total amount of all bids.
 */
function calculateTotal() {
    let currentTotal = 0.00;
    // Select all Big and Small bid input fields
    const bidInputs = document.querySelectorAll('.bid-input');

    // Sum up the values
    bidInputs.forEach(input => {
        // Ensure the input is treated as an integer for bid volume calculation
        const value = parseInt(input.value) || 0; 
        currentTotal += value;
    });

    totalBiddingAmount = currentTotal;
    
    // Update the total display
    const totalDisplay = document.getElementById('totalAmountDisplay');
    if (totalDisplay) {
        totalDisplay.textContent = `RM ${currentTotal.toFixed(2)}`;
    }
}

/**
 * Creates and adds a new bid row to the table.
 * @param {string} number - The 4-digit number (e.g., "1234").
 */
function addNewBidRow(number = '') {
    const tableBody = document.getElementById('biddingTableBody');
    const num = number.trim().padStart(4, '0'); // Ensure 4 digits

    // Input validation (to be added later)
    // ...

    // Check for duplicates (to be added later)
    // ...

    // Create the new table row
    const newRow = tableBody.insertRow();
    newRow.setAttribute('data-number', num);

    // KEY UPDATE: Changed value="0" to value="" to make the volume box empty by default
    newRow.innerHTML = `
        <td class="bid-number-cell">
            <button type="button" class="btn btn-secondary btn-remove" onclick="removeBidRow(this)">
                <i class="fas fa-times"></i> 
            </button>
            ${num}
        </td>
        <td>
            <input type="number" class="bid-input" data-type="big" min="1" step="1" value="" onchange="calculateTotal()" onkeyup="calculateTotal()">
        </td>
        <td>
            <input type="number" class="bid-input" data-type="small" min="1" step="1" value="" onchange="calculateTotal()" onkeyup="calculateTotal()">
        </td>
    `;
    
    // Clear the input field after successful addition
    const newNumberInput = document.getElementById('newNumberInput');
    if (newNumberInput) {
        newNumberInput.value = '';
    }
    
    // Set focus on the first input of the new row
    newRow.querySelector('.bid-input[data-type="big"]').focus();

    calculateTotal(); // Recalculate total
}

/**
 * Removes a bid row from the table.
 * @param {HTMLElement} buttonElement - The remove button that was clicked.
 */
function removeBidRow(buttonElement) {
    const row = buttonElement.closest('tr');
    if (confirm(`Are you sure you want to remove number ${row.getAttribute('data-number')}?`)) {
        row.remove();
        calculateTotal(); // Recalculate total
    }
}

// Event Listener for the 'Add Number' button
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the bidding form page
    const addButton = document.getElementById('addNewNumberBtn');
    if (addButton) {
        addButton.addEventListener('click', () => {
            const numberInput = document.getElementById('newNumberInput');
            if (numberInput.value) {
                addNewBidRow(numberInput.value);
            } else {
                alert("Please enter a 4-digit number first.");
            }
        });

        // Initialize with a placeholder row if the table is empty
        const tableBody = document.getElementById('biddingTableBody');
        if (tableBody && tableBody.rows.length === 0) {
            addNewBidRow('1234'); // Add a sample number on load
        }
        
        calculateTotal(); // Calculate initial total
    }
});

// --- NEW FUNCTION TO COLLECT AND STORE BIDS ---

/**
 * Collects all current bids, stores them in localStorage, and redirects to the receipt page.
 */
function submitBids() {
    const bids = [];
    let grandTotal = 0.00;

    // 1. Collect all rows and calculate total
    const tableRows = document.querySelectorAll('#biddingTableBody tr');
    
    tableRows.forEach(row => {
        const number = row.getAttribute('data-number');
        const bigInput = row.querySelector('.bid-input[data-type="big"]');
        const smallInput = row.querySelector('.bid-input[data-type="small"]');
        
        // Use parseInt to ensure the volume is an integer, and handle empty strings as 0
        const bigAmount = parseInt(bigInput.value) || 0;
        const smallAmount = parseInt(smallInput.value) || 0;
        
        grandTotal += bigAmount + smallAmount;

        // Add BIG bid if amount > 0
        if (bigAmount > 0) {
            bids.push({
                number: number,
                type: 'BIG',
                amount: bigAmount.toFixed(2)
            });
        }
        
        // Add SML bid if amount > 0
        if (smallAmount > 0) {
            bids.push({
                number: number,
                type: 'SML',
                amount: smallAmount.toFixed(2)
            });
        }
    });

    // 2. Store the data in local storage
    localStorage.setItem('daheng4dBids', JSON.stringify(bids));
    localStorage.setItem('daheng4dTotal', grandTotal.toFixed(2));
    
    // 3. Redirect the user to the receipt page
    // *** FIXED PATH: Using relative path for local file system access. ***
    window.location.href = 'official-bet-slip/index.html'; 
}

// Expose the function globally for a new submit button
window.submitBids = submitBids;

// Expose functions globally for HTML attributes (onclick)
window.calculateTotal = calculateTotal;
window.addNewBidRow = addNewBidRow;
window.removeBidRow = removeBidRow;
