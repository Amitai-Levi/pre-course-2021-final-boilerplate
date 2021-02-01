# My ToDo List

## by Amitai Levi

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

Except [drag n' drop functionality](https://htmldom.dev/drag-and-drop-element-in-a-list), I have no specific resorce that I have only been used it on a function. Altough, I took a lot of information from the internet, and specieficly from these speciefic sites:

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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

- Add a counter element to reflect the **current** number of todos stored in the app. This element should have an id of `counter`.

- Add a button with id `sort-button`. Clicking this element should resort the todo list by their todos priority (DESC)

  ![alt text](./readme-files/todo.gif)

- **Make your todo-list persistent!**

  Save your todo-list as JSON (see `todo-list-example.json`) and store it in a persistent way, you have to options:

  1. Use the `localStorage` browser api to save / load the todo-list JSON **with the 'my-todo' key**. This option will make it persist between _page reloads_.

  2. Use the [jsonbin.io](https://jsonbin.io/) service api (using async/await fetch GET & PUT requests) to save / load your todo-list JSON. This option will make it persist across _devices and browsers_.

**Note** You can add extra properties to the todo objects in the JSON that you want to be persistent.

## Bonus

- jsonbin.io - see explanation above
- Freestyle - add any feature you desire. Some ideas:
  - [drag n' drop functionality](https://htmldom.dev/drag-and-drop-element-in-a-list)
  - Delete + Edit a todo
  - Undo action
  - Search and highlight results
  - Loading spinner for network request
  - Mark/Unmark todo as done
  - Something awesome we didn't think of...
- For added value, you can add jest/puppeteer test to test any bonus feature you implemented

**Add an explanation in `README.md` for each bonus feature you add and a link to any resoure you used**

## Grading policy

- Your project will be graded by the number of automatic tests you pass
- Using jsonbin.io
- Extra freestyle features - Please add an explanation about the bonus features you added to the readme.md
- new jest/puppeteer test
- Code quality and style: indentation, Meaningful and non-disambiguate variable names, Comments documentation
- Visual creativity, use css to make this app look awesome 💅🏿
- Division to reusable functions, no code duplication
- Git usage: meaningful commit messages, small commits, folder and file structures

## Submitting

- Change this file (README.md) and style it to showcase your solution (gifs, explanations, link to the github page, links to resources you used, etc...)
- Submit your solution repo to the [ChallengeMe](http://challengeme.suvelocity.org/) system
- Submit your repo link and github page and video to Google Classroom
- Record a 5-10 min selfie video, describe yourself in a few words (age, location, military background, technological background). Also, talk about the solution you submitted (try to explain how your app works in general and which bonuses you added). Think about this video as an interview.

GOOD LUCK!
