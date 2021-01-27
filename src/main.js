// import fetch from "fetch";
// const fetch = require('fetch');
//if (localStorage.taskList) {
viewSectionBuilder();
//}
let sorted = false;

async function getList() {
  let req = "";
  await fetch("https://api.jsonbin.io/b/60119d6f3126bb747e9fd46d/latest")
    .then((response) => response.json())
    .then((data) => (req = data));
  console.log(req);
  return req;
}
async function pushToList(data) {
  await fetch("https://api.jsonbin.io/b/60119d6f3126bb747e9fd46d", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      versioning: "false",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json)
    .catch((error) => error);
}

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

async function addNewTask(event) {
  const taskText = document.querySelector("#text-input").value;
  const priority = document.querySelector("#priority-selector").value;
  const time = new Date();
  event.preventDefault();

  const task = {
    text: taskText,
    priority: priority,
    date: time.getTime(),
    realDate: new Date(time.getTime()).toString(),
  };

  if (!getList()) {
    await pushToList([task]);
  } else {
    const currentList = await getList();
    currentList.push(task);
    await pushToList(currentList);
  }
  taskText.value = "";
  priority.value = 1;

  viewSectionBuilder();
}
async function viewSectionBuilder(tasks = false) {
  cleanView();
  if (!tasks) {
    tasks = await getList();
    //tasks = tasks);
  }

  for (let task of tasks) {
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

async function sort(event) {
  event.preventDefault();
  let tasks = await getList();

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
