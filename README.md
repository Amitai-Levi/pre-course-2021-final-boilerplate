# My ToDo List - by Amitai Levi

## About the app

This is a client side ToDo list for personal use. My goal is to make your life more efficiant and orgenized!
The app has many features, please read below for more information.

## Links

- [The app on GitHub pages](https://amitai-levi.github.io/pre-course-2021-final-boilerplate/src/)
- [GitHub repository](https://github.com/Amitai-Levi/pre-course-2021-final-boilerplate)
- [ChallengeMe]()

## Features

First I recommend to start with the tutorials to see most of the app's features.Features display wiil be in the end of the page. Anyway, this is the features:

- Tutorial, as mentioned above
- Adding a task that includes the task text, priority (a number between 1-5), and the date it was created
- Task counter
- Sort button to sort the tasks by priority
- Persistant data - the data is saved in [JsonBin](https://jsonbin.io/) so it's accessable from anywhere and any time.
- Delete or edit a task
- Undo and Redo actions
- Search bar
- Drag'n'drop to reorder tasks
- Clear button to delete all tasks at once
- save button - so you won't save actions you did by accident
- 2 additional tests - for clear and delete buttons

## Resorces links

Except [drag n' drop functionality](https://htmldom.dev/drag-and-drop-element-in-a-list), I have no function that came from a singular resorce. Altough, I took a lot of information from the internet, and here is a list of the main sites:

- [w3schools](https://www.w3schools.com/)
- [Mozilla](https://developer.mozilla.org/he/)
- [Stack Overflow](https://stackoverflow.com/)
- [CSS tricks](https://css-tricks.com/)
- [GitHub support community](https://github.community/)
- [FreeCodeCamp forum](https://forum.freecodecamp.org/)
  An element for showing the numeric priority value of the task, with a class `todo-priority`

## Display of chosen features

### Tutorial

-![tutorial](.\readme-files\tutorial.gif)

### Drag'n'Drop

-![drag'n'drop](.\readme-files\dragNdrop.gif)

### Search bar

![searchbar](.\readme-files\searchbar.gif)

### Undo + Redo

![undoRedo](.\readme-files\undoRedo.gif)

### Tests:

```
   test("Clicking the delete button should delete a task", async () => {
    await nock("https://api.jsonbin.io/v3").get(/.*/).reply(200, mocks.initBin);

    await nock("https://api.jsonbin.io/v3")
      .persist()
      .put(/.*/, () => true)
      .reply(200, mocks.toDoAddResponse);

    await page.goto(path, { waitUntil: "networkidle0" });

    await page.type("#text-input", "can you delete me?");
    await page.click("#add-button");

    await page.waitForSelector(".todo-delete");

    await page.click(".todo-delete");
    await page.click("#save");

    const elements = await page.$$(".todo-text");
    expect(elements.length).toBe(0);
  });
  test("Clicking the clear button should delete all tasks", async () => {
    await nock("https://api.jsonbin.io/v3").get(/.*/).reply(200, mocks.initBin);

    await nock("https://api.jsonbin.io/v3")
      .persist()
      .put(/.*/, () => true)
      .reply(200, mocks.toDoAddResponse);

    await page.goto(path, { waitUntil: "networkidle0" });

    await page.type("#text-input", "can you delete me?");
    await page.click("#add-button");

    await page.type("#text-input", "maybe so");
    await page.click("#add-button");

    await page.type("#text-input", "but can you clear all of us in 1 click?");
    await page.click("#add-button");

    await page.click("#clear-button");
    await page.click("#save");

    let clearBtn = "";
    clearBtn = await page.$$("#clear-button");
    await page.waitFor("#clear-button", { innerText: "cleared" });

    const elements = await page.$$(".todo-text");
    expect(elements.length).toBe(0);
  });
```
