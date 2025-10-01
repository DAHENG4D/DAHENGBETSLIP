// --- UTILITY FUNCTION FOR IBOX VARIATION ---
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

// --- UTILITY FUNCTION FOR ROLL/SYSTEM ENTRY EXPANSION (NEW) ---
/**
 * Expands a Roll or System Entry number (e.g., 'R234', '12X4') into 10 unique 4D numbers.
 * @param {string} rollNumber - The 4-character string containing 'R' or 'X'.
 * @returns {string[]} An array of 10 expanded 4D number strings.
 */
function expandRollNumbers(rollNumber) {
    const expandedNumbers = [];
    // Normalize to upper case for detection (Roll/System Entry is case-insensitive)
    const normalizedNumber = rollNumber.toUpperCase();

    // Check that there is exactly one 'R' or 'X'
    const rollCount = (normalizedNumber.match(/[RX]/g) || []).length;
    if (rollCount !== 1) {
        return []; // Invalid format for this function
    }

    // Find the index of the rolling character
    const rollIndex = normalizedNumber.search(/[RX]/);

    for (let i = 0; i <= 9; i++) {
        // Replace 'R' or 'X' with the current digit (0-9)
        const newNumber = normalizedNumber.replace(/[RX]/, i.toString());
        expandedNumbers.push(newNumber);
    }

    return expandedNumbers;
}

// --- FUNCTIONS FOR DYNAMIC BIDDING FORM ---
let totalBiddingAmount = 0.00;

function calculateTotal() {
    let currentTotal = 0.00;
    const bidInputs = document.querySelectorAll('.bid-input');
    bidInputs.forEach(input => {
        const value = parseInt(input.value) || 0; 
        currentTotal += value;
    });

    totalBiddingAmount = currentTotal;
    
    const totalDisplay = document.getElementById('totalAmountDisplay');
    if (totalDisplay) {
        totalDisplay.textContent = `RM ${currentTotal.toFixed(2)}`;
    }
}

/**
 * Creates and adds a new bid row to the table.
 * @param {string} number - The 4-digit number (e.g., "1234").
 * @param {number[]} [amounts=[0,0,0,0,0]] - An array of 5 amounts: [BIG, SMALL, BIG_IBOX, SMALL_IBOX, STRAIGHT].
 */
function addNewBidRow(number, amounts = [0, 0, 0, 0, 0]) {
    const tableBody = document.getElementById('biddingTableBody');
    const num = number.trim().padStart(4, '0');

    // Check if number already exists - CRUCIAL for Roll/System Entry to prevent duplicates
    const existingRow = tableBody.querySelector(`tr[data-number="${num}"]`);
    if (existingRow) {
        // If it exists, add the new amounts to the existing row's values
        const [big, small, bigIbox, smallIbox, straight] = amounts.map(a => parseInt(a) || 0);
        
        const bigInput = existingRow.querySelector('.bid-input[data-type="big"]');
        const smallInput = existingRow.querySelector('.bid-input[data-type="small"]');
        const bigIboxInput = existingRow.querySelector('.bid-input[data-type="big-ibox"]');
        const smallIboxInput = existingRow.querySelector('.bid-input[data-type="small-ibox"]');
        const straightInput = existingRow.querySelector('.bid-input[data-type="straight"]');

        bigInput.value = (parseInt(bigInput.value) || 0) + big;
        smallInput.value = (parseInt(smallInput.value) || 0) + small;
        bigIboxInput.value = (parseInt(bigIboxInput.value) || 0) + bigIbox;
        smallIboxInput.value = (parseInt(smallIboxInput.value) || 0) + smallIbox;
        straightInput.value = (parseInt(straightInput.value) || 0) + straight;

        calculateTotal();
        return;
    }

    // Create the new table row
    const newRow = tableBody.insertRow();
    newRow.setAttribute('data-number', num);
    
    // Destructuring 5 amounts
    const [big, small, bigIbox, smallIbox, straight] = amounts.map(a => parseInt(a) || 0);

    // Helper to format value for input field (empty string if 0, number otherwise)
    const formatValue = (amount) => amount > 0 ? amount : '';

    newRow.innerHTML = `
        <td class="bid-number-cell">
            <button type="button" class="btn btn-secondary btn-remove" onclick="removeBidRow(this)">
                <i class="fas fa-times"></i> 
            </button>
            ${num}
        </td>
        <td>
            <input type="number" class="bid-input" data-type="big" min="0" step="1" value="${formatValue(big)}" onchange="calculateTotal()" onkeyup="calculateTotal()">
        </td>
        <td>
            <input type="number" class="bid-input" data-type="small" min="0" step="1" value="${formatValue(small)}" onchange="calculateTotal()" onkeyup="calculateTotal()">
        </td>
        <td>
            <input type="number" class="bid-input" data-type="big-ibox" min="0" step="1" value="${formatValue(bigIbox)}" onchange="calculateTotal()" onkeyup="calculateTotal()">
        </td>
        <td>
            <input type="number" class="bid-input" data-type="small-ibox" min="0" step="1" value="${formatValue(smallIbox)}" onchange="calculateTotal()" onkeyup="calculateTotal()">
        </td>
        <td>
            <input type="number" class="bid-input" data-type="straight" min="0" step="1" value="${formatValue(straight)}" onchange="calculateTotal()" onkeyup="calculateTotal()">
        </td>
    `;
    
    // Set focus on the first input of the new row if no amounts were provided
    if (amounts.every(a => a === 0)) {
        newRow.querySelector('.bid-input[data-type="big"]').focus();
    }

    calculateTotal();
}

/**
 * Processes the multi-line chunk bidding input, handling both straight and Roll/System Entry.
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

        const parts = trimmedLine.split('-'); 
        const numberInput = parts[0].toUpperCase(); // Normalize R/X to upper case
        
        // --- STEP 1: Parse Amounts ---
        // Extract 5 possible amounts. Default to 0 if not present or invalid.
        const big = parseInt(parts[1]) || 0;
        const small = parseInt(parts[2]) || 0;
        const bigIbox = parseInt(parts[3]) || 0;
        const smallIbox = parseInt(parts[4]) || 0;
        const straight = parseInt(parts[5]) || 0; 

        // Check if any positive amount was provided (or if only the number was provided)
        const hasPositiveAmount = (big + small + bigIbox + smallIbox + straight) > 0;
        const amountsProvided = parts.length > 1;

        if (!/^[0-9RX]{4}$/.test(numberInput) || (numberInput.match(/[RX]/g) || []).length > 1) {
             console.warn(`Skipping invalid format or multi-roll: ${line}`);
             return; // Skip invalid numbers or numbers with multiple R/X
        }
        
        let numbersToProcess = [];

        // --- STEP 2: Handle Roll/System Entry Expansion ---
        if (numberInput.includes('R') || numberInput.includes('X')) {
            // Expand into 10 numbers
            numbersToProcess = expandRollNumbers(numberInput);
        } else if (/^\d{4}$/.test(numberInput)) {
            // Standard 4-digit number
            numbersToProcess.push(numberInput);
        }

        // --- STEP 3: Add Rows for all Expanded Numbers ---
        numbersToProcess.forEach(number => {
            if (!amountsProvided && !hasPositiveAmount) {
                 // Case A: Only the number/roll is provided (e.g., "R234"). Add all 10 with 0 amounts.
                 addNewBidRow(number, [0, 0, 0, 0, 0]);
            } else if (hasPositiveAmount) {
                 // Case B: Number/Roll and positive amounts are provided (e.g., "1234-1-1-0-0-1" or "R234-1-1-0-0-1").
                 // The *same* amounts are applied to all 10 expanded numbers.
                 addNewBidRow(number, [big, small, bigIbox, smallIbox, straight]);
            } else if (amountsProvided) {
                 // Case C: Explicit zero amounts are provided (e.g., "1234-0-0-0-0-0").
                 addNewBidRow(number, [0, 0, 0, 0, 0]);
            }
            addedCount++;
        });
    });

    if (addedCount > 0) {
        chunkInput.value = ''; // Clear the input field after successful addition
    } else {
        alert("No valid numbers or bids were added. Please check your input format (e.g., 1234 or R234-1-1-0-0-0).");
    }
    
    calculateTotal();
}


function removeBidRow(buttonElement) {
    const row = buttonElement.closest('tr');
    if (confirm(`Are you sure you want to remove number ${row.getAttribute('data-number')}?`)) {
        row.remove();
        calculateTotal();
    }
}

// Event Listener for the 'Add Bids' button
document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.getElementById('addNewNumberBtn');
    if (addButton) {
        addButton.addEventListener('click', processChunkBids);
        
        const tableBody = document.getElementById('biddingTableBody');
        if (tableBody && tableBody.rows.length === 0) {
            // Updated sample number: now includes a Roll example to show the feature
            addNewBidRow('1234', [1, 0, 0, 0, 1]); 
        }
        
        calculateTotal();
    }
});

// --- FUNCTION TO COLLECT AND STORE BIDS (UNCHANGED) ---

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
        const iboxVariation = getIboxVariation(number); 
        
        // Get all five input fields
        const bigInput = row.querySelector('.bid-input[data-type="big"]');
        const smallInput = row.querySelector('.bid-input[data-type="small"]');
        const bigIboxInput = row.querySelector('.bid-input[data-type="big-ibox"]');
        const smallIboxInput = row.querySelector('.bid-input[data-type="small-ibox"]');
        const straightInput = row.querySelector('.bid-input[data-type="straight"]');
        
        // Convert to integer, default to 0
        const bigAmount = parseInt(bigInput.value) || 0;
        const smallAmount = parseInt(smallInput.value) || 0;
        const bigIboxAmount = parseInt(bigIboxInput.value) || 0;
        const smallIboxAmount = parseInt(smallIboxInput.value) || 0;
        const straightAmount = parseInt(straightInput.value) || 0;
        
        grandTotal += bigAmount + smallAmount + bigIboxAmount + smallIboxAmount + straightAmount;

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

        // Add STRAIGHT bid
        if (straightAmount > 0) {
            bids.push({
                number: number,
                type: 'STRAIGHT (4A)',
                amount: straightAmount.toFixed(2)
            });
        }
        
        // Determine the type string for IBOX - only append suffix if > 1 variation
        let iboxTypeSuffix = (iboxVariation > 1) ? `(${iboxVariation})` : '';
        
        // Add BIG IBOX bid
        if (bigIboxAmount > 0) {
            bids.push({
                number: number,
                type: `BIG IBOX${iboxTypeSuffix}`, 
                amount: bigIboxAmount.toFixed(2)
            });
        }
        
        // Add SML IBOX bid
        if (smallIboxAmount > 0) {
            bids.push({
                number: number,
                type: `SML IBOX${iboxTypeSuffix}`,
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
window.processChunkBids = processChunkBids;