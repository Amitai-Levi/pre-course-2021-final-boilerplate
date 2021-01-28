viewSectionBuilder();

let sorted = false;
// the function returns an array of ToDo elements fron JSONBIN
async function getList() {
  let toDoList = "";
  await fetch("https://api.jsonbin.io/b/60119d6f3126bb747e9fd46d/latest")
    .then((response) => response.json())
    .then((retrievedData) => (toDoList = retrievedData));
  console.log(toDoList);
  return toDoList;
}
//the function gets a new list and replaces it with the old one in JSONBIN
async function pushToList(newList) {
  await fetch("https://api.jsonbin.io/b/60119d6f3126bb747e9fd46d", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newList),
  })
    .then((response) => response.json)
    .catch((error) => error);
}
// assigning event listener to 'sort' and 'add' buttons
document.querySelector("#add-button").addEventListener("click", addNewTask);
document.querySelector("#sort-button").addEventListener("click", sort);

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
    realDate: new Date(time.getTime()).toString(),
  };

  if (!(await getList())) {
    // if the current list is empty
    await pushToList([task]); // push (replace the list with) an array with the first element
  } else {
    const currentList = await getList(); // get the current list,
    currentList.push(task); // push the new element to the array
    await pushToList(currentList); // and replace the new list with the current one
  }
  // reset the form
  taskTextBox.value = "";
  PrioritySelectBox.value = 1;

  viewSectionBuilder();
}
//the function builds the view section based on the task list
async function viewSectionBuilder(tasksList = false) {
  // first, clean the view
  cleanView();

  // if the function didn't get a task list, generate it fron JSONBIN
  if (!tasksList) {
    tasksList = await getList();
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
  let tasksList = await getList();

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

}
