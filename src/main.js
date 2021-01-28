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
document.querySelector("#counter").innerText = document.querySelector(
  "#viewSection"
).childNodes.length;

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
  if (tasksList.length > 0) {
    const container = document.createElement("div");
    container.style.borderWidth = "6px";
    container.style.marginBottom = "50px";
    container.classList.add("headline-container");
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
    deleteHeadline.innerText = "Delete";
    deleteHeadline.classList.add("grid-headline");
    container.appendChild(deleteHeadline);

    document.querySelector("#viewSection").appendChild(container);
  }

  // takes every task on the list and makes it a row with the function 'TodoRowBuilder',
  // then it appends the row as a child of the view section
  for (let task of tasksList) {
    document.querySelector("#viewSection").appendChild(TodoRowBuilder(task));
  }
  //update the counter value
  document.querySelector("#counter").innerText = document.querySelector(
    "#viewSection"
  ).childNodes.length;
}

//the function gets a task and makes it a row
function TodoRowBuilder(task) {
  const container = document.createElement("div");

  container.classList.add("todo-container");

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

  const deleteButton = document.createElement("button");
  deleteButton.innerText = "Delete";
  deleteButton.addEventListener("click", onDelete);
  deleteButton.classList.add("todo-delete");
  container.appendChild(deleteButton);

  return container;
}

//the function removes the view section's content
function cleanView() {
  const viewSection = document.querySelector("#viewSection");

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
}
async function onDelete(event) {
  const button = event.target;

  const todoText = button.parentNode.getElementsByClassName("todo-text")[0]
    .innerText;

  const deleteIndex = jsonbinList.findIndex((task) => task.text === todoText);

  jsonbinList.splice(deleteIndex, 1);

  await pushToList(jsonbinList);
  await viewSectionBuilder();
}
