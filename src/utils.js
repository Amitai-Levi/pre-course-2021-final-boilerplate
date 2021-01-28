const API_KEY = "https://api.jsonbin.io/v3/b/60119d6f3126bb747e9fd46d"; // Assign this variable to your JSONBIN.io API key if you choose to use it.
const DB_NAME = "my-todo";

// Gets data from persistent storage by the given key and returns it
async function getPersistent(key) {
  let toDoList = "";
  await fetch(key)
    .then((response) => response.json())
    .then((retrievedData) => (toDoList = retrievedData.record));
  console.log(toDoList);
  return toDoList;
}

// Saves the given data into persistent storage by the given key.
// Returns 'true' on success.
async function setPersistent(key, newList) {
  try {
    await fetch(key, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newList),
    })
      .then((response) => response.json)
      .catch((error) => error);
    return true;
  } catch {
    return false;
  }
}
