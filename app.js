var draggedBlock = null;
var currentBlock = null;
// Global counter for column IDs
var columnCounter = 0;
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
    var template = document.getElementById("block-template");
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    if (!template) {
        console.error("Block template not found!");
        return;
    }
    blocks.forEach(function (block) {
        // Generate a unique ID for the block if it doesn't already have one
        if (!block.id) {
            block.id = "".concat(block.columnId, "-").concat(block.title, "-").concat(Date.now());
        }
        console.log("Rendering block:", block);
        // Check if the block already exists in the DOM
        var existingBlock = canvas.querySelector(".block[data-id=\"".concat(block.id, "\"]"));
        if (existingBlock) {
            console.log("Block with ID ".concat(block.id, " already exists. Updating..."));
            // Update the existing block's content
            var titleElement_1 = existingBlock.querySelector(".block-title");
            var descriptionElement_1 = existingBlock.querySelector(".block-description");
            var memberElement_1 = existingBlock.querySelector(".block-member");
            var dueDateElement_1 = existingBlock.querySelector(".block-due-date");
            var typeElement_1 = existingBlock.querySelector(".block-type");
            var statusCircle_1 = existingBlock.querySelector(".status-circle");
            if (titleElement_1)
                titleElement_1.textContent = block.title || "Naamloos blok";
            if (descriptionElement_1)
                descriptionElement_1.textContent = block.description || "No description";
            if (memberElement_1)
                memberElement_1.textContent = "Assigned to: ".concat(block.member || "None");
            if (dueDateElement_1)
                dueDateElement_1.textContent = "Due: ".concat(block.dueDate || "No due date");
            if (typeElement_1)
                typeElement_1.textContent = "Type: ".concat(block.type || "No type");
            // Update the status circle
            if (statusCircle_1) {
                statusCircle_1.classList.remove("status-unavailable", "status-busy", "status-done");
                if (block.status === "done") {
                    statusCircle_1.classList.add("status-done");
                }
                else if (block.status === "busy") {
                    statusCircle_1.classList.add("status-busy");
                }
                else {
                    statusCircle_1.classList.add("status-unavailable");
                }
            }
            return; // Skip creating a new block
        }
        // If the block does not exist, create a new one
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
        // Clone the block template
        var blockElement = template.content.cloneNode(true);
        // Populate the block with data
        var titleElement = blockElement.querySelector(".block-title");
        var descriptionElement = blockElement.querySelector(".block-description");
        var memberElement = blockElement.querySelector(".block-member");
        var dueDateElement = blockElement.querySelector(".block-due-date");
        var typeElement = blockElement.querySelector(".block-type");
        var approveButton = blockElement.querySelector(".approve-btn");
        var statusCircle = blockElement.querySelector(".status-circle");
        if (titleElement)
            titleElement.textContent = block.title || "Naamloos blok";
        if (descriptionElement)
            descriptionElement.textContent = block.description || "No description";
        if (memberElement)
            memberElement.textContent = "Assigned to: ".concat(block.member || "None");
        if (dueDateElement)
            dueDateElement.textContent = "Due: ".concat(block.dueDate || "No due date");
        if (typeElement)
            typeElement.textContent = "Type: ".concat(block.type || "No type");
        // Set the initial status circle color for all blocks
        if (statusCircle) {
            if (block.status === "done") {
                statusCircle.classList.add("status-done");
            }
            else if (block.status === "busy") {
                statusCircle.classList.add("status-busy");
            }
            else {
                statusCircle.classList.add("status-unavailable");
            }
        }
        // Handle "Approve" button for typeApproval blocks
        if (block.type === "typeApproval" && approveButton) {
            approveButton.classList.remove("hidden");
            if (block.status === "done") {
                approveButton.textContent = "Approved"; // Change button text
                approveButton.disabled = true; // Disable the button
            }
            else {
                approveButton.textContent = "Approve";
            }
            // Add click event listener to the button
            approveButton.addEventListener("click", function (event) {
                event.stopPropagation(); // Prevent the click from propagating to the block
                block.status = "done"; // Update the block's status locally
                approveButton.textContent = "Approved"; // Change button text
                approveButton.disabled = true; // Disable the button
                // Update the circle's color
                if (statusCircle) {
                    statusCircle.classList.remove("status-unavailable", "status-busy");
                    statusCircle.classList.add("status-done");
                }
                // Send the updated block to the Bubble database
                window.parent.postMessage({ type: "saveBlock", data: block }, "https://valcori-99218.bubbleapps.io/version-test");
                console.log("Block \"".concat(block.title, "\" approved."));
            });
        }
        // Add click event listener to the block for editing
        var blockDiv = blockElement.querySelector(".block");
        if (blockDiv) {
            blockDiv.setAttribute("data-id", block.id); // Add a unique identifier
            blockDiv.setAttribute("data-column-id", column.getAttribute("data-column-id") || "");
            blockDiv.setAttribute("data-title", block.title || "Naamloos blok");
            blockDiv.setAttribute("data-description", block.description || "");
            blockDiv.setAttribute("data-member", block.member || "");
            blockDiv.setAttribute("data-due-date", block.dueDate || "");
            blockDiv.setAttribute("data-type", block.type || "");
            blockDiv.addEventListener("click", function () {
                openEditPopup(block); // Open the popup to edit the block
            });
        }
        console.log("Block \"".concat(block.title, "\" assigned to column \"").concat(column.getAttribute("data-column-id"), "\"."));
        column.appendChild(blockElement); // Append the block to the column
    });
}
// Function to open the popup and populate it with block data
function openEditPopup(block) {
    var popup = document.getElementById("popup");
    var titleInput = document.getElementById("popupTitleInput");
    var descInput = document.getElementById("popupDesc");
    var memberInput = document.getElementById("popupMember");
    var dueDateInput = document.getElementById("popupDueDate");
    var typeInput = document.getElementById("popupType");
    var savePopup = document.getElementById("savePopup");
    if (!popup || !titleInput || !descInput || !memberInput || !dueDateInput || !typeInput || !savePopup) {
        console.error("Popup or input elements not found!");
        return;
    }
    // Populate the popup with the block's current data
    titleInput.value = block.title || "";
    descInput.value = block.description || "";
    memberInput.value = block.member || "";
    dueDateInput.value = block.dueDate || "";
    typeInput.value = block.type || "";
    // Show the popup
    popup.classList.remove("hidden");
    // Handle saving the updated block data
    savePopup.onclick = function () {
        block.title = titleInput.value.trim();
        block.description = descInput.value.trim();
        block.member = memberInput.value;
        block.dueDate = dueDateInput.value.trim();
        block.type = typeInput.value;
        // Send the updated block to the Bubble database
        window.parent.postMessage({ type: "saveBlock", data: block }, "https://valcori-99218.bubbleapps.io/version-test");
        // Hide the popup
        popup.classList.add("hidden");
        console.log("Block \"".concat(block.title, "\" updated and saved."));
    };
}
