'use strict';


const osascript = require('node-osascript');
const Promise = require('bluebird');
const execute = Promise.promisify(osascript.execute);


function isApplicationOpen() {
    return execute('tell application "System Events" to (name of processes) contains "Spotify"');
}

function isApplicationClosed() {
    return execute('tell application "System Events" to (name of processes) does not contain "Spotify"');
}

function openApplication() {
    return execute('tell application "Spotify" to activate');
}

function isApplicationVisible() {
    return execute('tell application "System Events"\n get visible of application process "Spotify"\n end tell');
}

function hideApplication() {
    return execute('tell application "System Events"\n set visible of application process "Spotify" to false\n end tell');
}

function showApplication() {
    return execute('tell application "System Events"\n set visible of application process "Spotify" to true\n end tell');
}

function quitApplication() {
    return execute('tell application "Spotify" to quit');
}

module.exports = {
    isApplicationOpen,
    isApplicationClosed,
    openApplication,
    isApplicationVisible,
    hideApplication,
    showApplication,
    quitApplication,
};
