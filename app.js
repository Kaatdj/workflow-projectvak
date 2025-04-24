var draggedBlock = null;
var currentBlock = null;
window.addEventListener("DOMContentLoaded", function () {
    var popup = document.getElementById("popup");
    var titleInput = document.getElementById("popupTitleInput");
    var descInput = document.getElementById("popupDesc");
    var savePopup = document.getElementById("savePopup");
    var canvas = document.getElementById("canvas");
    var editBtn = document.getElementById("editBtn");
    var sidebar = document.getElementById("sidebar");
    var closeSidebar = document.getElementById("closeSidebar");
    if (!popup || !titleInput || !descInput || !savePopup || !canvas || !editBtn || !sidebar || !closeSidebar) {
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
    var _loop_1 = function (i) {
        var col = document.createElement("div");
        col.classList.add("column");
        col.dataset.index = i.toString();
        col.addEventListener("dragover", function (e) {
            e.preventDefault();
            col.classList.add("highlight");
        });
        col.addEventListener("dragleave", function () {
            col.classList.remove("highlight");
        });
        col.addEventListener("drop", function (e) {
            e.preventDefault();
            col.classList.remove("highlight");
            if (draggedBlock) {
                var clone = draggedBlock.cloneNode(true);
                clone.classList.remove("draggable");
                clone.style.cursor = "default";
                currentBlock = clone;
                col.appendChild(clone);
                // Show the popup to fill in block details
                popup.classList.remove("hidden");
                draggedBlock = null;
            }
        });
        canvas.appendChild(col);
    };
    // Create 3 columns
    for (var i = 0; i < 3; i++) {
        _loop_1(i);
    }
    // Set up drag events for blocks in the palette
    document.querySelectorAll(".draggable").forEach(function (el) {
        el.addEventListener("dragstart", function () {
            draggedBlock = el;
        });
    });
    // Save block content from popup
    savePopup.addEventListener("click", function () {
        if (currentBlock && titleInput && descInput) {
            var title = titleInput.value.trim();
            var desc = descInput.value.trim();
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
    popup.addEventListener("click", function (e) {
        if (e.target === popup) {
            // Reset popup fields
            titleInput.value = "";
            descInput.value = "";
            // Hide the popup
            popup.classList.add("hidden");
            currentBlock = null;
        }
    });
});
