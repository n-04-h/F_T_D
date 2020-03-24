/*
TODO:
 - Events:
          - Spielername -> Server schicken
          - Creator:Server
                    -> start Game
          - Joiners:Client
                    -> enable Guess Field if incoming player_id === my_id
          -> Server:
                    -> send Guess Number
          Server:
                    -> check Number in Array
          - kam noch nicht weiter

 */

let cards = [
    [2, "c"], [3, "c"], [4, "c"], [5, "c"], [6, "c"], [7, "c"], [8, "c"], [9, "c"], [10, "c"], [11, "c"], [12, "c"], [13, "c"], [14, "c"],
    [2, "d"], [3, "d"], [4, "d"], [5, "d"], [6, "d"], [7, "d"], [8, "d"], [9, "d"], [10, "d"], [11, "d"], [12, "d"], [13, "d"], [14, "d"],
    [2, "h"], [3, "h"], [4, "h"], [5, "h"], [6, "h"], [7, "h"], [8, "h"], [9, "h"], [10, "h"], [11, "h"], [12, "h"], [13, "h"], [14, "h"],
    [2, "s"], [3, "s"], [4, "s"], [5, "s"], [6, "s"], [7, "s"], [8, "s"], [9, "s"], [10, "s"], [11, "s"], [12, "s"], [13, "s"], [14, "s"]
];                                                          //2D Karten Array

const role = ['dealer', 'guesser', 'watcher'];              // Die möglichen Rollen
let players = [                                             // player als object
    {
        name: "COM_1",                                       // Name des jeweiligen spielers
        role: role[0]                                        // Role des jeweiligen spielers

    {
        name: "",
        role: role[1]
    },
    {
        name: "COM_2",
        role: role[2]
    },
    {
        name: "COM_3",
        role: role[2]
    },
];                                                           // player als objekt

let players_new = [                                             
    {
        name: "",                                       
        role: ""                                      
    },
    {
        name: "",
        role: ""
    },
    {
        name: "",
        role: ""
    },
    {
        name: "",
        role: ""
    },
];                                                          // wenn der nächste dran ist wird dieses objekt als zwischen füller verwendet
let player_name;                                            // wird verwendet um rollen neu zu verteilen

let prev_i;
let prev_guess;                                             // vorherige Zahl die geraten wurde (für abgleich welche beim 2. Versuch noch angezeigt werden)

let trys = 2;                                               // versuche die jeder spieler in seiner runde zum raten hat
//let guess;                                                // könnte für output nützlich sein damit die anderen sehen welche zahl geraten wurde

let fail_guesses = 0;                                       // zählt die fehl versuche von einem spielern pro 2 versuche h
let fail_rounds = 0;                                        // zählt die fehl versuche von allen spielern also pro runde +1 wenn einer 2x verhaut
let stay_dealer = true;                                     // bool um entscheiden wie in next round verfahren wird

//fürs html
//TODO current guess einblenden damit alle es sehen können
const start_form = document.getElementById('start-form');
const player_name_input = document.getElementById('player-name');
const output = document.getElementById('output');
const who_is_dealer_output = document.getElementById('current-dealer');
const who_is_guesser_output = document.getElementById('current-guesser');
const shown_cards = document.getElementById('shown-cards');
const guess_field = document.getElementById('guess-field');

function init() {
    player_name = player_name_input.value;

    //fake variante
    players[1].name = player_name;

    //ausblenden der start elemente
    start_form.hidden = true;

    //muss in switchRole dann auch wieder geändert werden
    who_is_dealer_output.innerHTML = players[0].name;
    who_is_guesser_output.innerHTML = players[1].name;

    //einblendet des spielfelds
    output.hidden = false;
    shown_cards.hidden = false;

    //TODO weiteren shuffle für spieler zuteilung einbauen damit dealer nicht immer bei players[0] beginnt

    // durch mischen der karten
    shuffleArray(cards);

    //Server schickt callback wenn der admin (players[0] start game gedrückt hat)
    //auf dem server wird zufällig aus dem players obj gewählt, wer dealer wird
    //spieler nach ihm ist automatisch guesser
    //player_id === role[1] also guesser soll als call back raus gehen
    // client side erwartet diesen callback als event und wenn die id der eigenen entspricht
    // -> enableNumersToGuess
    enableNumbersToGuess();
}

function shuffleArray(cards) {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
}

//zeigt dem spieler die möglichen Zahlen welche noch im Deck sind karten
//soll wenn server mit eingebunden ist natürlich nur dem spieler mit der mit gesendeten id angezeigt werden
function enableNumbersToGuess(feedback) {

    let cards_over = [];

    //nur die karten oberhalb von prev_guess anzeigen
    if (feedback === 1) {
        for (let i = 0; i < cards.length; i++) {
            if (cards[i][0] > prev_guess) {
                // es soll nicht für jeden gefundenen eintrag  ein button erzeugt werden
                // dieser array soll alle karten die gefunden werden sepichern
                //bevor er jedoch einen eintrag speichert soll geprüft werden ob dieser schon existiert
                if (cards_over.indexOf(cards[i][0]) === -1) cards_over.push(cards[i][0]);
            }
        }
    }

    //nur die karten unterhalb von prev_guess anzeigen
    else if (feedback === -1) {
        for (let i = 0; i < cards.length; i++) {
            if (cards[i][0] < prev_guess) {
                // es soll nicht für jeden gefundenen eintrag  ein button erzeugt werden
                // dieser array soll alle karten die gefunden werden sepichern
                //bevor er jedoch einen eintrag speichert soll geprüft werden ob dieser schon existiert
                if (cards_over.indexOf(cards[i][0]) === -1) cards_over.push(cards[i][0]);
            }
        }
    } else {
        for (let i = 0; i < cards.length; i++) {
            if (cards_over.indexOf(cards[i][0]) === -1) cards_over.push(cards[i][0]);
        }
    }

    //array sortieren dass der nächste loop die buttons in richtiger reihenfolge raus haut
    cards_over.sort(function (a, b) {
        return a - b;
    });

    for (let j = 0; j < cards_over.length; j++) {
        guess_field.innerHTML += '<button id="' + cards_over[j] + '" onclick="guessF(this.id)">' + cards_over[j] + '</button>'
    }
}

// wenn spieler auf eine zahl drückt  die ihm angezeigt wird
function guessF(c) {

    guess_field.innerHTML = "";
    trys--; // von 2 auf 1

    let cardToShow = cards[cards.length - 1].toString();                        // letzte stelle im array zusammen führen damit zahl+buchstabe kommt und im html angesprochen und eingetragen werden kann
    cardToShow = cardToShow.replace(",", "");

    if (c == cards[cards.length - 1][0]) {
        showCard(c, cardToShow);
        fail_guesses = false;
        next(fail_guesses);
    } else {                                                                    // dieser teil wird nur einmal  ausgeführt user rät falsch.
        fail_guesses = true;
        prev_guess = c;
        let feedback;
        if (trys === 1) {
            if (c < cards[cards.length - 1][0]) {
                feedback = 1;                                                   // Zahl muss größer sein
            } else if (c > cards[cards.length - 1][0]) {
                feedback = -1;                                                  // Zahl muss kleiner sein
            }
            showGuessAgainMsg(feedback);
        } else {                                                                // wird ausgeführt wenn der spieler bereits 2x getippt hat
            //TODO diferenz in html ausgeben die der spieler trinken muss
            c = cards[cards.length - 1][0];
            showCard(c, cardToShow);
            next(fail_guesses);
        }
    }
}

function showGuessAgainMsg(feedback) {
    if (feedback === 1) alert("bigger");
    else if (feedback === -1) alert("smaller");

    // jetzt soll für den user wieder eine auswahl generiert werden
    enableNumbersToGuess(feedback);
}

function showCard(c, cardToShow) {
    cards.pop();

    let number;
    if (c == 2) number = "two";
    if (c == 3) number = "three";
    if (c == 4) number = "four";
    if (c == 5) number = "five";
    if (c == 6) number = "six";
    if (c == 7) number = "seven";
    if (c == 8) number = "eight";
    if (c == 9) number = "nine";
    if (c == 10) number = "ten";
    if (c == 11) number = "eleven";
    if (c == 12) number = "twelve";
    if (c == 13) number = "thirteen";
    if (c == 14) number = "fourteen";


    if (document.getElementById(number + "_1").style.backgroundImage === "") {
        document.getElementById(number + "_1").style.background = "url(img/" + cardToShow + ".svg)";
        document.getElementById(number + "_1").style.backgroundSize = "100%";
        document.getElementById(number + "_1").style.backgroundRepeat = "no-repeat";
    } else if (document.getElementById(number + "_2").style.backgroundImage === "") {
        document.getElementById(number + "_2").style.background = "url(img/" + cardToShow + ".svg)";
        document.getElementById(number + "_2").style.backgroundSize = "100%";
        document.getElementById(number + "_2").style.backgroundRepeat = "no-repeat";
    } else if (document.getElementById(number + "_3").style.backgroundImage === "") {
        document.getElementById(number + "_3").style.background = "url(img/" + cardToShow + ".svg)";
        document.getElementById(number + "_3").style.backgroundSize = "100%";
        document.getElementById(number + "_3").style.backgroundRepeat = "no-repeat";
    } else {
        document.getElementById(number + "_4").style.background = "url(img/" + cardToShow + ".svg)";
        document.getElementById(number + "_4").style.backgroundSize = "100%";
        document.getElementById(number + "_4").style.backgroundRepeat = "no-repeat";
    }
}

function next(fail_guesses) {       // meint 2x falsch vom selben spieler
    if (fail_guesses === true) { // nach 2x falsch raen wird diese mit true übergeben
        fail_rounds++;
        if (fail_rounds < 3) {
            stay_dealer = true;
        } else if (fail_rounds === 3) {
            fail_rounds = 0;
            stay_dealer = false;
        }
    } else if (fail_guesses === false) {
        // wenn richtig geraten wurde setzt es die runden zurück und dealer bleibt!
        fail_rounds = 0;
        stay_dealer = true;
    }
    trys = 2;
    switchRole();
}

function switchRole() {                                                           //2 möglichkeiten

    //1. alle wechseln da der dealer weiter gegeben wird
    if (stay_dealer === false) {
        for (let i = 0; i < players.length; i++) {
            prev_i = i - 1;
            if (prev_i < 0) {
                prev_i = players.length - 1;
            }
            console.log("deswegen verutscht role von dealer");
            players_new[i].role = players[prev_i].role;
        }
    }

    //2. dealer bleibt also nur die restlichen durch switchen
    else if (stay_dealer === true) {

        for (let i = 0; i < players.length; i++) {
            prev_i = i - 1;
            if (prev_i < 0) {
                prev_i = players.length - 1;
            }
            if (players[i].role !== role[0]) {                         // betrifft mich also players[1] da ich nicht dealer bin
                if (players[prev_i].role === role[0]) {                // betrifft mich da der vor mir players[0] dealer ist
                    prev_i = prev_i - 1;                               // sagt es soll die role von letztem spieler nehmen
                    if (prev_i < 0) {                                  // wenn <0 dann max von players
                        prev_i = players.length - 1;
                    }
                }

                players_new[i].role = players[prev_i].role;

            } else if (players[i].role === role[0]) {
                players_new[i].role = players[i].role;
            }
        }
    }
    //neuer loop um altes objekt zu überschreiben
    for (let i = 0; i < players.length; i++) {
        //aber nur die überschreiben wo role nicht dealer

        players[i].role = players_new[i].role;

    }
    //loop für die ausgabe -> braucht man bei der server basierten variante evtl nicht.
    for (let i = 0; i < players.length; i++) {
        //console.table("Name: " + players[i].name + "Rolle: " + players[i].role);
        if (players[i].role === role[0]) who_is_dealer_output.innerHTML = players[i].name;
        if (players[i].role === role[1]) who_is_guesser_output.innerHTML = players[i].name;
    }
    enableNumbersToGuess();
}
