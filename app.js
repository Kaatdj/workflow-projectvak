var editBtn = document.getElementById("editBtn");
var sidebar = document.getElementById("sidebar");
var canvas = document.getElementById("canvas");
editBtn.addEventListener("click", function () {
    sidebar.classList.toggle("hidden");
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
            col.appendChild(clone);
            draggedBlock = null;
        }
    });
    canvas.appendChild(col);
};
// Create initial 3 columns
for (var i = 0; i < 3; i++) {
    _loop_1(i);
}
var draggedBlock = null;
document.querySelectorAll(".draggable").forEach(function (el) {
    el.addEventListener("dragstart", function () {
        draggedBlock = el;
    });
});
