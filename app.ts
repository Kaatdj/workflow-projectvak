let draggedBlock: HTMLElement | null = null;
let currentBlock: HTMLElement | null = null;

// Global counter for column IDs
let columnCounter = 0;
let membersList: string[] = [];

function updateBrackets() {
  const canvas = document.getElementById("canvas"); // <-- You missed this!
  const bracketsContainer = document.getElementById("brackets");
  const columns = canvas?.querySelectorAll(".column");

  if (!canvas || !bracketsContainer || !columns) return;

  // Clear existing brackets
  bracketsContainer.innerHTML = "";

  columns.forEach((column, columnIndex) => {
    const blocks = column.querySelectorAll(".block");
    const prevColumn = columns[columnIndex - 1];
    const nextColumn = columns[columnIndex + 1];

    if (blocks.length >= 2) {
      const firstBlock = blocks[0];
      const lastBlock = blocks[blocks.length - 1];

      const firstBlockRect = firstBlock.getBoundingClientRect();
      const lastBlockRect = lastBlock.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();

      const top = firstBlockRect.top + firstBlockRect.height / 2 - canvasRect.top;
      const bottom = lastBlockRect.bottom - lastBlockRect.height / 2 - canvasRect.top;
      const height = bottom - top;
      const center = top + height / 2;

      // Left bracket
      const leftBracket = document.createElement("div");
      leftBracket.classList.add("bracket-left");
      leftBracket.style.position = "absolute";
      leftBracket.style.top = `${top}px`;
      leftBracket.style.left = `${(column as HTMLElement).offsetLeft + 22}px`;
      leftBracket.style.height = `${height}px`;
      leftBracket.style.width = "15px";
      leftBracket.style.transform = "translateX(-100%)";
      bracketsContainer.appendChild(leftBracket);

      // Horizontal line depending on previous column
      if (prevColumn) {
        const prevBlocks = prevColumn.querySelectorAll(".block");

        const horizontalLine = document.createElement("div");
        horizontalLine.classList.add("horizontal-line");
        horizontalLine.style.position = "absolute";
        horizontalLine.style.top = `${center}px`;
        horizontalLine.style.left = `${(column as HTMLElement).offsetLeft + 6.5}px`;
        horizontalLine.style.transform = "translateX(-100%)";

        if (prevBlocks.length > 1) {
          horizontalLine.style.width = "33px";
        } else {
          horizontalLine.style.width = "50px";
        }

        bracketsContainer.appendChild(horizontalLine);
      }

      // Right bracket if there's a next column
      if (nextColumn) {
        const nextBlocks = nextColumn.querySelectorAll(".block");
        if (nextBlocks.length > 0) {
          const rightBracket = document.createElement("div");
          rightBracket.classList.add("bracket-right");
          rightBracket.style.position = "absolute";
          rightBracket.style.top = `${top}px`;
          rightBracket.style.left = `${(column as HTMLElement).offsetLeft + (column as HTMLElement).offsetWidth - 22}px`;
          rightBracket.style.height = `${height}px`;
          rightBracket.style.width = "15px";
          bracketsContainer.appendChild(rightBracket);
        }
      }
    }
    else if (blocks.length === 1 && prevColumn) {
      const firstBlock = blocks[0];
      const lastBlock = blocks[blocks.length - 1];

      const firstBlockRect = firstBlock.getBoundingClientRect();
      const lastBlockRect = lastBlock.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();

      const top = firstBlockRect.top + firstBlockRect.height / 2 - canvasRect.top;
      const bottom = lastBlockRect.bottom - lastBlockRect.height / 2 - canvasRect.top;
      const height = bottom - top;
      const center = top + height / 2;

      const prevBlocks = prevColumn.querySelectorAll(".block");

      const horizontalLine = document.createElement("div");
      horizontalLine.classList.add("horizontal-line");
      horizontalLine.style.position = "absolute";
      horizontalLine.style.top = `${center}px`;
      horizontalLine.style.transform = "translateX(-100%)";

      if (prevBlocks.length > 1) {
        horizontalLine.style.left = `${(column as HTMLElement).offsetLeft + 24}px`;
        horizontalLine.style.width = "50px";
      } else if (prevBlocks.length === 1) {
        horizontalLine.style.left = `${(column as HTMLElement).offsetLeft + 22}px`;
        horizontalLine.style.width = "100px";
      }

      bracketsContainer.appendChild(horizontalLine);
    }
  });
}

function createColumn(parent: HTMLElement, isStartColumn = false) {
  const col = document.createElement("div");
  col.classList.add("column");

  // Assign "start" to the first column, otherwise use colX
  const columns = parent.querySelectorAll(".column");
  const columnId = isStartColumn || columns.length === 0 ? "start" : `col${columnCounter++}`;
  col.setAttribute("data-column-id", columnId);

  col.addEventListener("dragover", (e) => {
    e.preventDefault();
    // Prevent highlighting the first column
    if (col.getAttribute("data-column-id") === "start") return;
    col.classList.add("highlight");
  });

  col.addEventListener("dragleave", () => {
    col.classList.remove("highlight");
  });

  col.addEventListener("drop", (e) => {
    e.preventDefault();
    col.classList.remove("highlight");
    // Prevent dropping in the first column
    if (col.getAttribute("data-column-id") === "start") {
      console.log("Cannot add blocks to the first column.");
      return;
    }
    if (draggedBlock) {
      const clone = draggedBlock.cloneNode(true) as HTMLElement;
      clone.classList.remove("draggable");
      clone.style.cursor = "default";
      currentBlock = clone;
      // Ensure the block's columnId matches the column's data-column-id
      const columnId = col.getAttribute("data-column-id");
      if (columnId) {
        clone.setAttribute("data-column-id", columnId);
        console.log(`Block added to column "${columnId}".`);
      }
      col.appendChild(clone);
      // Show the popup to fill in block details
      const popup = document.getElementById("popup");
      if (popup) popup.classList.remove("hidden");
      draggedBlock = null;
      ensureExtraColumn();
      updateBrackets();
    }
  });

  parent.appendChild(col);
}

function ensureExtraColumn() {
  const canvas = document.getElementById("canvas");
  if (!canvas) return;
  const columns = canvas.querySelectorAll(".column");
  const lastColumn = columns[columns.length - 1];
  // If the last column has any blocks, add a new empty column
  if (lastColumn && lastColumn.children.length > 0) {
    createColumn(canvas);
  }
}

function populateMemberDropdown(selectedMember: string = "") {
  const memberInput = document.getElementById("popupMember") as HTMLSelectElement | null;
  if (!memberInput) return;
  memberInput.innerHTML = '<option value="" disabled>Select Members</option>';
  membersList.forEach(member => {
    const option = document.createElement("option");
    option.value = member;
    option.textContent = member;
    if (member === selectedMember) option.selected = true;
    memberInput.appendChild(option);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("popup");
  const titleInput = document.getElementById("popupTitleInput") as HTMLInputElement | null;
  const descInput = document.getElementById("popupDesc") as HTMLTextAreaElement | null;
  const memberInput = document.getElementById("popupMember") as HTMLSelectElement | null;
  const dueDateInput = document.getElementById("popupDueDate") as HTMLInputElement | null;
  const typeInput = document.getElementById("popupType") as HTMLSelectElement | null;
  const savePopup = document.getElementById("savePopup");
  const canvas = document.getElementById("canvas");
  const editBtn = document.getElementById("editBtn");
  const sidebar = document.getElementById("sidebar");
  const closeSidebar = document.getElementById("closeSidebar");

  if (!popup || !titleInput || !descInput || !memberInput || !dueDateInput || !typeInput || !savePopup || !canvas || !editBtn || !sidebar || !closeSidebar) {
    console.error("One or more required elements are missing from the DOM.");
    return;
  }

  // Hide the popup and sidebar by default
  popup.classList.add("hidden");
  sidebar.classList.add("hidden");

  // "Bewerk" button functionality to show the sidebar
  editBtn.addEventListener("click", () => {
    sidebar.classList.remove("hidden");
  });

  // Close the sidebar when the close button is clicked
  closeSidebar.addEventListener("click", () => {
    sidebar.classList.add("hidden");
  });

  // Create the initial columns, including the "start" block in the first column
  createColumn(canvas, true); // First column with "start" block
  createColumn(canvas); // Always have an extra column

  // Set up drag events for blocks in the palette
  document.querySelectorAll(".draggable").forEach((el) => {
    el.addEventListener("dragstart", () => {
      draggedBlock = el as HTMLElement;
    });
  });

  // Save block content from popup
  savePopup.addEventListener("click", () => {
    if (currentBlock && titleInput && descInput && memberInput && dueDateInput && typeInput) {
      // Validation for required fields
      if (!titleInput.value.trim()) {
        alert("Title is required.");
        titleInput.focus();
        return;
      }
      if (!memberInput.value) {
        alert("Member is required.");
        memberInput.focus();
        return;
      }
      if (!typeInput.value) {
        alert("Type is required.");
        typeInput.focus();
        return;
      }

      const title = titleInput.value.trim();
      const desc = descInput.value.trim();
      const member = memberInput.value;
      const dueDate = dueDateInput.value.trim();
      const type = typeInput.value;

      currentBlock.innerText = "";

      // Get the column ID where the block is placed
      const column = currentBlock.parentElement;
      const columnId = column?.getAttribute("data-column-id");
      const blockId = generateUniqueId(); // Generate a unique ID for the block
      currentBlock.setAttribute("data-id", blockId); // Set the unique ID as a data attribute

      // Prepare block data
      const blockData = {
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
  popup.addEventListener("click", (e) => {
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
window.addEventListener("message", function(event) {
  console.log("***Received message from parent:", event.data);
  if (event.data.type === "loadBlocks") {
    const blocks = event.data.data;
    console.log("Loading blocks into workflow:", blocks);
    renderBlocks(blocks);
  }
  if (event.data.type === "loadMembers") {
  // If data is array of objects with membersName property
  if (Array.isArray(event.data.data) && event.data.data.length && typeof event.data.data[0] === "object") {
    membersList = event.data.data.map((m: any) => m.membersName);
  } else {
    membersList = event.data.data; // fallback for array of strings
  }    
    populateMemberDropdown();
    console.log("Loaded members:", membersList);
  }
});

// ✅ Function to render blocks from database
function renderBlocks(blocks) {
  const canvas = document.getElementById("canvas");
  const template = document.getElementById("block-template") as HTMLTemplateElement;

  if (!canvas || !template) {
    console.error("Canvas or template not found!");
    return;
  }

  // --- Ensure columns for all block.columnId values ---
  const columnIdMap: { [key: string]: boolean } = {};
  const neededColumnIds: string[] = [];
  for (var i = 0; i < blocks.length; i++) {
    var id = blocks[i].columnId;
    if (id && !columnIdMap[id]) {
      columnIdMap[id] = true;
      neededColumnIds.push(id);
    }
  }
  neededColumnIds.forEach(id => {
    if (id === "start") return;
    if (!canvas.querySelector(`[data-column-id="${id}"]`)) {
      createColumn(canvas);
    }
  });

  // --- Group blocks by columnId for easier processing ---
  const blocksByColumn: { [colId: string]: any[] } = {};
  blocks.forEach(block => {
    if (!blocksByColumn[block.columnId]) blocksByColumn[block.columnId] = [];
    blocksByColumn[block.columnId].push(block);
  });

  // --- Sort columns in the order they appear in the DOM ---
  const columns = [].slice.call(canvas.querySelectorAll('.column')) as HTMLElement[];

  // --- Track done status for previous columns ---
  let allPrevDone = true;
  for (let colIdx = 0; colIdx < columns.length; colIdx++) {
    const col = columns[colIdx];
    const colId = col.getAttribute("data-column-id");
    const colBlocks = colId ? (blocksByColumn[colId] || []) : [];

    // If not the first column, check if all previous columns' blocks are done
    if (colIdx > 0 && allPrevDone) {
      // Check all blocks in all previous columns
      let prevBlocksDone = true;
      for (let prevIdx = 0; prevIdx < colIdx; prevIdx++) {
        const prevColId = columns[prevIdx].getAttribute("data-column-id");
        const prevBlocks = prevColId ? (blocksByColumn[prevColId] || []) : [];
        for (let b of prevBlocks) {
          if (b.status !== "done") {
            prevBlocksDone = false;
            break;
          }
        }
        if (!prevBlocksDone) break;
      }
      // If all previous blocks are done, set current column's blocks to busy (unless done/cancelled)
      if (prevBlocksDone) {
        for (let b of colBlocks) {
          if (b.status !== "done" && b.status !== "cancelled") {
            b.status = "busy";
          }
        }
      }
      allPrevDone = prevBlocksDone;
    }

    // Render blocks for this column
    for (let block of colBlocks) {
      if (!block.id) block.id = generateUniqueId();

      // Remove existing block if present
      let existingBlock = canvas.querySelector(`.block[data-id="${block.id}"]`);
      if (existingBlock && existingBlock.parentElement) {
        existingBlock.parentElement.removeChild(existingBlock);
      }
      console.log("Rendering block:", block);
      // Skip rendering this block if the description is "delete"
      if (block.type === "deleted") {
        console.log(`Skipping block "${block.title}" due to delete instruction.`);
        continue; // Skip this block, do not render
      }
      console.log("desc of rendered block", block.desc);
      // Clone the block template
      const blockElement = template.content.cloneNode(true) as HTMLElement;

      // Populate the block with data
      const titleElement = blockElement.querySelector(".block-title");
      const descElement = blockElement.querySelector(".block-desc");
      const memberElement = blockElement.querySelector(".block-member");
      const dueDateElement = blockElement.querySelector(".block-due-date");
      const typeElement = blockElement.querySelector(".block-type");
      const approveButton = blockElement.querySelector(".approve-button") as HTMLButtonElement;
      const doneButton = blockElement.querySelector(".done-button") as HTMLButtonElement;
      const statusCircle = blockElement.querySelector(".status-circle") as HTMLElement;

      if (titleElement) titleElement.textContent = block.title || "Naamloos blok";
      if (descElement) descElement.textContent = block.desc || "No desc";
      if (memberElement) memberElement.textContent = `Assigned to: ${block.member || "None"}`;
      if (dueDateElement) dueDateElement.textContent = `Due: ${block.dueDate || "No due date"}`;
      if (typeElement) typeElement.textContent = `Type: ${block.type || "No type"}`;

      // Set the initial status circle color for all blocks
      if (statusCircle) {
        statusCircle.style.background = ""; // Remove any inline background color
        statusCircle.classList.remove(
          "status-completed",
          "status-in-progress",
          "status-cancelled",
          "status-to-be-planned"
        );
        if (block.status === "done") {
          statusCircle.classList.add("status-completed");
        } else if (block.status === "busy") {
          statusCircle.classList.add("status-in-progress");
        } else if (block.status === "cancelled") {
          statusCircle.classList.add("status-cancelled");
        } else if (block.status === "unavailable") {
          statusCircle.classList.add("status-to-be-planned");
        }
      }

      // Handle "Approve" button for typeApproval blocks
      if (block.type === "typeApproval" && approveButton) {
        approveButton.classList.remove("hidden");
        if (block.status === "done") {
          approveButton.textContent = "Approved";
          approveButton.disabled = true;
        } else if (block.status === "unavailable") {
          doneButton.disabled = true;
        } else {
          approveButton.textContent = "Approve";
        }
        approveButton.addEventListener("click", (event) => {
          event.stopPropagation();
          block.status = "done";
          approveButton.textContent = "Approved";
          approveButton.disabled = true;
          if (statusCircle) {
            statusCircle.classList.remove("status-to-be-planned", "status-in-progress", "status-cancelled");
            statusCircle.classList.add("status-completed");
          }
          window.parent.postMessage({ type: "updateBlock", data: block }, "https://valcori-99218.bubbleapps.io/version-test");
          console.log(`Block "${block.title}" approved.`);
        });
      }

      // Handle "Done" button for typeAccept blocks
      if (block.type === "typeAccept" && doneButton) {
        doneButton.classList.remove("hidden");
        if (block.status === "done") {
          doneButton.textContent = "Done ✔";
          doneButton.disabled = true;
        } else if (block.status === "unavailable") {
          doneButton.disabled = true;
        } else {
          doneButton.textContent = "Mark as done";
        }
        doneButton.addEventListener("click", (event) => {
          event.stopPropagation();
          block.status = "done";
          doneButton.textContent = "Done ✔";
          doneButton.disabled = true;
          if (statusCircle) {
            statusCircle.classList.remove("status-to-be-planned", "status-in-progress", "status-cancelled");
            statusCircle.classList.add("status-completed");
          }
          window.parent.postMessage({ type: "updateBlock", data: block }, "https://valcori-99218.bubbleapps.io/version-test");
          console.log(`Block "${block.title}" marked as done.`);
        });
      }

      // Add click event listener to the block for editing
      const blockDiv = blockElement.querySelector(".block") as HTMLElement;
      if (blockDiv) {
        blockDiv.setAttribute("data-id", block.id);
        blockDiv.setAttribute("data-column-id", colId || "");
        blockDiv.addEventListener("click", () => {
          openEditPopup(block);
        });
      }

      col.appendChild(blockElement);
    }
  }

  // Ensure extra column at the end
  ensureExtraColumn();

  // Update brackets after rendering all blocks
  updateBrackets();
}

// Function to open the popup and populate it with block data
function openEditPopup(block) {
  const popup = document.getElementById("popup");
  const titleInput = document.getElementById("popupTitleInput") as HTMLInputElement;
  const descInput = document.getElementById("popupDesc") as HTMLTextAreaElement;
  const dueDateInput = document.getElementById("popupDueDate") as HTMLInputElement;
  const typeInput = document.getElementById("popupType") as HTMLSelectElement;
  const savePopup = document.getElementById("savePopup");

  if (!popup || !titleInput || !descInput || !dueDateInput || !typeInput || !savePopup) {
    console.error("Popup or input elements not found!");
    return;
  }

  // Populate the popup with the block's current data
  titleInput.value = block.title || "";
  descInput.value = block.desc || "";
  populateMemberDropdown(block.member || ""); // <-- Use the function here
  dueDateInput.value = block.dueDate || "";
  typeInput.value = block.type || "";

  // Show the popup
  popup.classList.remove("hidden");

  // Handle saving the updated block data
  savePopup.onclick = () => {
    block.title = titleInput.value.trim();
    block.desc = descInput.value.trim();
    block.member = (document.getElementById("popupMember") as HTMLSelectElement).value;
    block.dueDate = dueDateInput.value.trim();
    block.type = typeInput.value;

    // Send the updated block to the Bubble database
    window.parent.postMessage({ type: "updateBlock", data: block }, "https://valcori-99218.bubbleapps.io/version-test");

    // Hide the popup
    popup.classList.add("hidden");

    console.log(`Block "${block.title}" updated and saved.`);
  };

  const deleteButton = document.getElementById("deleteBlock");
  if (deleteButton) {
    deleteButton.onclick = () => {
      block.type = "deleted";
      block.status = "done";
      window.parent.postMessage({ type: "updateBlock", data: block }, "https://valcori-99218.bubbleapps.io/version-test");
      popup.classList.add("hidden");
      console.log(`Block "${block.title}" marked as delete.`);
    };
  }
}

function generateUniqueId() {
  return `block-${Math.random().toString(36).substr(2, 9)}`;
}