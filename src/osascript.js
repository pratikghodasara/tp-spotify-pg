'use strict';


const osascript = require('node-osascript');
const Promise = require('bluebird');
const execute = Promise.promisify(osascript.execute);
const moment = require('moment');


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

function isApplicationPlaying() {
    return execute('tell application "Spotify" to get player state as string');
}

function playCurrentTrack() {
    return execute('tell application "Spotify" to play');
}

function pauseCurrentTrack() {
    return execute('tell application "Spotify" to pause');
}

function playpauseCurrentTrack() {
    return execute('tell application "Spotify" to playpause');
}

function playNextTrack() {
    return execute('tell application "Spotify" to next track');
}

function playPreviousTrack() {
    return execute('tell application "Spotify"\n if player position is greater than 3 then\n previous track\n previous track\n else\n previous track\n end if\n end tell');
}

function getTrackTitle() {
    return execute('tell application "Spotify" to name of current track as string');
}

function getTrackAlbum() {
    return execute('tell application "Spotify" to album of current track as string');
}

function getTrackArtist() {
    return execute('tell application "Spotify" to artist of current track as string');
}

function getTrackAlbumArtist() {
    return execute('tell application "Spotify" to album artist of current track as string');
}

function getTrackDuration() {
    return execute('tell application "Spotify" to duration of current track').then((duration) => {
        return moment.duration(duration, 'milliseconds').asSeconds();
    });
}

function getTrackId() {
    return execute('tell application "Spotify" to ID of current track as string').then((id) => {
        return id.match(/(.*):(.*)/)[2];
    });
}

function getTrackArtworkUrl() {
    return execute('tell application "Spotify" to artwork url of current track as string');
}

function isApplicationShuffling() {
    return execute('tell application "Spotify" to get shuffling as string');
}

function toggleShuffle() {
    return execute('tell application "Spotify"\n if shuffling then\n set shuffling to false\n else\n set shuffling to true\n end if\n end tell');
}

function isApplicationRepeating() {
    return execute('tell application "Spotify" to get repeating as string');
}

function toggleRepeat() {
    return execute('tell application "Spotify"\n if repeating then\n set repeating to false\n else\n set repeating to true\n end if\n end tell');
}

function getApplicationVolume() {
    return execute('tell application "Spotify" to sound volume as integer');
}

function setApplicationVolume(value) {
    let newVolume = Math.max(0, Math.min(value, 100));
    return execute('tell application "Spotify" to set sound volume to newVolume', { newVolume });
}

function getTrackPosition() {
    return execute('tell application "Spotify" to player position');
}

function setTrackPosition(value) {
    return getTrackDuration().then((duration) => {
        let newPosition = parseFloat(duration) * value / 100;
        newPosition = Math.max(0, Math.min(newPosition, duration - 10));
        return execute('tell application "Spotify" to set player position to newPosition', { newPosition });
    });
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
    isApplicationPlaying,
    playCurrentTrack,
    pauseCurrentTrack,
    playpauseCurrentTrack,
    playNextTrack,
    playPreviousTrack,
    getTrackTitle,
    getTrackAlbum,
    getTrackArtist,
    getTrackAlbumArtist,
    getTrackDuration,
    getTrackId,
    getTrackArtworkUrl,
    isApplicationShuffling,
    toggleShuffle,
    isApplicationRepeating,
    toggleRepeat,
    getApplicationVolume,
    setApplicationVolume,
    getTrackPosition,
    setTrackPosition,
    quitApplication,
};
