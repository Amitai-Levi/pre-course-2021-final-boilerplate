if (localStorage.taskList) {
  viewSectionBuilder();
}
let sorted = false;

document.querySelector("#add-button").addEventListener("click", addNewTask);
document.querySelector("#sort-button").addEventListener("click", sort);
document.querySelector("#sort-button").addEventListener("click", () => {
  if (!sorted) {
    document.querySelector("#sort-button").innerText = "Sorted BY: Most Recent";
  } else {
    document.querySelector("#sort-button").innerText = "Sorted BY: Priority";
  }
});

document.querySelector("#counter").innerText = document.querySelector(
  "#viewSection"
).childNodes.length;

function addNewTask(event) {
  const taskText = document.querySelector("#text-input");
  const priority = document.querySelector("#priority-selector");
  const time = new Date();
  event.preventDefault();

  const task = {
    text: taskText.value,
    priority: priority.value,
    date: time.getTime(),
    realDate: new Date(time.getTime()).toString(),
  };
  let tempList = [task];
  console.log(JSON.stringify(tempList));
  if (!localStorage.taskList) {
    localStorage.taskList = JSON.stringify(tempList);
  } else {
    tempList = JSON.parse(localStorage.getItem("taskList"));
    console.log(tempList);
    tempList.push(task);
    localStorage.setItem("taskList", JSON.stringify(tempList));
  }
  taskText.value = "";
  priority.value = 1;

  tempList = JSON.parse(localStorage.taskList);
  console.log(tempList[1]);

  viewSectionBuilder();
}
function viewSectionBuilder(tasks = JSON.parse(localStorage.taskList)) {
  cleanView();

  for (const task of tasks) {
    document.querySelector("#viewSection").appendChild(TodoRowBuilder(task));
  }
  document.querySelector("#counter").innerText = document.querySelector(
    "#viewSection"
  ).childNodes.length;
}
function TodoRowBuilder(task) {
  const container = document.createElement("div");

  container.classList.add("todo-container");

  const priorityDiv = document.createElement("span");
  priorityDiv.innerText = task.priority;
  priorityDiv.classList.add("todo-priority");
  container.appendChild(priorityDiv);

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
function cleanView() {
  const viewSection = document.querySelector("#viewSection");

  while (viewSection.lastChild) {
    viewSection.removeChild(viewSection.lastChild);
  }
}

function sort(event) {
  event.preventDefault();
  let tasks = JSON.parse(localStorage.taskList);

  sorted = !sorted;

  if (sorted) {
    try {
      tasks = tasks.sort((task1, task2) => {
        return task2.priority - task1.priority;
      });
    } catch (err) {
      alert(err);
    }
  }
  viewSectionBuilder(tasks);
}
