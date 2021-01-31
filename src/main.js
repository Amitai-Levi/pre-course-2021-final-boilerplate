///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////// page construction ///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//this list comes from jsonbin and it's the main data of the page
let mainToDoList = [];
//this lists saves data about undo and redo actions
let undoList = [];
let redoList = [];

(async function () {
  await getList();
  await viewSectionBuilder();
})();
let sorted = false;
// the function returns an array of ToDo elements fron JSONBIN
async function getList() {
  await fetch("https://api.jsonbin.io/v3/b/60119d6f3126bb747e9fd46d/latest")
    .then((response) => response.json())
    .then((retrievedData) => (mainToDoList = retrievedData.record["my-todo"]));
}
//the function gets a new list and replaces it with the old one in JSONBIN
async function pushToList(newList) {
  let toDoList = "";
  await fetch("https://api.jsonbin.io/v3/b/60119d6f3126bb747e9fd46d", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ "my-todo": newList }),
  })
    .then((response) => response.json())
    .then((outcome) => outcome.record["my-todo"])
    .catch((error) => error);
  mainToDoList = newList;
  return newList;
}
// assigning event listener to 'sort' and 'add' buttons
document.querySelector("#add-button").addEventListener("click", addNewTask);
document.querySelector("#sort-button").addEventListener("click", sort);
document.querySelector("#clear-button").addEventListener("click", clear);

//setting the counter text to the number of view section's children (each child is a task container)
document.querySelector("#counter").innerText = mainToDoList.length;

//the function builds the view section based on the task list
async function viewSectionBuilder(tasksList = false) {
  // first, clean the view
  cleanView();

  // if the function didn't get a task list, generate it fron JSONBIN
  if (!tasksList) {
    tasksList = mainToDoList;
  }
  //if the tasks list isn't empty, make a headline top row
  if (tasksList.length > 0 && !document.getElementById("headline-container")) {
    const container = document.createElement("div");
    container.id = "headline-container";
    container.classList.add("todo-container");

    const isDoneHeadline = document.createElement("span");
    isDoneHeadline.innerText = "Done";
    isDoneHeadline.classList.add("grid-headline");
    container.appendChild(isDoneHeadline);

    const priorityHeadline = document.createElement("span");
    priorityHeadline.innerText = "Priority";
    priorityHeadline.classList.add("grid-headline");
    container.appendChild(priorityHeadline);

    const taskHeadline = document.createElement("span");
    taskHeadline.innerText = "ToDo Task";
    taskHeadline.classList.add("grid-headline");
    container.appendChild(taskHeadline);

    const timeHeadline = document.createElement("span");
    timeHeadline.innerText = "Create At";
    timeHeadline.classList.add("grid-headline");
    container.appendChild(timeHeadline);

    const deleteHeadline = document.createElement("span");
    deleteHeadline.innerText = "Delete/Edit";
    deleteHeadline.classList.add("grid-headline");
    container.appendChild(deleteHeadline);

    document.querySelector("#controlSection").appendChild(container);
    document.getElementById("clear-button").innerText = "clear";
  }

  // takes every task on the list and makes it a row with the function 'TodoRowBuilder',
  // then it appends the row as a child of the view section
  for (let task of tasksList) {
    document.querySelector("#viewSection").appendChild(TodoRowBuilder(task));
  }
  //update the counter value
  document.querySelector("#counter").innerText = mainToDoList.length;
}

//the function gets a task and makes it a row
function TodoRowBuilder(task) {
  const container = document.createElement("div");

  container.classList.add("todo-container");
  container.classList.add("draggable");
  // container.addEventListener("mousedown", mouseDownHandler);

  const isDone = document.createElement("input");
  isDone.type = "checkbox";
  isDone.checked = task.done;
  isDone.addEventListener("click", checkboxChecked);
  isDone.classList.add("todo-isDone");
  container.appendChild(isDone);

  const PrioritySpan = document.createElement("span");
  PrioritySpan.innerText = task.priority;
  PrioritySpan.classList.add("todo-priority");
  container.appendChild(PrioritySpan);

  const taskContent = document.createElement("span");
  taskContent.innerText = task.text;
  taskContent.classList.add("todo-text");
  container.appendChild(taskContent);

  const taskTime = document.createElement("span");
  const time = new Date(task.date).toString();
  taskTime.innerText = time.substring(0, time.lastIndexOf(":"));
  taskTime.classList.add("todo-created-at");
  container.appendChild(taskTime);

  const deleteNeditContainer = document.createElement("span");

  const deleteButton = document.createElement("i");
  deleteButton.addEventListener("click", onDelete);
  deleteButton.classList.add("todo-delete", "fa", "fa-trash");

  deleteNeditContainer.appendChild(deleteButton);

  const editButton = document.createElement("i");
  editButton.addEventListener("click", onEdit);
  editButton.classList.add("todo-edit", "fa", "fa-pencil-square-o");
  deleteNeditContainer.appendChild(editButton);

  const dragButton = document.createElement("i");
  dragButton.addEventListener("mousedown", mouseDownHandler);
  dragButton.classList.add("todo-edit", "fa", "fa-bars");
  deleteNeditContainer.appendChild(dragButton);

  container.appendChild(deleteNeditContainer);

  return container;
}

//the function removes the view section's content
function cleanView() {
  const viewSection = document.querySelector("#viewSection");
  const controlSection = document.querySelector("#controlSection");

  if (controlSection.lastChild.id === "headline-container") {
    controlSection.removeChild(controlSection.lastChild);
  }
  while (viewSection.lastChild) {
    viewSection.removeChild(viewSection.lastChild);
  }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////edit functions///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// the function adds a new task by creating a new task element, getting the current data from JSONBIN,
// pushing it to the list array, and then sending it back to JSONBIN
async function addNewTask(event) {
  if (!document.querySelector("#text-input").value) {
    alert("Task can't be empty");
    return;
  }
  undoList.push(duplicateArray(mainToDoList));
  //getting data from the form
  const taskTextBox = document.querySelector("#text-input");
  const PrioritySelectBox = document.querySelector("#priority-selector");
  const time = new Date();
  event.preventDefault(); // - so the page won't refresh

  //creating a new task element
  const task = {
    text: taskTextBox.value,
    priority: PrioritySelectBox.value,
    date: time.getTime(),
    done: false,
  };
  if (mainToDoList.some((bin) => task.text === bin.text)) {
    return alert("This task already exist");
  }
  mainToDoList.push(task);

  // reset the form
  taskTextBox.value = "";
  PrioritySelectBox.value = 1;

  viewSectionBuilder(mainToDoList);
  document.querySelector("#save").disabled = false;
  document.querySelector("#undo").disabled = false;
}

// the function sorts the list in JSONBIN by priority, and then sends the sorted list
// to 'viewSectionBuilder' so it will rebuild the view section with the sorted list
async function sort(event) {
  undoList.push(duplicateArray(mainToDoList));
  event.preventDefault();
  let tasksList = [];
  for (const task of mainToDoList) {
    tasksList.push(task);
  }

  sorted = !sorted;

  if (sorted) {
    try {
      tasksList = tasksList.sort((task1, task2) => {
        return task2.priority - task1.priority;
      });
      document.querySelector("#sort-button").innerText = "Sorted BY: Priority";
    } catch (err) {
      alert(err);
    }
  } else {
    document.querySelector("#sort-button").innerText = "Sorted BY: Most Recent";
  }
  viewSectionBuilder(tasksList);
  document.querySelector("#save").disabled = false;
  document.querySelector("#undo").disabled = false;
}

//the function clears all the data from JSONBIN
async function clear(event) {
  undoList.push(duplicateArray(mainToDoList));
  event.preventDefault();

  mainToDoList = [];
  await viewSectionBuilder(mainToDoList);
  document.getElementById("clear-button").innerText = "cleared";
  document.querySelector("#save").disabled = false;
}
async function onDelete(event) {
  undoList.push(duplicateArray(mainToDoList));
  const button = event.target;

  const todoText = button.parentNode.parentNode.getElementsByClassName(
    "todo-text"
  )[0].innerText;

  const deleteIndex = mainToDoList.findIndex((task) => task.text === todoText);

  mainToDoList.splice(deleteIndex, 1);

  await viewSectionBuilder(mainToDoList);
  document.querySelector("#save").disabled = false;
  document.querySelector("#undo").disabled = false;
}
// the function edits a todo task
async function onEdit(event) {
  const taskContainer = event.target.parentNode.parentNode;
  taskContainer.removeEventListener("mousedown", mouseDownHandler);
  const todoText = taskContainer.getElementsByClassName("todo-text")[0]
    .innerText;

  const editIndex = mainToDoList.findIndex((task) => task.text === todoText);

  //removing all of the content in the container befor replacing it with a form
  while (taskContainer.lastChild) {
    taskContainer.removeChild(taskContainer.lastChild);
  }
  // creating an edit form
  const priorityInput = document.createElement("input");
  priorityInput.type = "number";
  priorityInput.value = mainToDoList[editIndex].priority;
  priorityInput.requierd = true;
  priorityInput.max = 5;
  priorityInput.min = 1;
  taskContainer.appendChild(priorityInput);

  const TextInput = document.createElement("input");
  TextInput.type = "text";
  TextInput.value = todoText;
  TextInput.requierd = true;
  taskContainer.appendChild(TextInput);

  const finishEditBtn = document.createElement("i");
  finishEditBtn.addEventListener("click", finishEdit);
  finishEditBtn.classList.add("fa", "fa-check");
  taskContainer.appendChild(finishEditBtn);

  const cancelEditBtn = document.createElement("i");
  cancelEditBtn.addEventListener("click", cancelEdit);
  cancelEditBtn.classList.add("fa", "fa-times");
  taskContainer.appendChild(cancelEditBtn);

  async function finishEdit() {
    if (TextInput.value && priorityInput.value) {
      undoList.push(duplicateArray(mainToDoList));
      mainToDoList[editIndex].text = TextInput.value;
      mainToDoList[editIndex].priority = priorityInput.value;
      taskContainer.addEventListener("mousedown", mouseDownHandler);

      await viewSectionBuilder(mainToDoList);
    } else {
      alert("Don't leave an empty field");
    }
    document.querySelector("#save").disabled = false;
    document.querySelector("#undo").disabled = false;
  }
  async function cancelEdit() {
    taskContainer.addEventListener("mousedown", mouseDownHandler);

    await viewSectionBuilder();
  }
}
// thw functions saves the changes by the user
async function save() {
  let isOnEdit = false;
  let viewedList = document.querySelector("#viewSection").childNodes;
  for (const container of viewedList) {
    if (container.querySelector(".fa-times")) {
      isOnEdit = true;
    }
  }
  if (!isOnEdit) {
    preserveOrder();
    document.querySelector("#save").disabled = true;
    await pushToList(mainToDoList);
    alert("saved!");
  } else {
    alert("Finish editing first!");
  }
}
async function undo() {
  if (undoList.length > 0) {
    redoList.push(duplicateArray(mainToDoList));
    mainToDoList = undoList.pop();
    document.querySelector("#redo").disabled = false;
  }
  if (undoList.length === 0) {
    document.querySelector("#undo").disabled = true;
  }
  await viewSectionBuilder(mainToDoList);
}
function duplicateArray(array) {
  let duplicate = [];
  for (const element of array) {
    duplicate.push(element);
  }
  return duplicate;
}
async function redo() {
  if (redoList.length > 0) {
    undoList.push(duplicateArray(mainToDoList));
    mainToDoList = redoList.pop();
    document.querySelector("#undo").disabled = false;
  }
  if (redoList.length === 0) {
    document.querySelector("#redo").disabled = true;
  }
  await viewSectionBuilder(mainToDoList);
}
function search() {
  cleanView();
  const searchText = document.getElementById("search").value;
  for (const task of mainToDoList) {
    if (task.text.includes(searchText)) {
      let row = TodoRowBuilder(task);

      let rowText = row.querySelector(".todo-text");
      rowText;
      let highlighted = rowText.innerHTML.replace(
        new RegExp(searchText, "g"),
        `<mark>${searchText}</mark>`
      );
      rowText.innerHTML = highlighted;
      document.querySelector("#viewSection").appendChild(row);
    }
  }
}
async function checkboxChecked(event) {
  preserveOrder();
  document.querySelector("#save").disabled = false;
  await viewSectionBuilder(mainToDoList);
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////Drag'n'Drop//////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Query the list element
const list = document.getElementById("viewSection");

let draggingEle;
let placeholder;
let isDraggingStarted = false;

// The current position of mouse relative to the dragging element
let x = 0;
let y = 0;
let currentWidth = 0;
// Swap two nodes
const swap = function (nodeA, nodeB) {
  const parentA = nodeA.parentNode;
  const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;

  sorted = false;
  document.getElementById("sort-button").innerText = "Sorted BY: Freestyle";
  // Move `nodeA` to before the `nodeB`
  nodeB.parentNode.insertBefore(nodeA, nodeB);

  // Move `nodeB` to before the sibling of `nodeA`
  parentA.insertBefore(nodeB, siblingA);
};

// Check if `nodeA` is above `nodeB`
const isAbove = function (nodeA, nodeB) {
  // Get the bounding rectangle of nodes
  const rectA = nodeA.getBoundingClientRect();
  const rectB = nodeB.getBoundingClientRect();

  return rectA.top + rectA.height / 2 < rectB.top + rectB.height / 2;
};

const mouseDownHandler = function (e) {
  if (e.target.parentNode.parentNode.classList.contains("draggable")) {
    draggingEle = e.target.parentNode.parentNode;

    document.querySelector("#save").disabled = false;

    // Calculate the mouse position
    const rect = draggingEle.getBoundingClientRect();
    x = e.pageX - rect.left;
    y = e.pageY - rect.top;
    currentWidth = rect.width;

    // Attach the listeners to `document`
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  }
};

const mouseMoveHandler = function (e) {
  const draggingRect = draggingEle.getBoundingClientRect();

  if (!isDraggingStarted) {
    isDraggingStarted = true;

    // Let the placeholder take the height of dragging element
    // So the next element won't move up
    placeholder = document.createElement("div");
    placeholder.classList.add("placeholder");
    draggingEle.parentNode.insertBefore(placeholder, draggingEle.nextSibling);
    placeholder.style.height = `${draggingRect.height}px`;
  }

  // Set position for dragging element
  draggingEle.style.position = "fixed";
  draggingEle.style.top = `${e.pageY - y}px`;
  draggingEle.style.left = `${e.pageX - x}px`;
  draggingEle.style.width = currentWidth + "px";
  // The current order
  // prevEle
  // draggingEle
  // placeholder
  // nextEle
  const prevEle = draggingEle.previousElementSibling;
  const nextEle = placeholder.nextElementSibling;

  // The dragging element is above the previous element
  // User moves the dragging element to the top
  if (prevEle && isAbove(draggingEle, prevEle)) {
    // The current order    -> The new order
    // prevEle              -> placeholder
    // draggingEle          -> draggingEle
    // placeholder          -> prevEle
    swap(placeholder, draggingEle);
    swap(placeholder, prevEle);
    return;
  }

  // The dragging element is below the next element
  // User moves the dragging element to the bottom
  if (nextEle && isAbove(nextEle, draggingEle)) {
    // The current order    -> The new order
    // draggingEle          -> nextEle
    // placeholder          -> placeholder
    // nextEle              -> draggingEle
    swap(nextEle, placeholder);
    swap(nextEle, draggingEle);
  }
};

const mouseUpHandler = function () {
  // Remove the placeholder
  placeholder && placeholder.parentNode.removeChild(placeholder);

  undoList.push(duplicateArray(mainToDoList));
  preserveOrder();
  document.querySelector("#undo").disabled = false;

  draggingEle.style.removeProperty("top");
  draggingEle.style.removeProperty("left");
  draggingEle.style.removeProperty("position");

  x = null;
  y = null;
  draggingEle = null;
  isDraggingStarted = false;

  // Remove the handlers of `mousemove` and `mouseup`
  document.removeEventListener("mousemove", mouseMoveHandler);
  document.removeEventListener("mouseup", mouseUpHandler);
};

// the function saves the current order of the tasks
function preserveOrder() {
  let duplicate = duplicateArray(mainToDoList);
  mainToDoList = [];
  let viewedList = document.querySelector("#viewSection").childNodes;
  for (const container of viewedList) {
    for (const task of duplicate) {
      if (task.text === container.querySelector(".todo-text").innerText) {
        task.done = container.querySelector(".todo-isDone").checked;
        mainToDoList.push(task);
      }
    }
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////// tutorial ////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let tourGuide = document.querySelector("#tourGuide");
function tutorial() {
  tourGuide.innerText = "Welcome to the tutorial!";
  let guideRect = tourGuide.getBoundingClientRect();
  tourGuide.style.marginRight = tourGuide.style.width = "300px";
  window.innerWidth / 2 - guideRect.width / 2 + "px";
  let proceed = document.createElement("button");
  proceed.innerText = "proceed";
  proceed.addEventListener("click", tutorialStep1);
  tourGuide.appendChild(proceed);
  tourGuide.hidden = false;
}
function tutorialStep1() {
  tourGuide.innerText =
    "Try adding a new ToDo task. First type here your task and choose the priority of that task";
  let textBox = document.querySelector("#text-input");
  textBox.classList.add("spot");
  let addBtn = document.querySelector("#add-button");
  textBox.focus();
  textBox.addEventListener("keyup", textBoxChanged);
  function textBoxChanged() {
    tourGuide.innerText = 'when you done press the "Add" button';
    textBox.removeEventListener("keyup", textBoxChanged);
    addBtn.addEventListener("click", tutorialStep2);
    addBtn.classList.add("spot");
    textBox.classList.remove("spot");
  }
}
function tutorialStep2(event) {
  event.target.removeEventListener("click", tutorialStep2);
  event.target.classList.remove("spot");

  tourGuide.innerText =
    'Now you can edit your task.Click the "Edit" button (the pencil icon).';
  let editBtn = document.querySelectorAll(".todo-edit");
  for (const button of editBtn) {
    button.addEventListener("click", startEdit);
  }
  editBtn[0].classList.add("spot");
  function startEdit(event) {
    tourGuide.innerText =
      'Edit as you wish. when you finish click "V" and "Save" to save your edit.';
    let vBtn = document.querySelectorAll(".fa-check");
    for (const button of vBtn) {
      button.addEventListener("click", donwEdit);
      button.classList.add("spot");
    }
    function donwEdit() {
      let saveBtn = document.querySelector("#save");
      saveBtn.classList.add("spot");

      saveBtn.addEventListener("click", tutorialStep3);
      for (const button of vBtn) {
        button.removeEventListener("click", donwEdit);
        button.classList.remove("spot");
      }
    }
    for (const button of editBtn) {
      button.removeEventListener("click", startEdit);
    }
    editBtn[0].classList.remove("spot");
  }
}
function tutorialStep3(event) {
  event.target.removeEventListener("click", tutorialStep3);
  event.target.classList.remove("spot");

  tourGuide.innerHTML =
    'Now let\'s delete a task.<br>Try click the "Delete" button (the trash can icon) in side of a task to delete it.';
  let deleteBtns = document.querySelectorAll(".todo-delete");
  for (const button of deleteBtns) {
    button.addEventListener("click", deleteTask);
  }
  deleteBtns[0].classList.add("spot");
  function deleteTask() {
    tourGuide.innerHTML =
      'Great! <br> Now let\'s review the undo button.<br>Try click the "Undo" button to cancel the last action. ';
    let undoBtn = document.querySelector("#undo");
    undoBtn.addEventListener("click", tutorialStep4);
    undoBtn.classList.add("spot");

    for (const button of deleteBtns) {
      button.removeEventListener("click", deleteTask);

      deleteBtns[0].classList.remove("spot");
    }
  }
}
function tutorialStep4(event) {
  event.target.removeEventListener("click", tutorialStep4);
  event.target.classList.remove("spot");
  tourGuide.style.right = "100px";
  tourGuide.innerHTML =
    'Excellent. I guess you realized the "Redo" button by your own, so let\'s start with the intresting stuff.<br> We will  start with the search bar.<br>Click the search bar (the magnifighed glass icon) and search for a task (or a part of it). ';
  let searchBar = document.querySelector("#search");
  searchBar.addEventListener("click", tutorialStep5);
  searchBar.classList.add("spot");
}

function tutorialStep5() {
  document.querySelector("#search").removeEventListener("click", tutorialStep5);
  document.querySelector("#search").classList.remove("spot");

  tourGuide.innerHTML = "It's OK I'll wait. tell me when you are done ";
  let proceed = document.createElement("button");
  proceed.innerText = "Done";
  proceed.addEventListener("click", tutorialStep6);
  tourGuide.appendChild(proceed);
}
function tutorialStep6(event) {
  event.target.removeEventListener("click", tutorialStep6);
  tourGuide.innerHTML = "And now, the \"Drag'n' Drop\"";
  let proceed = document.createElement("button");
  proceed.innerText = "proceed";
  proceed.addEventListener("click", tutorialStep7);
  tourGuide.appendChild(proceed);
}
function tutorialStep7() {
  tourGuide.innerHTML =
    "Click the drag button (the 3 bars icon) and drag a task to re order the list";
  let barsBtn = document.querySelectorAll(".fa-bars");
  for (const button of barsBtn) {
    button.addEventListener("mousedown", tutorialStep8);
  }
  barsBtn[0].classList.add("spot");
}
function tutorialStep8() {
  let barsBtn = document.querySelectorAll(".fa-bars");
  for (const button of barsBtn) {
    button.removeEventListener("mousedown", tutorialStep8);
  }
  barsBtn[0].classList.remove("spot");

  tourGuide.innerHTML = "I think that's it. Enjoy!";
  let proceed = document.createElement("button");
  proceed.innerText = "Close";
  proceed.addEventListener("click", closeTutorial);
  tourGuide.appendChild(proceed);
}
function closeTutorial() {
  tourGuide.hidden = true;
}
