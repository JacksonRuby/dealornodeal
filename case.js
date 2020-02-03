/*
 *  FILE        : case.js
 *  PROJECT     : PROG8110 - Project 1
 *  PROGRAMMER  : Jackson Ruby - 6726699
 *  DATE        : Feb. 9, 2020
 *  DESCRIPTION :
 *      Code for the case class.
 */

module.exports = class Case {
    constructor(_nNumber, _nValue) {
        this.nNumber = _nNumber;
        this.nValue = _nValue;
        this.bOpened = false;
    }
}