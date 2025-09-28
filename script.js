// --- UTILITY FUNCTION FOR IBOX VARIATION (NEW) ---
/**
 * Calculates the IBOX permutation count for a 4-digit number.
 * @param {string} number - The 4-digit number string.
 * @returns {number} The permutation count (24, 12, 6, 4), or 0 if 1-way.
 */
function getIboxVariation(number) {
    if (number.length !== 4) return 0;

    const digits = number.split('');
    const counts = {};
    digits.forEach(d => {
        counts[d] = (counts[d] || 0) + 1;
    });

    const uniqueCounts = Object.values(counts);

    // Sort the unique counts to simplify pattern matching
    uniqueCounts.sort((a, b) => b - a);

    // 4 Different Digits: [1, 1, 1, 1] -> 24-Way
    if (uniqueCounts.length === 4) return 24;

    // 3 Different Digits: [2, 1, 1] (e.g., 1123) -> 12-Way
    if (uniqueCounts.length === 3) return 12;

    // 2 Different Digits:
    if (uniqueCounts.length === 2) {
        // [3, 1] (e.g., 1112) -> 4-Way
        if (uniqueCounts[0] === 3) return 4;
        // [2, 2] (e.g., 1122) -> 6-Way
        if (uniqueCounts[0] === 2) return 6;
    }

    // 1 Different Digit: [4] (e.g., 1111) -> 1-Way (IBOX not applicable)
    return 0; 
}


// --- FUNCTIONS FOR DYNAMIC BIDDING FORM ---

// Global variable to track the total amount
let totalBiddingAmount = 0.00;

/**
 * Calculates and updates the total amount of all bids.
 */
function calculateTotal() {
    let currentTotal = 0.00;
    // Select all bid input fields
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
 * @param {number[]} [amounts=[0,0,0,0]] - An array of 4 amounts: [BIG, SMALL, BIG_IBOX, SMALL_IBOX].
 */
function addNewBidRow(number, amounts = [0, 0, 0, 0]) {
    const tableBody = document.getElementById('biddingTableBody');
    const num = number.trim().padStart(4, '0'); // Ensure 4 digits

    // Check if number already exists
    const existingRow = tableBody.querySelector(`tr[data-number="${num}"]`);
    if (existingRow) {
        alert(`Number ${num} is already in the list. Please edit the existing row.`);
        return;
    }

    // Create the new table row
    const newRow = tableBody.insertRow();
    newRow.setAttribute('data-number', num);
    
    const [big, small, bigIbox, smallIbox] = amounts.map(a => parseInt(a) || 0);

    newRow.innerHTML = `
        <td class="bid-number-cell">
            <button type="button" class="btn btn-secondary btn-remove" onclick="removeBidRow(this)">
                <i class="fas fa-times"></i> 
            </button>
            ${num}
        </td>
        <td>
            <input type="number" class="bid-input" data-type="big" min="0" step="1" value="${big > 0 ? big : ''}" onchange="calculateTotal()" onkeyup="calculateTotal()">
        </td>
        <td>
            <input type="number" class="bid-input" data-type="small" min="0" step="1" value="${small > 0 ? small : ''}" onchange="calculateTotal()" onkeyup="calculateTotal()">
        </td>
        <td>
            <input type="number" class="bid-input" data-type="big-ibox" min="0" step="1" value="${bigIbox > 0 ? bigIbox : ''}" onchange="calculateTotal()" onkeyup="calculateTotal()">
        </td>
        <td>
            <input type="number" class="bid-input" data-type="small-ibox" min="0" step="1" value="${smallIbox > 0 ? smallIbox : ''}" onchange="calculateTotal()" onkeyup="calculateTotal()">
        </td>
    `;
    
    // Set focus on the first input of the new row if no amounts were provided
    if (big === 0 && small === 0 && bigIbox === 0 && smallIbox === 0) {
        newRow.querySelector('.bid-input[data-type="big"]').focus();
    }

    calculateTotal(); // Recalculate total
}

/**
 * Processes the multi-line chunk bidding input.
 */
// ... (rest of the script.js remains the same)

/**
 * Processes the multi-line chunk bidding input.
 */
function processChunkBids() {
    const chunkInput = document.getElementById('chunkBidsInput');
    const lines = chunkInput.value.trim().split('\n');
    let addedCount = 0;
    
    if (lines.length === 0 || lines[0] === "") {
        alert("Please enter at least one bid.");
        return;
    }
    
    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine === '') return;

        // Split by hyphen to check for amount values
        const parts = trimmedLine.split('-'); 
        const number = parts[0];
        
        // Basic validation for 4-digit number
        if (!/^\d{4}$/.test(number)) {
            console.warn(`Skipping invalid format: ${line}`);
            return;
        }

        // Check if the input is JUST the number (no hyphen)
        if (parts.length === 1) {
            // Case 1: Only the number is provided (e.g., "1234")
            // Add the number with zero amounts and allow the user to input manually.
            addNewBidRow(number, [0, 0, 0, 0]);
            addedCount++;
            return;
        }

        // Case 2: Number and amounts are provided (e.g., "1234-1-1")
        const big = parseInt(parts[1]) || 0;
        const small = parseInt(parts[2]) || 0;
        const bigIbox = parseInt(parts[3]) || 0;
        const smallIbox = parseInt(parts[4]) || 0;
        
        // Only add if at least one bid volume is positive (or if amounts were provided but parsed to 0)
        // We only require a positive bid if the input line had hyphens
        if (big > 0 || small > 0 || bigIbox > 0 || smallIbox > 0) {
             addNewBidRow(number, [big, small, bigIbox, smallIbox]);
             addedCount++;
        } else {
             // This handles lines like "1234-0-0" which should be skipped if no positive bids exist
             console.warn(`Skipping number ${number} as all explicit bids were zero or invalid.`);
        }
    });

    if (addedCount > 0) {
        chunkInput.value = ''; // Clear the input field after successful addition
    } else {
        alert("No valid numbers or bids were added. Please check your input format (e.g., 1234 or 1234-1-1).");
    }
    
    calculateTotal();
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

// Event Listener for the 'Add Bids' button
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the bidding form page
    const addButton = document.getElementById('addNewNumberBtn');
    if (addButton) {
        // CHANGE: Connect the button to the new chunk processing function
        addButton.addEventListener('click', processChunkBids);

        // Remove the old single-input element logic
        /*
        const numberInput = document.getElementById('newNumberInput');
        if (numberInput) {
             // ... old logic removed
        }
        */

        // Initialize with a placeholder row if the table is empty (optional, keeping for demonstration)
        const tableBody = document.getElementById('biddingTableBody');
        if (tableBody && tableBody.rows.length === 0) {
            addNewBidRow('1234', [1, 0, 0, 0]); // Add a sample number on load
        }
        
        calculateTotal(); // Calculate initial total
    }
});

// --- FUNCTION TO COLLECT AND STORE BIDS (UPDATED) ---

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
        // Get the IBOX variation count for the current number
        const iboxVariation = getIboxVariation(number); 
        
        // Get all four input fields
        const bigInput = row.querySelector('.bid-input[data-type="big"]');
        const smallInput = row.querySelector('.bid-input[data-type="small"]');
        const bigIboxInput = row.querySelector('.bid-input[data-type="big-ibox"]');
        const smallIboxInput = row.querySelector('.bid-input[data-type="small-ibox"]');
        
        // Convert to integer, default to 0
        const bigAmount = parseInt(bigInput.value) || 0;
        const smallAmount = parseInt(smallInput.value) || 0;
        const bigIboxAmount = parseInt(bigIboxInput.value) || 0;
        const smallIboxAmount = parseInt(smallIboxInput.value) || 0;
        
        grandTotal += bigAmount + smallAmount + bigIboxAmount + smallIboxAmount;

        // Add BIG/SML bids (Type is static)
        if (bigAmount > 0) {
            bids.push({
                number: number,
                type: 'BIG',
                amount: bigAmount.toFixed(2)
            });
        }
        if (smallAmount > 0) {
            bids.push({
                number: number,
                type: 'SML',
                amount: smallAmount.toFixed(2)
            });
        }
        
        // Determine the type string for IBOX - only append suffix if > 1 variation
        let iboxTypeSuffix = (iboxVariation > 1) ? `(${iboxVariation})` : '';
        
        // Add BIG IBOX bid
        if (bigIboxAmount > 0) {
            bids.push({
                number: number,
                type: `BIG IBOX${iboxTypeSuffix}`, // Append variation
                amount: bigIboxAmount.toFixed(2)
            });
        }
        
        // Add SML IBOX bid
        if (smallIboxAmount > 0) {
            bids.push({
                number: number,
                type: `SML IBOX${iboxTypeSuffix}`, // Append variation
                amount: smallIboxAmount.toFixed(2)
            });
        }
    });

    // 2. Store the data in local storage
    localStorage.setItem('daheng4dBids', JSON.stringify(bids));
    localStorage.setItem('daheng4dTotal', grandTotal.toFixed(2));
    
    // 3. Redirect the user to the receipt page
    window.location.href = 'official-bet-slip/index.html'; 
}

// Expose the function globally for a new submit button
window.submitBids = submitBids;

// Expose functions globally for HTML attributes (onclick)
window.calculateTotal = calculateTotal;
window.addNewBidRow = addNewBidRow;
window.removeBidRow = removeBidRow;
window.processChunkBids = processChunkBids; // Expose new function