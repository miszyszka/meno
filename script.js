"use strict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  onValue,
  push,
  ref,
  update,
  set,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// DATABASE
const appSettings = {
  databaseURL:
    "https://meno-9a306-default-rtdb.europe-west1.firebasedatabase.app/",
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const usersDB = ref(database, "users");

// GENERAL
let decksContainers = document.querySelectorAll(".deck-container");
let deckBars = document.querySelectorAll(".deck-bar");
let deleteBtns = document.querySelectorAll(".delete");
let editBtns = document.querySelectorAll(".edit");

const allScreens = document.querySelectorAll(".screen");
const allInputs = document.querySelectorAll(".input");

const addDeckBTN = document.getElementById("add-deck-container");
const tryLogInBTN = document.querySelector(".try-login-btn");
const trySignInBTN = document.querySelector(".try-singin-btn");

const userNameInput = document.getElementById("login-username");
const passwordInput = document.getElementById("login-password");

////////////
// BNTS

const createDeckBTN = document.querySelector(".create-deck");
const loginBTN = document.querySelector(".login-btn");
const signinBTN = document.querySelector(".signin-btn");
const goBackBTN = document.querySelectorAll(".go-back-btn");
const startBTN = document.getElementById("start");
const nextBTN = document.querySelector(".next");
const addNewCardBTN = document.getElementById("add-new-card");
const createCardBTN = document.getElementById("create-card");

const learningCounter = document.querySelector(".learning-counter");
const cardContainer = document.querySelector(".card-container");
const side1card = document.querySelector(".side1-card");
const side2card = document.querySelector(".side2-card");
const stacks = document.querySelectorAll(".stack");
const callToSelect = document.getElementById("call-to-sellect-stack");
const dots = document.querySelectorAll(".dot-selection");

// BTN containers
const downgardeBTN = document.querySelector(".downgrade");
const upgradeBTN = document.querySelector(".upgrade");

// SVG only
const downBTN = document.getElementById("level-d");
const upBTN = document.getElementById("level-u");

// SCREENS
const helloScreen = document.querySelector(".hello-screen");
const loginScreen = document.querySelector(".login-screen");
const signinScreen = document.querySelector(".signin-screen");
const homeScreen = document.querySelector(".home-screen");
const addingDeckScreen = document.querySelector(".adding-deck-screen");
const addingCardScreen = document.querySelector(".adding-card-screen");
const deckScreen = document.querySelector(".deck-screen");
const learnScreen = document.querySelector(".learn-screen");

///////////////////////////
///////////////////////////
///////////////////////////

// GLOBARL VARIABLES

const colourArr = [
  "var(--granade)",
  "var(--blue)",
  "var(--teal)",
  "var(--green)",
];
const allUsers = [];
let currentUser = "";
let allBars = [];
let allDecks = [];
let allDeleteBtns = [];
let deckKeys; // Array [deck1, deck2, deck3]
let currentNumber; // np. '1' w zaleznosci od wybranego decka
let deckId;
let recentlyDeleted; // string ostatnio usuniętego decka
let recentlyDeletedNum; // num ostatnio usuniętego decka
let deckCounter;
let stackSelectorBTN = false;
let currentDeck;
let cardsToLearn = [];
let currentCardId;
let startingCardsToLearn;
let randomIndex;

///////////////////////////
///////////////////////////
// UPDATE UI
///////////////////////////

const updateUI = function (source) {
  console.log("UPDATING UI from", source);
  // Deck Counter
  // Ta funkcja tworzy zmienna "counter zeby wiedziec ile jest deckow w currenUser
  const counter = function () {
    deckCounter = 0;
    for (const key in currentUser.decks) {
      if (key.includes("deck")) {
        const deck = currentUser[key];
        deckCounter++;
      }
    }
    currentUser.counter = deckCounter;
  };
  counter();

  setTimeout(function () {
    readDecksfromArray();
  }, 100);

  if (deckCounter === 3) {
    addDeckBTN.style.transform = "translateX(-100vw)";
    addDeckBTN.style.opacity = "0";
  } else if (deckCounter < 3) {
    addDeckBTN.style.transform = "translateX(0%)";
    addDeckBTN.style.opacity = "1";
  }
  const nameYourDeck = document.getElementById("name-your-deck");
  const name1side = document.getElementById("name-1-side");
  const name2side = document.getElementById("name-2-side");
  nameYourDeck.value = "";
  name1side.value = "";
  name2side.value = "";

  const rearrangeDeckIds = function () {
    if (currentUser) {
      const user = currentUser;
      deckKeys = Object.keys(user).filter((key) => key.startsWith("deck"));
      for (let i = 0; i < deckKeys.length; i++) {
        let currentKey = deckKeys[i];
        let currentDeck = user[currentKey];
        // let key = Object.keys(user)

        if (recentlyDeleted) {
          recentlyDeletedNum = +recentlyDeleted.slice(-1);
          if (currentDeck.id > recentlyDeletedNum) {
            // currentUser.currentKey = `deck${i}`

            function changeDeckKey(obj, oldKey, newKey) {
              if (oldKey in obj) {
                obj[newKey] = obj[oldKey];
                delete obj[oldKey];
              }
            }
            changeDeckKey(user, `deck${i + 2}`, `deck${i + 1}`);

            currentDeck.id = i + 1;
          }
        }
      }
    }
  };
  rearrangeDeckIds();
};

///////////////////////////
///////////////////////////
// CLEAR FIELDS UI
///////////////////////////

const clearFields = function (arg) {
  allInputs.forEach((input) => {
    input.value = "";
    dots.forEach((dot) => {
      dot.classList.remove("selected");
    });
  });
};

///////////////////////////
///////////////////////////
// UPDATE DB
///////////////////////////

const updateDB = function () {
  const user = currentUser;
  const userRef = ref(database, `users/${user.id}`);
  update(userRef, user);
};

///////////////////////////
///////////////////////////
// PAGE NAVIGATION
///////////////////////////

// Dodanie smooth do wszystkich screens
setTimeout(function () {
  allScreens.forEach((s) => {
    s.classList.add("smooth");
    addDeckBTN.style.transition = "1s ease";
  });
}, 1000);

let currentScreen = helloScreen;
let previousScreens = [];

const goToPreviousScreen = function () {
  const screenName = currentScreen.classList[0];
  // console.log(screenName);
  // if(screenName === 'deck-screen'){
  //   goToScreen(homeScreen)
  // }
  if (previousScreens.length > 0) {
    currentScreen.classList.add("no-active");
    currentScreen = previousScreens.pop();
    currentScreen.classList.remove("no-active");
    currentScreen.classList.add("active");
  }

  if (screenName === "adding-card-screen") {
    showDeckScreen();
  }
  clearFields();
};

const goToScreen = function (screen) {
  const screenName = screen.classList[0];

  previousScreens.push(currentScreen);
  currentScreen.classList.remove("active");
  currentScreen.classList.add("no-active");
  currentScreen = screen;
  currentScreen.classList.remove("no-active");
  currentScreen.classList.add("active");

  if (screenName === "deck-screen") {
    console.log(screenName, "deck-screen");
    showDeckScreen();
  }
};

loginBTN.addEventListener("click", function () {
  goToScreen(loginScreen);
});

signinBTN.addEventListener("click", function () {
  goToScreen(signinScreen);
});

addDeckBTN.addEventListener("click", function () {
  goToScreen(addingDeckScreen);
});

createDeckBTN.addEventListener("click", function () {
  createDeck();
});

addNewCardBTN.addEventListener("click", function () {
  goToScreen(addingCardScreen);
});

///////////////////////////
///////////////////////////
// USEFUL FUNCTIONS

const checklevelBTNPossible = function (level) {
  if (level <= 1) {
    downgardeBTN.style.transform = "translateY(100vh)";
  } else if (level >= 4) {
    upgradeBTN.style.transform = "translateY(100vh)";
  } else {
    downgardeBTN.style.transform = "translateY(0px)";
    upgradeBTN.style.transform = "translateY(0px)";
  }
  downBTN.style.fill = `${colourArr[level - 2]}`;
  upBTN.style.fill = `${colourArr[level]}`;
};

function changelevel(direction, id) {
  const AllCardsArray = Object.values(currentDeck.cards);
  const oryginalCard = AllCardsArray.find((card) => card.id === id);
  const oldLevel = oryginalCard.level;
  let newLevel = oldLevel;
  direction === "down" ? newLevel-- : newLevel++;
  direction === "down" ? oryginalCard.level-- : oryginalCard.level++;

  const oldFlag = document.getElementById(`level-icon${oldLevel}`);
  const newFlag = document.getElementById(`level-icon${newLevel}`);

  oldFlag.style.transform = "scale(0.5) translateY(0px)";
  newFlag.style.transform = "scale(1) translateY(-12px)";
  checklevelBTNPossible(newLevel);
}

const checkIfStartPossible = function () {
  if (cardsToLearn.length === 0) {
    startBTN.style.transform = "translateY(100vh)";
    callToSelect.style.transform = "translateY(40px) translateX(110px)";
  } else {
    callToSelect.style.transform = "translateY(100vh) translateX(110px)";
    startBTN.style.transform = "translateY(0)";
  }
};

function resetFlagSize() {
  for (let i = 1; i <= 4; i++) {
    const currenFlag = document.getElementById(`level-icon${i}`);
    currenFlag.style.transform = "scale(0.5) translateY(0px)";
  }
}

const cleanOldLearningCards = function () {
  const currentCards = document.querySelectorAll(".current-random-card");
  currentCards.forEach(function (c) {
    c.remove();
  });
};

startBTN.addEventListener("click", function () {
  cleanOldLearningCards();
  startingCardsToLearn = cardsToLearn.length;
  goToScreen(learnScreen);
  showLearnCard(cardsToLearn);
});

nextBTN.addEventListener("click", function () {
  cardsToLearn.splice(randomIndex, 1);
  const unrevealed = document.querySelector(".unreveal");
  if (unrevealed) {
    unrevealed.style.display = "none";
  }

  const currentCards = document.querySelectorAll(".current-random-card");
  currentCards.forEach(function (c) {
    c.classList.add("hidden");
  });

  setTimeout(function () {
    cleanOldLearningCards();
  }, 200);

  setTimeout(function () {
    if (cardsToLearn.length > 0) {
      showLearnCard(cardsToLearn);
    } else {
      goToPreviousScreen();
    }
  }, 201);
});

downgardeBTN.addEventListener("click", function () {
  changelevel("down", currentCardId);
});

upgradeBTN.addEventListener("click", function () {
  changelevel("up", currentCardId);
});

goBackBTN.forEach((element) => {
  element.addEventListener("click", function () {
    goToPreviousScreen();
  });
});

const Visibility = function (item, action) {
  if (action === "visible") {
    item.classList.remove("btn-invisible");
    item.classList.add("btn-visible");
  }
  if (action === "invisible") {
    item.classList.remove("btn-visible");
    item.classList.add("btn-invisible");
  }
};
///////////////////////////
///////////////////////////
// LOG IN & SIGN IN
///////////////////////////

let matchingUser;

// LOGING IN
const checkPassword = function (givenPass, oryginalPass) {
  if (oryginalPass === givenPass) {
    currentUser = matchingUser;
    goToScreen(homeScreen);
    updateUI();
  } else {
    console.log("WRONG PASS!");
    passwordInput.classList.add("invalid");
    setTimeout(() => {
      passwordInput.classList.remove("invalid");
    }, 500);
  }
};

userNameInput.addEventListener("input", function () {
  const input = userNameInput.value;
  matchingUser = allUsers.find((user) => user.userName === input);
  if (matchingUser) {
    Visibility(tryLogInBTN, "visible");
  } else {
    Visibility(tryLogInBTN, "invisible");
  }
});

tryLogInBTN.addEventListener("click", function () {
  const givenPass = passwordInput.value;
  const oryginalPass = matchingUser.password;
  checkPassword(givenPass, oryginalPass);
});

// SIGNING IN

trySignInBTN.addEventListener("click", function () {
  const userNameInput = document.getElementById("signin-username");
  const passwordInput = document.getElementById("signin-password");

  const currentUser = {
    userName: userNameInput.value,
    password: passwordInput.value,
    decks: [],
  };
  push(usersDB, currentUser);
  clearFields();
  goToScreen(helloScreen);
});

/////////// NASŁUCHIWANIE

onValue(usersDB, (snapshot) => {
  console.log("THERE IS A CHANGE IN DB!");
  const usersData = snapshot.val();
  allUsers.length = 0;

  if (usersData) {
    Object.keys(usersData).forEach((userId) => {
      allUsers.push({
        id: userId,
        ...usersData[userId],
      });
    });
  }
  console.log(allUsers);
});

// FIRST PAGE
goToScreen(helloScreen);

/////////////////////
////////////////////
/////////////////////
////////////////////
/////////////////////
////////////////////
/////////////////////
////////////////////
/////////////////////
////////////////////
/////////////////////
////////////////////
/////////////////////
////////////////////
/////////////////////
////////////////////
/////////////////////
////////////////////
/////////////////////
////////////////////
/////////////////////
////////////////////
/////////////////////
////////////////////

////////////////////////
////////////////////////
// RANDOM FUNCTIONS
////////////////////////

const updateCardsCounters = function (deck) {
  console.log(`starting counting cards in ${deck}`);
  console.log(deck);
  if (deck.cards !== undefined) {
    console.log(deck.cards);
    const count = Object.keys(deck.cards).length;
    deck.cardCounter = count;
  } else {
    return;
  }
};

////////////////////////
////////////////////////
// ADD EVENT LISTENERS
////////////////////////

createCardBTN.addEventListener("click", function () {
  const deck = currentDeck;
  console.log(deck);
  const newCardId = `cardId${deck.cardCounter + 1}`;
  console.log(deck);

  const input1sideEl = document.getElementById("textarea-1-side");
  const input2sideEl = document.getElementById("textarea-2-side");

  const input1side = input1sideEl.value;
  const input2side = input2sideEl.value;
  const cardKey = newCardId;

  console.log(input1side, input2side, cardKey);

  let newId = 1;

  // FINDING NEW ID
  if (deck.cards) {
    let allIds = Object.values(deck.cards).map((card) => card.id);
    allIds.sort((a, b) => a - b);

    newId = 1;

    for (let id of allIds) {
      if (id === newId) {
        newId++;
      } else {
        break;
      }
    }
  } else {
    newId = 1;
  }

  const newCard = {
    id: newId,
    level: 1,
    first: input1side,
    second: input2side,
  };

  console.log(currentDeck.cards[cardKey]);
  currentDeck.cards[cardKey] = newCard;

  const hideSides = function () {
    side1card.classList.add("hidden");
    setTimeout(function () {
      side2card.classList.add("hidden");
    }, 10);

    setTimeout(function () {
      side1card.classList.remove("hidden");
      side2card.classList.remove("hidden");
    }, 400);
  };
  hideSides();

  // clear values
  input1sideEl.value = "";
  input2sideEl.value = "";

  updateCardsCounters(deck);
  updateUI();
  updateDB();
});

///////////////////////////
///////////////////////////
// SHOW LEARN CARD
// Picking radom card from array cardsToLearn and display
///////////////////////////

function showLearnCard(cards) {
  console.log("showLEARN CARD () is started =======");
  console.log(cards);
  resetFlagSize();
  learningCounter.textContent = `${cardsToLearn.length} cards left...`;

  randomIndex = Math.floor(Math.random() * cards.length);
  const randomCard = cards[randomIndex];
  currentCardId = randomCard.id;
  const firstSide = randomCard.first;
  const secondSide = randomCard.second;
  const level = randomCard.level;

  // HANDLING CHANGE LEVEL BTNS
  const currentFlag = document.getElementById(`level-icon${level}`);
  currentFlag.style.transform = "scale(1) translateY(-12px)";

  // Creating html element
  const newCard = document.createElement("div");
  newCard.innerHTML = `
          <div class="deck-small first-side side1 current-random-card hidden-right" id="first-side-learn">
              <p>${firstSide}</p>
          </div>
          <div class="deck-small second-side side2 current-random-card hidden-right unreveal">
              <p>${secondSide}</p>
          </div>
          `;
  // Finding target
  const targetElement = document.getElementById("target-card");
  // Appending newDeck
  targetElement.insertAdjacentHTML("afterend", newCard.innerHTML);

  setTimeout(function () {
    const newCards = document.querySelectorAll(".hidden-right");
    newCards.forEach(function (card) {
      card.classList.remove("hidden-right");
    });
  }, 10);

  checklevelBTNPossible(level);

  const firstSideLearn = document.getElementById("first-side-learn");
  firstSideLearn.addEventListener("click", function () {
    const unrevealed = document.querySelector(".unreveal");
    unrevealed.classList.remove("unreveal");
    firstSideLearn.classList.remove("first-side");
  });
}

/////////////////////
////////////////////
// SHOW WHICH STACK IS SELECTED
////////////////////

function showStackSelected() {
  const myStacks = document.querySelectorAll(".stackBTN");
  myStacks.forEach(function (stack) {
    if (!stackSelectorBTN) {
      stack.addEventListener("click", function (event) {
        const clickedElement = event.target.closest(".stack");
        const id = clickedElement.id.slice(-1);
        const currentDot = document.getElementById(`dot-selection${id}`);

        if (currentDot.classList.contains("selected")) {
          currentDot.classList.remove("selected");
          // Remove from cardsToLearn
          cardsToLearn = cardsToLearn.filter((card) => card.level !== +id);
        } else {
          currentDot.classList.add("selected");
          // Add to cardsToLearn
          for (const cardId in currentDeck.cards) {
            const card = currentDeck.cards[cardId];
            if (
              card.level === +id &&
              !cardsToLearn.some((existingCard) => existingCard === card)
            ) {
              cardsToLearn.push(card);
            }
          }
        }
        checkIfStartPossible();
      });
    }
  });
  setTimeout(function () {
    stackSelectorBTN = true;
  }, 1000);
}

/////////////////////
////////////////////
// REFRESH ALL DATA IN CURRENT DECK SCREEN
////////////////////

const showDeckScreen = function () {
  const deckid = `deck${currentNumber}`;
  console.log(currentDeck);
  // currentDeck = currentUser[deckid];
  const deckScreenTitle = document.getElementById("deck-screen-title");
  deckScreenTitle.innerHTML = `<h1>${currentDeck.nameDeck}</h1><br><p> ${currentDeck.cardCounter} cards in this deck</p>`;

  // Usuń stare linie
  const lines = document.querySelectorAll(".line");
  lines.forEach((l) => {
    l.remove();
  });

  let allLevels = [];

  for (let i = 1; i <= 4; i++) {
    let cardsWithLevel = [];
    for (const cardId in currentDeck.cards) {
      if (
        currentDeck.cards.hasOwnProperty(cardId) &&
        currentDeck.cards[cardId].level === i
      ) {
        cardsWithLevel.push(cardId);
      }
    }
    allLevels.push(cardsWithLevel);
  }

  for (let i = 1; i <= 4; i++) {
    const stackNumber = i;
    const iterationArray = allLevels[i - 1];
    const seekingStack = `line-target${stackNumber}`;
    const targetStack = document.getElementById(seekingStack);

    if (iterationArray.length > 0) {
      // Tworzenie linii
      for (let j = 0; j < iterationArray.length; j++) {
        const newLine = document.createElement("div");
        newLine.innerHTML = `<div class="line"></div>`;
        targetStack.insertAdjacentElement(
          "beforeend",
          newLine.firstElementChild
        );
      }
    }
  }
  function updateCounters(allLevels) {
    for (let i = 1; i <= 4; i++) {
      const counterElement = document.getElementById(`counter${i}`);
      const levelCards = allLevels[i - 1];
      counterElement.textContent = levelCards.length;
    }
  }
  updateCounters(allLevels);

  checkIfStartPossible();
  showStackSelected();
};

////////////////////////
////////////////////////
// READ DECK FROM ARRAY
////////////////////////

const readDecksfromArray = function () {
  console.log(currentUser);
  clearFields();

  const titleName = document.querySelector(".title-name");
  titleName.innerHTML = `<h1>Hello ${currentUser.userName}`;
  // REMOVE OLD DECKS
  function removeDeckContainers() {
    const deckContainers = document.querySelectorAll(".deck-container");
    deckContainers.forEach((container) => {
      container.remove();
    });
  }
  removeDeckContainers();

  let keyCounter = 1;
  let newDeck = {};

  // REARANGE ID's and KEYS
  for (const key in currentUser.decks) {
    if (key.includes("deck")) {
      const newKey = `deck${keyCounter}`;
      newDeck = currentUser.decks[key];
      delete currentUser.decks[key];
      newDeck.id = keyCounter;
      currentUser.decks[`deck${keyCounter}`] = newDeck;

      keyCounter++;
    }
  }

  // READING DECKS FROM ARRAY
  setTimeout(function () {
    function findDecksWithKeyword(decksObject) {
      const matchingDecks = [];

      for (const key in currentUser.decks) {
        if (
          key.includes("deck") &&
          typeof currentUser.decks[key] === "object"
        ) {
          const deck = currentUser.decks[key]; // Dodaj deklarację deck
          const currentDeckCounter = deck.cardCounter;

          // Checking if its olny 1 or 0 card
          function changeElementIfIdIsOne() {
            if (currentDeckCounter === 1) {
              const elementToChange =
                document.getElementById("deck-card-counter");
              elementToChange.textContent = `${currentDeckCounter} card`;
            }

            if (currentDeckCounter === undefined) {
              const elementToChange =
                document.getElementById("deck-card-counter");
              elementToChange.textContent = `0 cards`;
            }
          }

          changeElementIfIdIsOne();

          matchingDecks.push(deck);

          const createDeck = (deck, currentDeckCounter) => {
            // Przekaz deck jako argument
            // Creating html element
            const newDeck = document.createElement("div");
            newDeck.innerHTML = `
              <div class="deck-container" id="deck-container-${deck.id}">
                  <div class="home-deck-small deck-small" id="deck${deck.id}">
                      <div><h3>${deck.nameDeck}</h3></div>
                      <div id="deck-card-counter"><p>${currentDeckCounter} cards<p></div>
                  </div>
                  <div class="deck-bar" id="bar-container-${deck.id}">
            
                      <div class="option" id="add-${deck.id}">
                      <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H64zM0 96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM200 344V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H248v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/></svg>
                      <p>add cards</p>
                      </div>
            
            
                      <div class="option" id="edit-${deck.id}">
                      <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"/></svg>
                      <p>edit</p>
                      </div>
            
            
                      <div class="option" id="delete-${deck.id}">
                      <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
                      <p>delete</p>
                      </div>
                </div>
              </div>
            `;

            // Finding target
            const targetElement = document.getElementById("target");
            // Appending newDeck
            targetElement.insertAdjacentHTML("afterend", newDeck.innerHTML);
          };

          createDeck(deck, currentDeckCounter); // Wywołaj funkcję createDeck i przekaż obiekt deck jako argument
        }
      }
    }

    findDecksWithKeyword();

    // CLEARING OLD LISTS
    allBars = [];
    allDecks = [];
    allDeleteBtns = [];

    //FILLING LISTS
    decksContainers = document.querySelectorAll(".deck-container");
    deckBars = document.querySelectorAll(".deck-bar");
    deleteBtns = document.querySelectorAll(".delete");
    editBtns = document.querySelectorAll(".edit");

    decksContainers.forEach((deck) => {
      allDecks.push(deck);
    });
    deckBars.forEach((bar) => {
      allBars.push(bar);
    });
    deleteBtns.forEach((btn) => {
      allDeleteBtns.push(btn);
    });
    showDeckBarListiner();
  }, 10);
};

////////////////////////
////////////////////////
//DELETE DECK CONFIRMATION SCREEN
////////////////////////

// RETURN FROM CONFIMRATION
const returnFromConfirmation = function () {
  const confirmationScreen = document.querySelectorAll(".confirmation-screen");
  confirmationScreen.forEach((container) => {
    container.remove();
  });
  const visibleScreen = document.querySelector(".active");
  visibleScreen.style.filter = "blur(0px)";
};

//DELETE DECK PROMISE
async function myPromise() {
  // Tworzenie promisy, które będą rozwiązane w zależności od wyboru użytkownika
  const backButtonPromise = new Promise((resolve) => {
    const confirmback = document.querySelector(".confirmback");
    confirmback.addEventListener("click", () => resolve("back"));
  });

  const confirmDeletePromise = new Promise((resolve) => {
    const confirmDelete = document.querySelector(".confirmDelete");
    confirmDelete.addEventListener("click", () => resolve("ok"));
  });

  const userChoice = await Promise.race([
    backButtonPromise,
    confirmDeletePromise,
  ]);

  if (userChoice === "back") {
    returnFromConfirmation();
    return;
  } else if (userChoice === "ok") {
    console.log(currentDeck);
    const currentDeckId = currentDeck.id;
    const seekingDeckName = `deck${currentDeckId}`;

    if (currentUser.decks.hasOwnProperty(seekingDeckName)) {
      delete currentUser.decks[`deck${currentDeckId}`];
      updateDB();
    }
    console.log(currentDeck);
    currentUser.counter--;
    updateUI("from deleting deck");
    readDecksfromArray();
  }
  returnFromConfirmation();
}

const createConfirmationScreen = function () {
  // Creating html element
  const createConfirmationScreen = document.createElement("div");
  createConfirmationScreen.innerHTML = `
    <div class="screen confirmation-screen">
        <h3>Delete this deck? U sure?</h3>
        <div class="btn confirmDelete">OK</div>
        <div class="btn confirmback">BACK</div>
    </div>
    `;
  // Finding target
  const targetElement = document.getElementById("confirmation-screen-target");
  // Appending newDeck
  targetElement.insertAdjacentHTML(
    "afterend",
    createConfirmationScreen.innerHTML
  );

  myPromise();
};

////////////////////////
////////////////////////
// SHOW BAR
////////////////////////
// Click to go to choosen DECK SCREEN

function showDeckBarListiner() {
  const myDecks = document.querySelectorAll(".home-deck-small");
  myDecks.forEach(function (deck) {
    deck.addEventListener("click", function (event) {
      const clickedElement = event.target.closest(".home-deck-small");
      const id = clickedElement.id;
      // TO wazne do zapamietania !
      // w jaki sposob przeszukac obiekt:
      if (currentUser.decks.hasOwnProperty(id)) {
        currentDeck = currentUser.decks[id];
      }
      // currentDeck jest teraz obiektem
      goToScreen(deckScreen);
    });
  });

  // Hover to slide down bar with menu
  decksContainers.forEach(function (deck) {
    let seekingBar; // string z nazwą bara
    let currentBar; // znaleziony obiekt

    deck.addEventListener("mouseenter", function () {
      addDeckBTN.style.transform = "translateY(20px)";

      currentNumber = deck.id.slice(-1);
      seekingBar = `bar-container-${currentNumber}`;
      currentBar = allBars.find(function (d) {
        return d.id === seekingBar;
      });
      currentBar.style.transform = "translateY(90px)";
      currentBar.style.opacity = "1";

      // ADD cards btn
      let seekingAdd = `add-${currentNumber}`;
      let currentAdd = deck.querySelector(`#${seekingAdd}`);

      currentAdd.addEventListener("click", function () {
        goToScreen(addingCardScreen);
      });

      // Edit btn

      // Delete btn
      let seekingDelete = `delete-${currentNumber}`;
      let currentDelete = deck.querySelector(`#${seekingDelete}`);
      currentDelete.addEventListener("click", function (event) {
        const visibleScreen = document.querySelector(".active");
        visibleScreen.style.filter = "blur(20px)";

        // Seting currentDeck
        const seekingDeckName = `deck${currentNumber}`;
        if (currentUser.decks.hasOwnProperty(seekingDeckName)) {
          currentDeck = currentUser.decks[seekingDeckName];
        }
        createConfirmationScreen();
      });
    });

    deck.addEventListener("mouseleave", function () {
      currentBar.style.transform = "translateY(0px)";
      currentBar.style.opacity = "0";
      addDeckBTN.style.transform = "translateY(0px)";
    });
  });
  // updateUI('from show Bar FUNC')
}

// REFRESH ID's

const createDeck = function () {
  const nameYourDeck = document.getElementById("name-your-deck");
  const name1side = document.getElementById("name-1-side");
  const name2side = document.getElementById("name-2-side");

  const inputDeck = nameYourDeck.value;
  const input1side = name1side.value;
  const input2side = name2side.value;
  const deckCurrentCounter = currentUser.counter + 1;
  const newKey = `deck${deckCurrentCounter}`;

  const newDeck = {
    id: +deckCurrentCounter,
    nameDeck: inputDeck,
    name1side: input1side,
    name2side: input2side,
    cards: {},
    cardCounter: 0,
  };

  // Sprawdź, czy currentUser istnieje i ma właściwość decks
  if (!currentUser) {
    console.error("currentUser is not defined or null");
    return;
  }

  if (!currentUser.decks) {
    currentUser.decks = {};
  }

  currentUser.decks[newKey] = newDeck;

  const userDeckRef = ref(database, `users/${currentUser.id}/decks/${newKey}`);
  set(userDeckRef, newDeck);

  currentUser.counter++;

  nameYourDeck.value = "";
  name1side.value = "";
  name2side.value = "";

  // Przeiteruj po wszystkich użytkownikach i zaktualizuj ich bazę danych, jeśli ID pasuje
  // Object.keys(allUsers).forEach((userId) => {
  //   const user = allUsers[userId];
  //   if (user.id === currentUser.id) {
  //     const userRef = ref(database, `users/${currentUser.id}`);
  //     update(userRef, {
  //       decks: currentUser.decks,
  //       counter: currentUser.counter,
  //     });
  //   }
  // });

  goToScreen(homeScreen);
  updateUI();
  updateDB();
};

//////////
// SKIP LOGIN

const skipLogin = function () {
  matchingUser = allUsers[0];
  console.log(matchingUser);
  const givenPass = "1";
  const oryginalPass = "1";
  checkPassword(givenPass, oryginalPass);
  goToScreen(homeScreen);
};

setTimeout(() => {
  skipLogin();
}, 400);
