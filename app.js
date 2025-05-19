var draggedBlock = null;
var draggedBlockData = {}; // <-- Add this line
var currentBlock = null;
// Global counter for column IDs
var columnCounter = 0;
var membersList = [];
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
function createColumn(parent, isStartColumn) {
    if (isStartColumn === void 0) { isStartColumn = false; }
    var col = document.createElement("div");
    col.classList.add("column");
    // Assign "start" to the first column, otherwise use colX
    var columns = parent.querySelectorAll(".column");
    var columnId = isStartColumn || columns.length === 0 ? "start" : "col".concat(columnCounter++);
    col.setAttribute("data-column-id", columnId);
    col.addEventListener("dragover", function (e) {
        e.preventDefault();
        // Prevent highlighting the first column
        if (col.getAttribute("data-column-id") === "start")
            return;
        col.classList.add("highlight");
    });
    col.addEventListener("dragleave", function () {
        col.classList.remove("highlight");
    });
    col.addEventListener("drop", function (e) {
        e.preventDefault();
        col.classList.remove("highlight");
        // Prevent dropping in the first column
        if (col.getAttribute("data-column-id") === "start") {
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
            var popup = document.getElementById("popup");
            var titleInput = document.getElementById("popupTitleInput");
            var typeInput = document.getElementById("popupType");
            // Only show popup if not typeEnded
            if (popup && draggedBlockData.type !== "typeEnded") {
                popup.classList.remove("hidden");
                // Prefill title and type if available
                if (titleInput && draggedBlockData.title)
                    titleInput.value = draggedBlockData.title;
                if (typeInput && draggedBlockData.type)
                    typeInput.value = draggedBlockData.type;
            }
            // Optionally clear draggedBlockData after use
            draggedBlockData = {};
            draggedBlock = null;
            ensureExtraColumn();
            updateBrackets();
        }
    });
    parent.appendChild(col);
}
function ensureExtraColumn() {
    var canvas = document.getElementById("canvas");
    if (!canvas)
        return;
    var columns = canvas.querySelectorAll(".column");
    var lastColumn = columns[columns.length - 1];
    // If the last column has any blocks, add a new empty column
    if (lastColumn && lastColumn.children.length > 0) {
        createColumn(canvas);
    }
}
function populateMemberDropdown(selectedMember) {
    if (selectedMember === void 0) { selectedMember = ""; }
    var memberInput = document.getElementById("popupMember");
    if (!memberInput)
        return;
    memberInput.innerHTML = '<option value="" disabled>Select Members</option>';
    membersList.forEach(function (member) {
        var option = document.createElement("option");
        option.value = member;
        option.textContent = member;
        if (member === selectedMember)
            option.selected = true;
        memberInput.appendChild(option);
    });
}
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
            // Store data attributes for pre-filling
            draggedBlockData = {
                title: draggedBlock.getAttribute("data-title") || "",
                type: draggedBlock.getAttribute("data-type") || ""
            };
        });
    });
    // Save block content from popup
    savePopup.addEventListener("click", function () {
        if (currentBlock && titleInput && descInput && memberInput && dueDateInput && typeInput) {
            // Validation for required fields
            if (!titleInput.value.trim()) {
                titleInput.focus();
                return;
            }
            if (!memberInput.value) {
                memberInput.focus();
                return;
            }
            if (!typeInput.value) {
                typeInput.focus();
                return;
            }
            if (!dueDateInput.value) {
                dueDateInput.focus();
                return;
            }
            var title = titleInput.value.trim();
            var desc = descInput.value.trim();
            var member = memberInput.value;
            var dueDateRaw = dueDateInput.value.trim(); // yyyy-mm-dd
            var type = typeInput.value;
            // Convert yyyy-mm-dd to dd/mm/jjjj
            var dueDate = "";
            if (dueDateRaw) {
                var _a = dueDateRaw.split("-"), year = _a[0], month = _a[1], day = _a[2];
                dueDate = "".concat(day, "/").concat(month, "/").concat(year);
            }
            currentBlock.innerText = "";
            // Get the column ID where the block is placed
            var column = currentBlock.parentElement;
            var columnId = column === null || column === void 0 ? void 0 : column.getAttribute("data-column-id");
            var blockId = generateUniqueId(); // Generate a unique ID for the block
            currentBlock.setAttribute("data-id", blockId); // Set the unique ID as a data attribute
            // Prepare block data
            var blockData = {
                status: "unavailable", // Default status
                title: title || "Naamloos blok",
                desc: desc,
                member: member,
                dueDate: dueDate,
                type: type,
                columnId: columnId || null, // Column ID or null if not found
                id: blockId, // Unique ID for the block
            };
            // Log the block data to the console
            console.log("Block data saved:", blockData);
            console.log("Sending block data to parent...");
            window.parent.postMessage({ type: "saveBlock", data: blockData }, "https://valcori-99218.bubbleapps.io/version-test");
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
            // Remove the unsaved block from the DOM
            if (currentBlock && currentBlock.parentElement) {
                currentBlock.parentElement.removeChild(currentBlock);
                updateBrackets();
            }
            // Hide the popup
            popup.classList.add("hidden");
            currentBlock = null;
        }
    });
    // Initial brackets
    updateBrackets();
});
// ✅ Receive block data from parent Bubble page
window.addEventListener("message", function (event) {
    console.log("***Received message from parent:", event.data);
    if (event.data.type === "loadBlocks") {
        var blocks = event.data.data;
        console.log("Loading blocks into workflow:", blocks);
        renderBlocks(blocks);
    }
    if (event.data.type === "loadMembers") {
        // If data is array of objects with membersName property
        if (Array.isArray(event.data.data) && event.data.data.length && typeof event.data.data[0] === "object") {
            membersList = event.data.data.map(function (m) { return m.membersName; });
        }
        else {
            membersList = event.data.data; // fallback for array of strings
        }
        populateMemberDropdown();
        console.log("Loaded members:", membersList);
    }
});
// ✅ Function to render blocks from database
function renderBlocks(blocks) {
    var canvas = document.getElementById("canvas");
    var template = document.getElementById("block-template");
    if (!canvas || !template) {
        console.error("Canvas or template not found!");
        return;
    }
    // --- Ensure columns for all block.columnId values ---
    var columnIdMap = {};
    var neededColumnIds = [];
    for (var i = 0; i < blocks.length; i++) {
        var id = blocks[i].columnId;
        if (id && !columnIdMap[id]) {
            columnIdMap[id] = true;
            neededColumnIds.push(id);
        }
    }
    neededColumnIds.forEach(function (id) {
        if (id === "start")
            return;
        if (!canvas.querySelector("[data-column-id=\"".concat(id, "\"]"))) {
            createColumn(canvas);
        }
    });
    // --- Group blocks by columnId for easier processing ---
    var blocksByColumn = {};
    blocks.forEach(function (block) {
        if (!blocksByColumn[block.columnId])
            blocksByColumn[block.columnId] = [];
        blocksByColumn[block.columnId].push(block);
    });
    // --- Sort columns in the order they appear in the DOM ---
    var columns = [].slice.call(canvas.querySelectorAll('.column'));
    // --- Track done status for previous columns ---
    var allPrevDone = true;
    for (var colIdx = 0; colIdx < columns.length; colIdx++) {
        var col = columns[colIdx];
        var colId = col.getAttribute("data-column-id");
        var colBlocks = colId ? (blocksByColumn[colId] || []) : [];
        // If not the first column, check if all previous columns' blocks are done
        if (colIdx > 0 && allPrevDone) {
            // Check all blocks in all previous columns
            var prevBlocksDone = true;
            for (var prevIdx = 0; prevIdx < colIdx; prevIdx++) {
                var prevColId = columns[prevIdx].getAttribute("data-column-id");
                var prevBlocks = prevColId ? (blocksByColumn[prevColId] || []) : [];
                for (var _i = 0, prevBlocks_1 = prevBlocks; _i < prevBlocks_1.length; _i++) {
                    var b = prevBlocks_1[_i];
                    if (b.status !== "done") {
                        prevBlocksDone = false;
                        break;
                    }
                }
                if (!prevBlocksDone)
                    break;
            }
            // If all previous blocks are done, set current column's blocks to busy (unless done/cancelled)
            // For typeEnded, set status to done
            if (prevBlocksDone) {
                for (var _a = 0, colBlocks_1 = colBlocks; _a < colBlocks_1.length; _a++) {
                    var b = colBlocks_1[_a];
                    if (b.type === "typeEnded") {
                        b.status = "done";
                    }
                    else if (b.status !== "done" && b.status !== "cancelled") {
                        b.status = "busy";
                    }
                }
            }
            allPrevDone = prevBlocksDone;
        }
        var _loop_1 = function (block) {
            if (!block.id)
                block.id = generateUniqueId();
            // Remove existing block if present
            var existingBlock = canvas.querySelector(".block[data-id=\"".concat(block.id, "\"]"));
            if (existingBlock && existingBlock.parentElement) {
                existingBlock.parentElement.removeChild(existingBlock);
            }
            console.log("Rendering block:", block);
            // Skip rendering this block if the description is "delete"
            if (block.type === "deleted") {
                console.log("Skipping block \"".concat(block.title, "\" due to delete instruction."));
                return "continue";
            }
            console.log("desc of rendered block", block.desc);
            // Clone the block template
            var blockElement = template.content.cloneNode(true);
            // Populate the block with data
            var titleElement = blockElement.querySelector(".block-title");
            var descElement = blockElement.querySelector(".block-desc");
            var memberElement = blockElement.querySelector(".block-member");
            var dueDateElement = blockElement.querySelector(".block-due-date");
            var typeElement = blockElement.querySelector(".block-type");
            var approveButton = blockElement.querySelector(".approve-button");
            var doneButton = blockElement.querySelector(".done-button");
            var redirectButton = blockElement.querySelector(".redirect-button");
            var statusCircle = blockElement.querySelector(".status-circle");
            if (block.type === "typeEnded") {
                // Only show title and status circle
                if (titleElement)
                    titleElement.textContent = block.title || "Naamloos blok";
                if (descElement)
                    descElement.remove();
                if (memberElement)
                    memberElement.remove();
                if (dueDateElement)
                    dueDateElement.remove();
                if (typeElement)
                    typeElement === null || typeElement === void 0 ? void 0 : typeElement.remove();
            }
            else {
                if (titleElement)
                    titleElement.textContent = block.title || "Naamloos blok";
                if (descElement)
                    descElement.textContent = block.desc || "No desc";
                if (memberElement)
                    memberElement.textContent = "Assigned to: ".concat(block.member || "None");
                if (dueDateElement)
                    dueDateElement.textContent = "Due: ".concat(block.dueDate || "No due date");
                if (typeElement)
                    typeElement.textContent = "Type: ".concat(block.type || "No type");
            }
            // Set the initial status circle color for all blocks
            if (statusCircle) {
                statusCircle.style.background = ""; // Remove any inline background color
                statusCircle.classList.remove("status-completed", "status-in-progress", "status-cancelled", "status-to-be-planned");
                if (block.status === "done") {
                    statusCircle.classList.add("status-completed");
                }
                else if (block.status === "busy") {
                    statusCircle.classList.add("status-in-progress");
                }
                else if (block.status === "cancelled") {
                    statusCircle.classList.add("status-cancelled");
                }
                else if (block.status === "unavailable") {
                    statusCircle.classList.add("status-to-be-planned");
                }
            }
            // Handle "Approve" button for typeApproval blocks
            if (block.type === "typeApproval" && approveButton) {
                approveButton.classList.remove("hidden");
                if (block.status === "done") {
                    approveButton.textContent = "Approved";
                    approveButton.disabled = true;
                }
                else {
                    approveButton.textContent = "Approve";
                }
                approveButton.addEventListener("click", function (event) {
                    event.stopPropagation();
                    block.status = "done";
                    approveButton.textContent = "Approved";
                    approveButton.disabled = true;
                    if (statusCircle) {
                        statusCircle.classList.remove("status-to-be-planned", "status-in-progress", "status-cancelled");
                        statusCircle.classList.add("status-completed");
                    }
                    window.parent.postMessage({ type: "updateBlock", data: block }, "https://valcori-99218.bubbleapps.io/version-test");
                    console.log("Block \"".concat(block.title, "\" approved."));
                });
            }
            // Handle "Done" button for typeAccept blocks
            if (block.type === "typeAccept" && doneButton) {
                doneButton.classList.remove("hidden");
                if (block.status === "done") {
                    doneButton.textContent = "Done ✔";
                    doneButton.disabled = true;
                }
                else {
                    doneButton.textContent = "Mark as done";
                }
                doneButton.addEventListener("click", function (event) {
                    event.stopPropagation();
                    block.status = "done";
                    doneButton.textContent = "Done ✔";
                    doneButton.disabled = true;
                    if (statusCircle) {
                        statusCircle.classList.remove("status-to-be-planned", "status-in-progress", "status-cancelled");
                        statusCircle.classList.add("status-completed");
                    }
                    window.parent.postMessage({ type: "updateBlock", data: block }, "https://valcori-99218.bubbleapps.io/version-test");
                    console.log("Block \"".concat(block.title, "\" marked as done."));
                });
            }
            // redirect
            if (block.type === "typeSubmit" && redirectButton) {
                redirectButton.classList.remove("hidden");
                if (block.status === "done") {
                    redirectButton.textContent = "Submitted";
                    redirectButton.disabled = true;
                }
                else {
                    redirectButton.textContent = "Fill in";
                }
                redirectButton.addEventListener("click", function (event) {
                    event.stopPropagation();
                    block.status = "busy";
                    redirectButton.textContent = "redirecting...";
                    redirectButton.disabled = true;
                    window.parent.postMessage({ type: "redirectBlock", data: block }, "https://valcori-99218.bubbleapps.io/version-test");
                    console.log("Block \"".concat(block.title, "\" redirected."));
                });
            }
            // Add click event listener to the block for editing
            var blockDiv = blockElement.querySelector(".block");
            if (blockDiv) {
                blockDiv.setAttribute("data-id", block.id);
                blockDiv.setAttribute("data-column-id", colId || "");
                blockDiv.addEventListener("click", function () {
                    if (block.status !== "done" || block.type !== "typeEnded") {
                        openEditPopup(block);
                    }
                });
            }
            col.appendChild(blockElement);
        };
        // Render blocks for this column
        for (var _b = 0, colBlocks_2 = colBlocks; _b < colBlocks_2.length; _b++) {
            var block = colBlocks_2[_b];
            _loop_1(block);
        }
    }
    // Ensure extra column at the end
    ensureExtraColumn();
    // Update brackets after rendering all blocks
    updateBrackets();
}
// Function to open the popup and populate it with block data
function openEditPopup(block) {
    var popup = document.getElementById("popup");
    var titleInput = document.getElementById("popupTitleInput");
    var descInput = document.getElementById("popupDesc");
    var dueDateInput = document.getElementById("popupDueDate");
    var typeInput = document.getElementById("popupType");
    var savePopup = document.getElementById("savePopup");
    if (!popup || !titleInput || !descInput || !dueDateInput || !typeInput || !savePopup) {
        console.error("Popup or input elements not found!");
        return;
    }
    // Populate the popup with the block's current data
    titleInput.value = block.title || "";
    descInput.value = block.desc || "";
    populateMemberDropdown(block.member || ""); // <-- Use the function here
    if (block.dueDate && block.dueDate.includes("/")) {
        var _a = block.dueDate.split("/"), day = _a[0], month = _a[1], year = _a[2];
        dueDateInput.value = "".concat(year, "-").concat(month.padStart(2, "0"), "-").concat(day.padStart(2, "0"));
    }
    else {
        dueDateInput.value = block.dueDate || "";
    }
    typeInput.value = block.type || "";
    // Show the popup
    popup.classList.remove("hidden");
    // Handle saving the updated block data
    savePopup.onclick = function () {
        block.title = titleInput.value.trim();
        block.desc = descInput.value.trim();
        block.member = document.getElementById("popupMember").value;
        block.dueDate = dueDateInput.value.trim();
        block.type = typeInput.value;
        // Send the updated block to the Bubble database
        window.parent.postMessage({ type: "updateBlock", data: block }, "https://valcori-99218.bubbleapps.io/version-test");
        // Hide the popup
        popup.classList.add("hidden");
        console.log("Block \"".concat(block.title, "\" updated and saved."));
    };
    var deleteButton = document.getElementById("deleteBlock");
    if (deleteButton) {
        deleteButton.onclick = function () {
            block.type = "deleted";
            block.status = "done";
            window.parent.postMessage({ type: "updateBlock", data: block }, "https://valcori-99218.bubbleapps.io/version-test");
            popup.classList.add("hidden");
            console.log("Block \"".concat(block.title, "\" marked as delete."));
        };
    }
}
function generateUniqueId() {
    return "block-".concat(Math.random().toString(36).substr(2, 9));
}
