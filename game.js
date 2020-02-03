/*
 *  FILE        : game.js
 *  PROJECT     : PROG8110 - Project 1
 *  PROGRAMMER  : Jackson Ruby - 6726699
 *  DATE        : Feb. 9, 2020
 *  DESCRIPTION :
 *      Main code for the Deal or No Deal game.
 */

 // get the case class from the case.js file
const Case = require("./case.js");

// different states that the game can be in
const GAME_STATE = Object.freeze({
    START: Symbol("start"),
    USER_PICKING_THEIR_CASE: Symbol("user_picking_their_case"),
    BANKER_OFFERING: Symbol("banker_offering"),
    USER_PICKING_CASE: Symbol("user_picking_case"),
    USER_DECIDING_CASE_VALUE: Symbol("user_deciding_case_value")
});

// values for the cases
const CASE_VALUES = [ 
    0.01, 
    1, 
    5, 
    10, 
    25, 
    50, 
    75, 
    100, 
    200, 
    300, 
    400, 
    500, 
    750, 
    1000, 
    5000, 
    10000, 
    25000, 
    50000, 
    75000, 
    100000, 
    200000, 
    300000, 
    400000, 
    500000, 
    750000, 
    1000000
];

// other constants
const CASES_AMOUNT = 26;
const INCENTIVE = 1.02;
const INITIAL_CASE_PICKING_AMOUNT = 6;

// game class
module.exports = class Game{
    
    // FUNCTION     : constructor
    // DESCRIPTION  : Sets the game state to the start state
    constructor() {
        this.gameState = GAME_STATE.START;
    }

    // FUNCTION     : setup
    // DESCRIPTION  : Sets up the game to be played
    setup(){
        
        // reset some variables
        this.casesArray = [];
        this.nCasePickingAmount = INITIAL_CASE_PICKING_AMOUNT;
        this.gameState = GAME_STATE.USER_PICKING_THEIR_CASE;
        let caseValues = [...CASE_VALUES];
         
        // iterate through all the cases to set random values
        for (var caseNum = 1; caseNum <= CASES_AMOUNT; caseNum++) {
            let casesRemaining = caseValues.length;
            let idxRand = 0;
            if (casesRemaining > 1) {
                idxRand = Math.floor(Math.random() * casesRemaining); 
            }
            this.casesArray.push(new Case(caseNum, caseValues[idxRand]));
            caseValues.splice(idxRand, 1);
        }
        console.log(this.casesArray);
    }

    // FUNCTION     : makeAMove()
    // DESCRIPTION  : Gets input from the user and performs a move in the game
    makeAMove(sInput, fCallback){

        // initialize the variables
        let sReturn = [];
        let nInput = 0;

        // determine which state the game currently is and proceed accordingly
        switch (this.gameState)
        {
            // game is starting
            case GAME_STATE.START:
                // set up the game
                this.setup();
                // show initial message
                sReturn.push("Welcome to Deal or No Deal!");
                sReturn.push("Please pick your case.");
                sReturn.push("There are " + CASES_AMOUNT + " cases to choose from.");
                break;

            // user is picking their case at the beginning of the game
            case GAME_STATE.USER_PICKING_THEIR_CASE:
                // ensure the input is a number
                if (isNaN(sInput) || sInput.includes(".")) {
                    sReturn.push("Please enter a case number.");
                } else {
                    // set the numeric value
                    nInput = Number(sInput);

                    // ensure the number is valid
                    if (nInput < 1 || nInput > CASES_AMOUNT) {
                        sReturn.push("Please enter a case number between 1 and " + CASES_AMOUNT + ".")
                    } else {
                        // set the user's case and show the banker's offer
                        this.userCase = this.casesArray[nInput - 1];
                        sReturn.push("The banker is making an offer.");
                        sReturn.push("The banker has made an offer of $" + this.calculateOffer() + ".");
                        sReturn.push("Would you like to take his offer? (y/n)")
                        this.gameState = GAME_STATE.BANKER_OFFERING;
                        console.log(this.userCase);
                    }
                }
                break;

            // banker is making an offer and user is deciding to take or leave it
            case GAME_STATE.BANKER_OFFERING:
                // determine what the user input was
                switch (sInput.toLowerCase())
                {
                    // y or yes for a yes answer
                    case "y":
                    case "yes":
                        // user has accepted the offer and the game finishes
                        sReturn.push("Congrats! You won $" + this.nBankerOffer + "!");
                        sReturn.push("Your case, #" + this.userCase.nNumber + " contained $" + this.userCase.nValue  + "!");
                        if (this.userCase.nValue < this.nBankerOffer) {
                            sReturn.push("Looks like you made the right choice!");
                        } else {
                            sReturn.push("Looks like you should have waited to open your own case!");
                        }
                        sReturn.push("Would you like to play again? (y/y)");
                        this.gameState = GAME_STATE.START;
                        break;

                    // y or no for a no answer
                    case "n":
                    case "no":
                        // user has declined the offer and the game continues if there are 2 or more cases remaining
                        if (this.nCasesRemaining > 1) {
                            // show the remaining case numbers
                            let remainingValuesArray = [];
                            let sCasesRemainingMessage = "Cases remaining are: ";
                            this.casesArray.forEach(element => {
                                if (!element.bOpened) {
                                    sCasesRemainingMessage += "[" + element.nNumber + "], ";
                                    remainingValuesArray.push(element.nValue);
                                }
                            });
                            sCasesRemainingMessage = sCasesRemainingMessage.substring(0, sCasesRemainingMessage.length - 1);
                            sCasesRemainingMessage += ".";

                            // show the remaining values
                            let sValuesRemainingMessage = "Values remaining are: \n";
                            remainingValuesArray.sort(function(a, b){return b-a});
                            remainingValuesArray.forEach(element => {
                                sValuesRemainingMessage += "[$" + element +"]\n";
                            });

                            // add the messages to the return array
                            sReturn.push(sValuesRemainingMessage);
                            sReturn.push(sCasesRemainingMessage);
                            sReturn.push("Time to open " + this.nCasePickingAmount + " case(s) from the lot.");
                            sReturn.push("Which case(s) would you like to open? (separate case numbers with a comma)");

                            // change the game state
                            this.gameState = GAME_STATE.USER_PICKING_CASE;
                        } else {
                            this.gameState = GAME_STATE.START;
                        }
                        break;

                    // any other input, show an error
                    default:
                        sReturn.push("Invalid answer. Please enter either y or n.");
                        break;
                }
                break;

            // user is picking a case or multiple, depending on how far the game has gone
            case GAME_STATE.USER_PICKING_CASE:
                // remove spaces from input and split the string into an array based on commas
                sInput = sInput.replace(/\s+/g, '');
                let casesChosenArray = sInput.split(',');

                // determine if the correct number of cases were chosen
                let bInputOK = (casesChosenArray.length == this.nCasePickingAmount);
                // determine if each input was a number
                casesChosenArray.forEach(element => {
                    if(isNaN(element)) {
                        bInputOK = false;
                    }
                });
                console.log(casesChosenArray);

                // ensure the input is ok so far
                if (!bInputOK) {
                    sReturn.push("Please enter " + this.nCasePickingAmount + " valid case number(s).");
                } else {
                    // check the input for invalid case numbers
                    let bCasesChosenOk = true;
                    casesChosenArray.forEach(element => {
                        let nCaseNum = Number(element);
                        if (nCaseNum < 1 || nCaseNum > CASES_AMOUNT) {
                            // alert the user if a case number is invalid
                            sReturn.push("Case #" + nCaseNum + " is invalid.");
                            bCasesChosenOk = false;
                        } else if (this.userCase.nNumber == nCaseNum) {
                            // alert the user if a case number is their own case
                            sReturn.push("You cannot open your own case (#" + nCaseNum + ") until all remaining cases are opened!");
                            bCasesChosenOk = false;
                        } else if (this.casesArray[nCaseNum - 1].bOpened) {
                            // alert the user if a case number has already been opened
                            sReturn.push("Case #" + nCaseNum + " has already been opened.");
                            bCasesChosenOk = false;
                        }
                    });

                    // ensure case numbers are ok
                    if (!bCasesChosenOk) {
                        sReturn.push("Please try again.");
                    } else {
                        // open all the cases that the user has chosen and show their values
                        casesChosenArray.forEach(element => {
                            let nCaseNum = Number(element);
                            this.casesArray[nCaseNum - 1].bOpened = true;
                            sReturn.push("Case #" + nCaseNum + " contained $" + this.casesArray[nCaseNum - 1].nValue + "!");
                        });

                        // calculate the banker's offer while determining the number of cases remaining
                        let nOffer = this.calculateOffer();

                        // determine if there are more cases unopened besides the user's case
                        if (this.nCasesRemaining == 1) {
                            // show the user's case value and end the game
                            sReturn.push("You've declined all the offers and now it's time to open your own case!");
                            sReturn.push("Your case, #" + this.userCase.nNumber + " contained $" + this.userCase.nValue + "!");
                            sReturn.push("Would you like to play again? (y/y)");
                            this.gameState = GAME_STATE.START;
                        } else {
                            // show bankers offer
                            sReturn.push("The banker is making an offer.");
                            sReturn.push("The banker has made an offer of $" + nOffer + ".");
                            sReturn.push("Would you like to take his offer? (y/n)");    
                            this.gameState = GAME_STATE.BANKER_OFFERING;
                        }

                        // lower the number of cases the user has to pick at a time until it reaches 1
                        if (this.nCasePickingAmount > 1) {
                            this.nCasePickingAmount--;
                        }                        
                    }
                }
                break;
        }
        
        // return the message after 3 seconds
        setTimeout(() => { 
            fCallback(sReturn); 
        }, 3000);
        
    }

    // FUNCTION     : calculateOffer
    // DESCRIPTION  : Calculates the bankers offer
    calculateOffer() {
        // reset variables
        let nOffer = 0;
        this.nCasesRemaining = 0;

        // iterate through all the cases and sum the values of the unopened cases
        this.casesArray.forEach(element => {
            if (!element.bOpened) {
                nOffer += element.nValue;
                this.nCasesRemaining++;
            }
        });

        // calculate the average of all unopened case values
        nOffer = nOffer / this.nCasesRemaining;

        // reduce the offer based on the number of cases remaining
        if (this.nCasesRemaining > 20 ) {
            nOffer = nOffer / 4;
        } else if (this.nCasesRemaining > 15) {
            nOffer = nOffer / 3;
        } else if (this.nCasesRemaining > 10) {
            nOffer = nOffer / 2;
        }  

        // perform final offer calculations and return value
        nOffer *= INCENTIVE;
        nOffer = Math.round((nOffer + Number.EPSILON) * 100) / 100;
        this.nBankerOffer = nOffer;
        return nOffer;
    }
}