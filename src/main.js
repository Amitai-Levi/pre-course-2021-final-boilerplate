let jsonbinList = [];
(async function () {
  await getList();
  await viewSectionBuilder();
})();
let sorted = false;
// the function returns an array of ToDo elements fron JSONBIN
async function getList() {
  await fetch("https://api.jsonbin.io/v3/b/60119d6f3126bb747e9fd46d/latest")
    .then((response) => response.json())
    .then((retrievedData) => (jsonbinList = retrievedData.record["my-todo"]));
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
  jsonbinList = newList;
  return newList;
}
// assigning event listener to 'sort' and 'add' buttons
document.querySelector("#add-button").addEventListener("click", addNewTask);
document.querySelector("#sort-button").addEventListener("click", sort);
document.querySelector("#clear-button").addEventListener("click", clear);

//setting the counter text to the number of view section's children (each child is a task container)
document.querySelector("#counter").innerText = jsonbinList.length;

// the function adds a new task by creating a new task element, getting the current data from JSONBIN,
// pushing it to the list array, and then sending it back to JSONBIN
async function addNewTask(event) {
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
  };
  console.log("Tak.text = " + task.text);
  console.log(jsonbinList);
  console.log(jsonbinList.some((bin) => bin.text));
  if (jsonbinList.some((bin) => task.text === bin.text)) {
    return alert("This task already exist");
  }
  jsonbinList.push(task);

  // reset the form
  taskTextBox.value = "";
  PrioritySelectBox.value = 1;

  viewSectionBuilder(await pushToList(jsonbinList));
}

//the function builds the view section based on the task list
async function viewSectionBuilder(tasksList = false) {
  // first, clean the view
  cleanView();

  // if the function didn't get a task list, generate it fron JSONBIN
  if (!tasksList) {
    tasksList = jsonbinList;
  }
  //if the tasks list isn't empty, make a headline top row
  if (tasksList.length > 0 && !document.getElementById("headline-container")) {
    const container = document.createElement("div");
    container.id = "headline-container";
    container.classList.add("todo-container");

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
  document.querySelector("#counter").innerText = jsonbinList.length;
}

//the function gets a task and makes it a row
function TodoRowBuilder(task) {
  const container = document.createElement("div");

  container.classList.add("todo-container");
  container.classList.add("draggable");
  container.addEventListener("mousedown", mouseDownHandler);

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

  const deleteButton = document.createElement("button");
  deleteButton.innerText = "Delete";
  deleteButton.addEventListener("click", onDelete);
  deleteButton.classList.add("todo-delete");
  deleteNeditContainer.appendChild(deleteButton);

  const editButton = document.createElement("button");
  editButton.innerText = "Edit";
  editButton.addEventListener("click", onEdit);
  editButton.classList.add("todo-edit");
  deleteNeditContainer.appendChild(editButton);

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

// the function sorts the list in JSONBIN by priority, and then sends the sorted list
// to 'viewSectionBuilder' so it will rebuild the view section with the sorted list
async function sort(event) {
  event.preventDefault();
  let tasksList = [];
  for (const task of jsonbinList) {
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
}

//the function clears all the data from JSONBIN
async function clear(event) {
  event.preventDefault();

  const empty = [];
  await pushToList(empty);
  await viewSectionBuilder();
  document.getElementById("clear-button").innerText = "cleared";
}
async function onDelete(event) {
  const button = event.target;

  const todoText = button.parentNode.parentNode.getElementsByClassName(
    "todo-text"
  )[0].innerText;

  const deleteIndex = jsonbinList.findIndex((task) => task.text === todoText);

  jsonbinList.splice(deleteIndex, 1);

  await pushToList(jsonbinList);
  await viewSectionBuilder();
}
// the function edits a todo task
async function onEdit(event) {
  const taskContainer = event.target.parentNode.parentNode;
  taskContainer.removeEventListener("mousedown", mouseDownHandler);
  const todoText = taskContainer.getElementsByClassName("todo-text")[0]
    .innerText;

  const editIndex = jsonbinList.findIndex((task) => task.text === todoText);

  //removing all of the content in the container befor replacing it with a form
  while (taskContainer.lastChild) {
    taskContainer.removeChild(taskContainer.lastChild);
  }
  // creating an edit form
  const priorityInput = document.createElement("input");
  priorityInput.type = "number";
  priorityInput.value = jsonbinList[editIndex].priority;
  priorityInput.requierd = true;
  priorityInput.max = 5;
  priorityInput.min = 1;
  taskContainer.appendChild(priorityInput);

  const TextInput = document.createElement("input");
  TextInput.type = "text";
  TextInput.value = todoText;
  TextInput.requierd = true;
  taskContainer.appendChild(TextInput);

  const finishEditBtn = document.createElement("button");
  finishEditBtn.innerText = "Done";
  finishEditBtn.addEventListener("click", finishEdit);
  taskContainer.appendChild(finishEditBtn);

  const cancelEditBtn = document.createElement("button");
  cancelEditBtn.innerText = "Cancel";
  cancelEditBtn.addEventListener("click", cancelEdit);
  taskContainer.appendChild(cancelEditBtn);

  async function finishEdit() {
    if (TextInput.value && priorityInput.value) {
      jsonbinList[editIndex].text = TextInput.value;
      jsonbinList[editIndex].priority = priorityInput.value;
      taskContainer.addEventListener("mousedown", mouseDownHandler);

      await pushToList(jsonbinList);
      await viewSectionBuilder();
    } else {
      alert("Don't leave an empty field");
    }
  }
  async function cancelEdit() {
    taskContainer.addEventListener("mousedown", mouseDownHandler);

    await viewSectionBuilder();
  }
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
  if (e.currentTarget.classList.contains("draggable")) {
    draggingEle = e.currentTarget;

    // Calculate the mouse position
    const rect = draggingEle.getBoundingClientRect();
    x = e.pageX - rect.left;
    y = e.pageY - rect.top;

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
  draggingEle.style.position = "absolute";
  draggingEle.style.top = `${e.pageY - y}px`;
  draggingEle.style.left = `${e.pageX - x}px`;

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

// Query all items
