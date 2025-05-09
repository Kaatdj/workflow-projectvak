var draggedBlock = null;
var currentBlock = null;
// Global counter for column IDs
var columnCounter = 1;
window.addEventListener("DOMContentLoaded", function () {
    var popup = document.getElementById("popup");
    var titleInput = document.getElementById("popupTitleInput");
    var descInput = document.getElementById("popupDesc");
    var memberInput = document.getElementById("popupMember");
    var dueDateInput = document.getElementById("popupDueDate");
    var typeInput = document.getElementById("popupType");
    var savePopup = document.getElementById("savePopup");
    var canvas = document.getElementById("canvas");
    var editBtn = document.getElementById("editBtn");
    var sidebar = document.getElementById("sidebar");
    var closeSidebar = document.getElementById("closeSidebar");
    if (!popup || !titleInput || !descInput || !memberInput || !dueDateInput || !typeInput || !savePopup || !canvas || !editBtn || !sidebar || !closeSidebar) {
        console.error("One or more required elements are missing from the DOM.");
        return;
    }
    // Hide the popup and sidebar by default
    popup.classList.add("hidden");
    sidebar.classList.add("hidden");
    // "Bewerk" button functionality to show the sidebar
    editBtn.addEventListener("click", function () {
        sidebar.classList.remove("hidden");
    });
    // Close the sidebar when the close button is clicked
    closeSidebar.addEventListener("click", function () {
        sidebar.classList.add("hidden");
    });
    // Create the initial columns, including the "start" block in the first column
    createColumn(canvas, true); // First column with "start" block
    createColumn(canvas); // Always have an extra column
    // Set up drag events for blocks in the palette
    document.querySelectorAll(".draggable").forEach(function (el) {
        el.addEventListener("dragstart", function () {
            draggedBlock = el;
        });
    });
    // Save block content from popup
    savePopup.addEventListener("click", function () {
        if (currentBlock && titleInput && descInput && memberInput && dueDateInput && typeInput) {
            var title = titleInput.value.trim();
            var desc = descInput.value.trim();
            var member = memberInput.value;
            var dueDate = dueDateInput.value.trim();
            var type = typeInput.value;
            currentBlock.innerText = title || "Naamloos blok";
            currentBlock.setAttribute("title", desc);
            // Get the column ID where the block is placed
            var column = currentBlock.parentElement;
            var columnId = column === null || column === void 0 ? void 0 : column.getAttribute("data-column-id");
            // Prepare block data
            var blockData_1 = {
                status: "unavailable", // Default status
                title: title || "Naamloos blok",
                description: desc,
                member: member,
                dueDate: dueDate,
                type: type,
                columnId: columnId || null, // Column ID or null if not found
            };
            // Log the block data to the console
            console.log("Block data saved:", blockData_1);
            // Send block data to Bubble
            /* window.addEventListener("load", function () {
               const iframe = document.querySelector("iframe");
               console.error("load okay");
       
               if (iframe) {
                 console.error("iframe okay");
       
                 // Send the message to the parent when the iframe is loaded
                 if (iframe.contentWindow) {
                   iframe.contentWindow.postMessage(
                     { type: "saveBlock", data: blockData },
                     "*"  // "*" allows communication from any origin
                   );
                 } else {
                   console.error("iframe.contentWindow is null.");
                 }
               }
             }); */
            console.log("Sending block data to parent...");
            setTimeout(function () {
                console.log("timeout");
                window.parent.postMessage({ type: "saveBlock", data: blockData_1 }, "https://valcori-99218.bubbleapps.io/version-test");
            }, 1000); // 1 second delay
            // Reset popup fields
            titleInput.value = "";
            descInput.value = "";
            memberInput.value = "";
            dueDateInput.value = "";
            typeInput.value = "";
            // Hide the popup
            popup.classList.add("hidden");
            currentBlock = null;
            // Update brackets after saving
            updateBrackets();
        }
    });
    // Close popup when clicking outside of it
    popup.addEventListener("click", function (e) {
        if (e.target === popup) {
            // Reset popup fields
            titleInput.value = "";
            descInput.value = "";
            memberInput.value = "";
            dueDateInput.value = "";
            typeInput.value = "";
            // Hide the popup
            popup.classList.add("hidden");
            currentBlock = null;
        }
    });
    // Function to create a new column
    function createColumn(parent, isStartColumn) {
        if (isStartColumn === void 0) { isStartColumn = false; }
        var col = document.createElement("div");
        col.classList.add("column");
        // Assign a sequential column ID
        var columnId = isStartColumn ? "start" : "col".concat(columnCounter++);
        col.setAttribute("data-column-id", columnId);
        if (isStartColumn) {
            // Add the "start" block to the first column
            var startBlock = document.createElement("div");
            startBlock.classList.add("block", "start-block");
            startBlock.innerText = "Start";
            col.appendChild(startBlock);
        }
        col.addEventListener("dragover", function (e) {
            e.preventDefault();
            // Prevent highlighting the first column
            if (isStartColumn) {
                return;
            }
            col.classList.add("highlight");
        });
        col.addEventListener("dragleave", function () {
            col.classList.remove("highlight");
        });
        col.addEventListener("drop", function (e) {
            e.preventDefault();
            col.classList.remove("highlight");
            // Prevent adding blocks to the first column
            if (isStartColumn) {
                console.log("Cannot add blocks to the first column.");
                return;
            }
            if (draggedBlock) {
                var clone = draggedBlock.cloneNode(true);
                clone.classList.remove("draggable");
                clone.style.cursor = "default";
                currentBlock = clone;
                // Ensure the block's columnId matches the column's data-column-id
                var columnId_1 = col.getAttribute("data-column-id");
                if (columnId_1) {
                    clone.setAttribute("data-column-id", columnId_1);
                    console.log("Block added to column \"".concat(columnId_1, "\"."));
                }
                col.appendChild(clone);
                // Show the popup to fill in block details
                if (popup) {
                    popup.classList.remove("hidden");
                }
                draggedBlock = null;
                // Ensure there is always an extra column
                ensureExtraColumn();
                // Update brackets
                updateBrackets();
            }
        });
        parent.appendChild(col);
    }
    // Function to ensure there is always an extra column
    function ensureExtraColumn() {
        var columns = canvas ? canvas.querySelectorAll(".column") : [];
        var lastColumn = columns[columns.length - 1];
        // If the last column has any blocks, add a new empty column
        if (lastColumn && lastColumn.children.length > 0) {
            createColumn(canvas);
        }
    }
    // Function to update brackets
    // Function to update brackets
    function updateBrackets() {
        var canvas = document.getElementById("canvas"); // <-- You missed this!
        var bracketsContainer = document.getElementById("brackets");
        var columns = canvas === null || canvas === void 0 ? void 0 : canvas.querySelectorAll(".column");
        if (!canvas || !bracketsContainer || !columns)
            return;
        // Clear existing brackets
        bracketsContainer.innerHTML = "";
        columns.forEach(function (column, columnIndex) {
            var blocks = column.querySelectorAll(".block");
            var prevColumn = columns[columnIndex - 1];
            var nextColumn = columns[columnIndex + 1];
            if (blocks.length >= 2) {
                var firstBlock = blocks[0];
                var lastBlock = blocks[blocks.length - 1];
                var firstBlockRect = firstBlock.getBoundingClientRect();
                var lastBlockRect = lastBlock.getBoundingClientRect();
                var canvasRect = canvas.getBoundingClientRect();
                var top_1 = firstBlockRect.top + firstBlockRect.height / 2 - canvasRect.top;
                var bottom = lastBlockRect.bottom - lastBlockRect.height / 2 - canvasRect.top;
                var height = bottom - top_1;
                var center = top_1 + height / 2;
                // Left bracket
                var leftBracket = document.createElement("div");
                leftBracket.classList.add("bracket-left");
                leftBracket.style.position = "absolute";
                leftBracket.style.top = "".concat(top_1, "px");
                leftBracket.style.left = "".concat(column.offsetLeft + 22, "px");
                leftBracket.style.height = "".concat(height, "px");
                leftBracket.style.width = "15px";
                leftBracket.style.transform = "translateX(-100%)";
                bracketsContainer.appendChild(leftBracket);
                // Horizontal line depending on previous column
                if (prevColumn) {
                    var prevBlocks = prevColumn.querySelectorAll(".block");
                    var horizontalLine = document.createElement("div");
                    horizontalLine.classList.add("horizontal-line");
                    horizontalLine.style.position = "absolute";
                    horizontalLine.style.top = "".concat(center, "px");
                    horizontalLine.style.left = "".concat(column.offsetLeft + 6.5, "px");
                    horizontalLine.style.transform = "translateX(-100%)";
                    if (prevBlocks.length > 1) {
                        horizontalLine.style.width = "33px";
                    }
                    else {
                        horizontalLine.style.width = "50px";
                    }
                    bracketsContainer.appendChild(horizontalLine);
                }
                // Right bracket if there's a next column
                if (nextColumn) {
                    var nextBlocks = nextColumn.querySelectorAll(".block");
                    if (nextBlocks.length > 0) {
                        var rightBracket = document.createElement("div");
                        rightBracket.classList.add("bracket-right");
                        rightBracket.style.position = "absolute";
                        rightBracket.style.top = "".concat(top_1, "px");
                        rightBracket.style.left = "".concat(column.offsetLeft + column.offsetWidth - 22, "px");
                        rightBracket.style.height = "".concat(height, "px");
                        rightBracket.style.width = "15px";
                        bracketsContainer.appendChild(rightBracket);
                    }
                }
            }
            else if (blocks.length === 1 && prevColumn) {
                var firstBlock = blocks[0];
                var lastBlock = blocks[blocks.length - 1];
                var firstBlockRect = firstBlock.getBoundingClientRect();
                var lastBlockRect = lastBlock.getBoundingClientRect();
                var canvasRect = canvas.getBoundingClientRect();
                var top_2 = firstBlockRect.top + firstBlockRect.height / 2 - canvasRect.top;
                var bottom = lastBlockRect.bottom - lastBlockRect.height / 2 - canvasRect.top;
                var height = bottom - top_2;
                var center = top_2 + height / 2;
                var prevBlocks = prevColumn.querySelectorAll(".block");
                var horizontalLine = document.createElement("div");
                horizontalLine.classList.add("horizontal-line");
                horizontalLine.style.position = "absolute";
                horizontalLine.style.top = "".concat(center, "px");
                horizontalLine.style.transform = "translateX(-100%)";
                if (prevBlocks.length > 1) {
                    horizontalLine.style.left = "".concat(column.offsetLeft + 24, "px");
                    horizontalLine.style.width = "50px";
                }
                else if (prevBlocks.length === 1) {
                    horizontalLine.style.left = "".concat(column.offsetLeft + 22, "px");
                    horizontalLine.style.width = "100px";
                }
                bracketsContainer.appendChild(horizontalLine);
            }
        });
    }
    // Call this function whenever blocks are added, removed, or moved
    updateBrackets();
});
function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
}
// ✅ Receive block data from parent Bubble page
window.addEventListener("message", function (event) {
    console.log("**Received message from parent:", event.data);
    if (event.data.type === "loadBlocks") {
        var blocks = event.data.data;
        console.log("Loading blocks into workflow:", blocks);
        renderBlocks(blocks);
    }
});
// ✅ Function to render blocks from database
function renderBlocks(blocks) {
    var canvas = document.getElementById("canvas");
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    blocks.forEach(function (block) {
        console.log("Rendering block:", block);
        // Try to find an existing column for this block
        var column = canvas.querySelector("[data-column-id=\"".concat(block.columnId, "\"]"));
        if (!column) {
            console.log("Column with ID ".concat(block.columnId, " not found. Creating a new column."));
            column = document.createElement("div");
            column.classList.add("column");
            // Assign a sequential column ID
            var newColumnId = "col".concat(columnCounter++);
            column.setAttribute("data-column-id", newColumnId);
            canvas.appendChild(column);
        }
        // Create block
        var el = document.createElement("div");
        el.classList.add("block");
        el.innerText = block.title || "Naamloos blok";
        el.setAttribute("title", block.description || "");
        // Ensure the block's columnId matches the column's data-column-id
        var columnId = column.getAttribute("data-column-id") || "";
        el.setAttribute("data-column-id", columnId); // Set the column ID on the block element
        console.log("Block \"".concat(block.title, "\" assigned to column \"").concat(columnId, "\"."));
        column.appendChild(el); // Append the block to the column
    });
}
