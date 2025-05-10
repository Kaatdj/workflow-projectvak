let draggedBlock: HTMLElement | null = null;
let currentBlock: HTMLElement | null = null;

// Global counter for column IDs
let columnCounter = 0;

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
      const title = titleInput.value.trim();
      const desc = descInput.value.trim();
      const member = memberInput.value;
      const dueDate = dueDateInput.value.trim();
      const type = typeInput.value;

      currentBlock.innerText = title || "Naamloos blok";

      // Get the column ID where the block is placed
      const column = currentBlock.parentElement;
      const columnId = column?.getAttribute("data-column-id");

      // Prepare block data
      const blockData = {
        status: "unavailable", // Default status
        title: title || "Naamloos blok",
        description: desc,
        member: member,
        dueDate: dueDate,
        type: type,
        columnId: columnId || null, // Column ID or null if not found
      };

      // Log the block data to the console
      console.log("Block data saved:", blockData);
      console.log("Sending block data to parent...");

      setTimeout(() => {
        console.log("timeout");
        window.parent.postMessage({ type: "saveBlock", data: blockData }, "https://valcori-99218.bubbleapps.io/version-test");
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
  popup.addEventListener("click", (e) => {
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
  function createColumn(parent: HTMLElement, isStartColumn = false) {
    const col = document.createElement("div");
    col.classList.add("column");

    // Assign a sequential column ID
    const columnId = isStartColumn ? "start" : `col${columnCounter++}`;
    col.setAttribute("data-column-id", columnId);

    if (isStartColumn) {
      // Add the "start" block to the first column
      const startBlock = document.createElement("div");
      startBlock.classList.add("block", "start-block");
      startBlock.innerText = "Start";
      col.appendChild(startBlock);
    }

    col.addEventListener("dragover", (e) => {
      e.preventDefault();

      // Prevent highlighting the first column
      if (isStartColumn) {
        return;
      }

      col.classList.add("highlight");
    });

    col.addEventListener("dragleave", () => {
      col.classList.remove("highlight");
    });

    col.addEventListener("drop", (e) => {
      e.preventDefault();
      col.classList.remove("highlight");

      // Prevent adding blocks to the first column
      if (isStartColumn) {
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
    const columns = canvas ? canvas.querySelectorAll(".column") : [];
    const lastColumn = columns[columns.length - 1];

    // If the last column has any blocks, add a new empty column
    if (lastColumn && lastColumn.children.length > 0) {
      createColumn(canvas);
    }
  }

  // Function to update brackets
 // Function to update brackets
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

// Call this function whenever blocks are added, removed, or moved
updateBrackets();
})

// ✅ Receive block data from parent Bubble page
window.addEventListener("message", function(event) {
  console.log("**Received message from parent:", event.data);
    if (event.data.type === "loadBlocks") {
        const blocks = event.data.data;
        console.log("Loading blocks into workflow:", blocks);
        renderBlocks(blocks);
    }
});

// ✅ Function to render blocks from database
function renderBlocks(blocks) {
    const canvas = document.getElementById("canvas");
    const template = document.getElementById("block-template") as HTMLTemplateElement;

    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }

    if (!template) {
        console.error("Block template not found!");
        return;
    }

    blocks.forEach((block) => {
// Generate a unique ID for the block if it doesn't already have one
        if (!block.id) {
            block.id = `${block.columnId}-${block.title}-${Date.now()}`;
        }

        console.log("Rendering block:", block);

        // Check if the block already exists in the DOM
        let existingBlock = canvas.querySelector(`.block[data-id="${block.id}"]`);
        if (existingBlock) {
            console.log(`Block with ID ${block.id} already exists. Updating...`);

            // Update the existing block's content
            const titleElement = existingBlock.querySelector(".block-title");
            const descriptionElement = existingBlock.querySelector(".block-description");
            const memberElement = existingBlock.querySelector(".block-member");
            const dueDateElement = existingBlock.querySelector(".block-due-date");
            const typeElement = existingBlock.querySelector(".block-type");
            const statusCircle = existingBlock.querySelector(".status-circle");

            if (titleElement) titleElement.textContent = block.title || "Naamloos blok";
            if (descriptionElement) descriptionElement.textContent = block.description || "No description";
            if (memberElement) memberElement.textContent = `Assigned to: ${block.member || "None"}`;
            if (dueDateElement) dueDateElement.textContent = `Due: ${block.dueDate || "No due date"}`;
            if (typeElement) typeElement.textContent = `Type: ${block.type || "No type"}`;

            // Update the status circle
            if (statusCircle) {
                statusCircle.classList.remove("status-unavailable", "status-busy", "status-done");

                if (block.status === "done") {
                    statusCircle.classList.add("status-done");
                } else if (block.status === "busy") {
                    statusCircle.classList.add("status-busy");
                } else {
                    statusCircle.classList.add("status-unavailable");
                }
            }

            return; // Skip creating a new block
        }

        // If the block does not exist, create a new one
        let column = canvas.querySelector(`[data-column-id="${block.columnId}"]`);
        if (!column) {
            console.log(`Column with ID ${block.columnId} not found. Creating a new column.`);
            column = document.createElement("div");
            column.classList.add("column");

            // Assign a sequential column ID
            const newColumnId = `col${columnCounter++}`;
            column.setAttribute("data-column-id", newColumnId);

            canvas.appendChild(column);
        }

        // Clone the block template
        const blockElement = template.content.cloneNode(true) as HTMLElement;

        // Populate the block with data
        const titleElement = blockElement.querySelector(".block-title");
        const descriptionElement = blockElement.querySelector(".block-description");
        const memberElement = blockElement.querySelector(".block-member");
        const dueDateElement = blockElement.querySelector(".block-due-date");
        const typeElement = blockElement.querySelector(".block-type");
        const approveButton = blockElement.querySelector(".approve-btn") as HTMLButtonElement;
        const statusCircle = blockElement.querySelector(".status-circle") as HTMLElement;

        if (titleElement) titleElement.textContent = block.title || "Naamloos blok";
        if (descriptionElement) descriptionElement.textContent = block.description || "No description";
        if (memberElement) memberElement.textContent = `Assigned to: ${block.member || "None"}`;
        if (dueDateElement) dueDateElement.textContent = `Due: ${block.dueDate || "No due date"}`;
        if (typeElement) typeElement.textContent = `Type: ${block.type || "No type"}`;

        // Set the initial status circle color for all blocks
        if (statusCircle) {
            if (block.status === "done") {
                statusCircle.classList.add("status-done");
            } else if (block.status === "busy") {
                statusCircle.classList.add("status-busy");
            } else {
                statusCircle.classList.add("status-unavailable");
            }
        }

        // Handle "Approve" button for typeApproval blocks
        if (block.type === "typeApproval" && approveButton) {
            approveButton.classList.remove("hidden");
            if (block.status === "done") {
                approveButton.textContent = "Approved"; // Change button text
                approveButton.disabled = true; // Disable the button
            } else {
                approveButton.textContent = "Approve";
            }

            // Add click event listener to the button
            approveButton.addEventListener("click", (event) => {
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

                console.log(`Block "${block.title}" approved.`);
            });
        }

        // Add click event listener to the block for editing
        const blockDiv = blockElement.querySelector(".block") as HTMLElement;
        if (blockDiv) {
            blockDiv.setAttribute("data-id", block.id); // Add a unique identifier
            blockDiv.setAttribute("data-column-id", column.getAttribute("data-column-id") || "");
            blockDiv.setAttribute("data-title", block.title || "Naamloos blok");
            blockDiv.setAttribute("data-description", block.description || "");
            blockDiv.setAttribute("data-member", block.member || "");
            blockDiv.setAttribute("data-due-date", block.dueDate || "");
            blockDiv.setAttribute("data-type", block.type || "");

            blockDiv.addEventListener("click", () => {
                openEditPopup(block); // Open the popup to edit the block
            });
        }

        console.log(`Block "${block.title}" assigned to column "${column.getAttribute("data-column-id")}".`);

        column.appendChild(blockElement); // Append the block to the column
    });
}

// Function to open the popup and populate it with block data
function openEditPopup(block) {
    const popup = document.getElementById("popup");
    const titleInput = document.getElementById("popupTitleInput") as HTMLInputElement;
    const descInput = document.getElementById("popupDesc") as HTMLTextAreaElement;
    const memberInput = document.getElementById("popupMember") as HTMLSelectElement;
    const dueDateInput = document.getElementById("popupDueDate") as HTMLInputElement;
    const typeInput = document.getElementById("popupType") as HTMLSelectElement;
    const savePopup = document.getElementById("savePopup");

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
    savePopup.onclick = () => {
        block.title = titleInput.value.trim();
        block.description = descInput.value.trim();
        block.member = memberInput.value;
        block.dueDate = dueDateInput.value.trim();
        block.type = typeInput.value;

        // Send the updated block to the Bubble database
        window.parent.postMessage({ type: "saveBlock", data: block }, "https://valcori-99218.bubbleapps.io/version-test");

        // Hide the popup
        popup.classList.add("hidden");

        console.log(`Block "${block.title}" updated and saved.`);
    };
}
