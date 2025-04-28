let draggedBlock: HTMLElement | null = null;
let currentBlock: HTMLElement | null = null;

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
      currentBlock.setAttribute("title", desc);

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
      
    window.parent.postMessage(
      {
        type: "saveBlock",
        data: blockData,
      },
      "https://valcori-99218.bubbleapps.io/version-test"
    );

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
    col.setAttribute("data-column-id", generateUniqueId()); // Assign a unique ID to the column

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

function generateUniqueId(): string {
  return Math.random().toString(36).substr(2, 9);
}
