'use strict'



// GENERAL
let decksContainers = document.querySelectorAll('.deck-container')
let deckBars = document.querySelectorAll('.deck-bar')
let deleteBtns = document.querySelectorAll('.delete')
let editBtns = document.querySelectorAll('.edit')

const allScreens = document.querySelectorAll('.screen')
const addDeckBTN = document.getElementById('add-deck-container')
const createDeckBTN = document.querySelector('.create-deck')
const loginBTN = document.querySelector('.login-btn')
const goBackBTN = document.querySelectorAll('.go-back-btn')
const startBTN = document.getElementById('start')
const nextBTN = document.querySelector('.next')
const addNewCardBTN = document.getElementById('add-new-card')
const createBTN = document.getElementById('create-card')


const learningCounter = document.querySelector('.learning-counter')
const cardContainer = document.querySelector('.card-container')
const side1card = document.querySelector('.side1-card')
const side2card = document.querySelector('.side2-card')
const stacks = document.querySelectorAll('.stack')
const callToSelect = document.getElementById('call-to-sellect-stack')
const dots = document.querySelectorAll('.dot-selection')

// BTN containers
const downgardeBTN = document.querySelector('.downgrade')
const upgradeBTN = document.querySelector('.upgrade')
// SVG olny
const downBTN = document.getElementById('level-d')
const upBTN = document.getElementById('level-u')

// SCREENS
const homeScreen = document.querySelector('.home-screen')
const addingDeckScreen = document.querySelector('.adding-deck-screen')
const addingCardScreen = document.querySelector('.adding-card-screen')
const deckScreen = document.querySelector('.deck-screen')
const learnScreen = document.querySelector('.learn-screen')

///////////////////////////
///////////////////////////
///////////////////////////

// GLOBARL VARIABLES

const colourArr = ['var(--granade)', 'var(--blue)', 'var(--teal)', 'var(--green)']
const allUsers = [user1, user2]
let currentUser = user1;
let currentScreen
let allBars = []
let allDecks = []
let allDeleteBtns = []
let deckKeys // Array [deck1, deck2, deck3]
let currentNumber // np. '1' w zaleznosci od wybranego decka
let deckId
let recentlyDeleted // string ostatnio usuniętego decka  
let recentlyDeletedNum // num ostatnio usuniętego decka  
let deckCounter
let stackSelectorBTN = false;
let currentDeck
let cardsToLearn = [];
let currentCardId
let startingCardsToLearn
let randomIndex


///////////////////////////
///////////////////////////
// UPDATE UI
///////////////////////////

const updateUI = function (source) {
    console.log('UPDATING UI from', source);
    // Deck Counter
    const counter = function () {
        deckCounter = 0
        for (const key in currentUser) {
            if (key.includes('deck')) {
                const deck = currentUser[key];
                deckCounter++
            }
        }
        currentUser.counter = deckCounter
    }
    counter()

    setTimeout(function () {
        rearrangeDeckIds()
        updateCardsCounters()
        readDecksfromArray()
        dots.forEach(function (d) {
            d.classList.remove('selected')
        })
    }, 100)

    if (deckCounter === 3) {
        addDeckBTN.style.transform = "translateX(-100vw)"
        addDeckBTN.style.opacity = '0'
    } else if (deckCounter < 3) {
        addDeckBTN.style.transform = "translateX(0%)"
        addDeckBTN.style.opacity = '1'
    }
    const nameYourDeck = document.getElementById('name-your-deck')
    const name1side = document.getElementById('name-1-side')
    const name2side = document.getElementById('name-2-side')
    nameYourDeck.value = ''
    name1side.value = ''
    name2side.value = ''
}

// SHOW ME SCREEN
const showMeScreen = function (screen, id) {
    currentScreen = screen
    // handling the screen
    allScreens.forEach(element => {
        element.classList.remove('visible');
        element.classList.add('hidden');
    });
    screen.classList.remove('hidden');
    setTimeout(function () {
        allScreens.forEach(s => {
            screen.classList.add('visible');
        })
    }, 300)

    if (screen === deckScreen) {
        showDeckScreen(id)
        cardsToLearn = []
    }
    updateUI(screen)
}

///////////////////////////
///////////////////////////
// USEFUL FUNCTIONS

const checklevelBTNPossible = function (level) {
    if (level <= 1) {
        downgardeBTN.style.transform = 'translateY(100vh)'
    } else if (level >= 4) {
        upgradeBTN.style.transform = 'translateY(100vh)'
    } else {
        downgardeBTN.style.transform = 'translateY(0px)'
        upgradeBTN.style.transform = 'translateY(0px)'
    }
    downBTN.style.fill = `${colourArr[level - 2]}`
    upBTN.style.fill = `${colourArr[level]}`
}

function changelevel(direction, id) {
    const AllCardsArray = Object.values(currentDeck.cards)
    const oryginalCard = AllCardsArray.find(card => card.id === id)
    const oldLevel = oryginalCard.level
    let newLevel = oldLevel
    direction === 'down' ? newLevel-- : newLevel++
    direction === 'down' ? oryginalCard.level-- : oryginalCard.level++

    const oldFlag = document.getElementById(`level-icon${oldLevel}`)
    const newFlag = document.getElementById(`level-icon${newLevel}`)

    oldFlag.style.transform = 'scale(0.5) translateY(0px)'
    newFlag.style.transform = 'scale(1) translateY(-12px)'
    checklevelBTNPossible(newLevel)
}

const checkIfStartPossible = function () {
    if (cardsToLearn.length === 0) {
        startBTN.style.transform = 'translateY(100vh)'
        callToSelect.style.transform = 'translateY(40px) translateX(110px)'
    } else {
        callToSelect.style.transform = 'translateY(100vh) translateX(110px)'
        startBTN.style.transform = 'translateY(0)'
    }
}
function resetFlagSize() {
    for (let i = 1; i <= 4; i++) {
        const currenFlag = document.getElementById(`level-icon${i}`)
        currenFlag.style.transform = 'scale(0.5) translateY(0px)'
    }
}


///////////////////////////
///////////////////////////
// PAGE NAVIGATION

loginBTN.addEventListener('click', function () {
    showMeScreen(homeScreen)
})

addDeckBTN.addEventListener('click', function () {
    showMeScreen(addingDeckScreen)
})

createDeckBTN.addEventListener('click', function () {
    createDeck()
})

addNewCardBTN.addEventListener('click', function () {
    addNewCardScreen(deckId)
})


const cleanOldLearningCards = function () {
    const currentCards = document.querySelectorAll('.current-random-card');
    currentCards.forEach(function (c) {
        c.remove()
        console.log('removed'); // musi być 2X removed bo są dwie strony
    })
}

startBTN.addEventListener('click', function () {
    cleanOldLearningCards()
    startingCardsToLearn = cardsToLearn.length
    showMeScreen(learnScreen)
    showLearnCard(cardsToLearn)
})

nextBTN.addEventListener('click', function () {
    cardsToLearn.splice(randomIndex, 1)
    const unrevealed = document.querySelector('.unreveal')
    if (unrevealed) { unrevealed.style.display = "none" }

    const currentCards = document.querySelectorAll('.current-random-card');
    currentCards.forEach(function (c) {
        c.classList.add('hidden')
    })

    setTimeout(function () {
        cleanOldLearningCards()
    }, 200)

    setTimeout(function () {
        if (cardsToLearn.length > 0) {
            showLearnCard(cardsToLearn)
        } else {
            showMeScreen(deckScreen)
        }
    }, 201)
})


downgardeBTN.addEventListener('click', function () {
    changelevel('down', currentCardId)
})

upgradeBTN.addEventListener('click', function () {
    changelevel('up', currentCardId)
})




goBackBTN.forEach(b => {
    b.addEventListener('click', function () {
        let previousScreen
        if (currentScreen === deckScreen) {
            previousScreen = homeScreen
        } else if (currentScreen === addingCardScreen) {
            previousScreen = deckScreen
        } else if (currentScreen === addingDeckScreen) {
            previousScreen = homeScreen
        } else if (currentScreen = learnScreen) {
            previousScreen = deckScreen
        }

        showMeScreen(previousScreen)
    })
})


setTimeout(function () {
    allScreens.forEach(s => {
        s.classList.add('smooth')
        addDeckBTN.style.transition = ('1s ease')
    })
}, 1000)


// FIRST PAGE
showMeScreen(homeScreen)
readDecksfromArray()
showDeckBarListiner()