let draggedBlock: HTMLElement | null = null;
let currentBlock: HTMLElement | null = null;

window.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("popup");
  const titleInput = document.getElementById("popupTitleInput") as HTMLInputElement | null;
  const descInput = document.getElementById("popupDesc") as HTMLTextAreaElement | null;
  const savePopup = document.getElementById("savePopup");
  const canvas = document.getElementById("canvas");
  const editBtn = document.getElementById("editBtn");
  const sidebar = document.getElementById("sidebar");
  const closeSidebar = document.getElementById("closeSidebar");

  if (!popup || !titleInput || !descInput || !savePopup || !canvas || !editBtn || !sidebar || !closeSidebar) {
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
    if (currentBlock && titleInput && descInput) {
      const title = titleInput.value.trim();
      const desc = descInput.value.trim();

      currentBlock.innerText = title || "Naamloos blok";
      currentBlock.setAttribute("title", desc);

      // Reset popup fields
      titleInput.value = "";
      descInput.value = "";

      // Hide the popup
      popup.classList.add("hidden");
      currentBlock = null;
    }
  });

  // Close popup when clicking outside of it
  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      // Reset popup fields
      titleInput.value = "";
      descInput.value = "";

      // Hide the popup
      popup.classList.add("hidden");
      currentBlock = null;
    }
  });

  // Function to create a new column
  function createColumn(parent: HTMLElement, isStartColumn = false) {
    const col = document.createElement("div");
    col.classList.add("column");

    if (isStartColumn) {
      // Add the "start" block to the first column
      const startBlock = document.createElement("div");
      startBlock.classList.add("block", "start-block");
      startBlock.innerText = "Start";
      col.appendChild(startBlock);
    }

    col.addEventListener("dragover", (e) => {
      e.preventDefault();
      col.classList.add("highlight");
    });

    col.addEventListener("dragleave", () => {
      col.classList.remove("highlight");
    });

    col.addEventListener("drop", (e) => {
      e.preventDefault();
      col.classList.remove("highlight");

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
});
