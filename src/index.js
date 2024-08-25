#! /usr/bin/env node
'use strict';


const tpapi = require("touchportal-api");
const tpclient = new tpapi.Client();

const { open } = require("out-url");

const constants = require('./consts');
const pluginId = constants.PLUGINID;
const pluginUrl = constants.PLUGINURL;
const pluginUpdateUrl = constants.PLUGINUPDATEURL;
const pluginReleaseUrl = constants.PLUGINRELEASEURL;

let spotifyPageName = "/TPSpotifyPG.tml"
let updateAuto = "false";
let updateFrequency = constants.START_CAPTURE_WAIT_TIME;
let updateIsPlayingAuto = "false";
let updateTrackInfoAuto = "false";

const spotifyosa = require('./osascript');
let previousIsOpenState = undefined;
let previousIsVisibleState = undefined;
let previousIsPlayingState = undefined;

let currentTrackTitle = undefined;
let currentTrackAlbum = undefined;
let currentTrackArtist = undefined;
let currentTrackAlbumArtist = undefined;
let currentTrackDuration = undefined;
let currentTrackId = undefined;
let currentTrackArtworkUrl = undefined;

let updateLoop = undefined;
const settings = {
    [constants.SETTING_SPOTIFY_PAGE_NAME]: spotifyPageName,
    [constants.SETTING_AUTOMATIC_UPDATE]: updateAuto,
    [constants.SETTING_AUTOMATIC_UPDATE_FREQUENCY]: updateFrequency,
    [constants.SETTING_IS_PLAYING_AUTOMATIC_UPDATE]: updateIsPlayingAuto,
    [constants.SETTING_TRACK_INFO_AUTOMATIC_UPDATE]: updateTrackInfoAuto,
};

tpclient.on("Settings", (data) => {
    tpclient.logIt("DEBUG", "Settings: Received update from touch portal");
    data.forEach((setting) => {
        let key = Object.keys(setting)[0];
        settings[key] = setting[key];
    });

    if (updateLoop) {
        clearInterval(updateLoop);
    }

    if (spotifyPageName != settings[constants.SETTING_SPOTIFY_PAGE_NAME]) {
        spotifyPageName = settings[constants.SETTING_SPOTIFY_PAGE_NAME];
        tpclient.logIt("DEBUG", "Settings: Spotify page name is set to", spotifyPageName);
    }

    if (updateAuto != settings[constants.SETTING_AUTOMATIC_UPDATE]) {
        updateAuto = settings[constants.SETTING_AUTOMATIC_UPDATE];
        tpclient.logIt("DEBUG", "Settings: Update spotify state automatically is set to", updateAuto);
    }

    if (updateFrequency != (settings[constants.SETTING_AUTOMATIC_UPDATE_FREQUENCY])) {
        updateFrequency = (settings[constants.SETTING_AUTOMATIC_UPDATE_FREQUENCY]);
        tpclient.logIt("DEBUG", "Settings: Update spotify state frequency is set to", updateFrequency, "seconds");
    }

    if (updateIsPlayingAuto != settings[constants.SETTING_IS_PLAYING_AUTOMATIC_UPDATE]) {
        updateIsPlayingAuto = settings[constants.SETTING_IS_PLAYING_AUTOMATIC_UPDATE];
        tpclient.logIt("DEBUG", "Settings: Update is playing state automatically is set to", updateIsPlayingAuto);
    }

    if (updateTrackInfoAuto != settings[constants.SETTING_TRACK_INFO_AUTOMATIC_UPDATE]) {
        updateTrackInfoAuto = settings[constants.SETTING_TRACK_INFO_AUTOMATIC_UPDATE];
        tpclient.logIt("DEBUG", "Settings: Update track info automatically is set to", updateTrackInfoAuto);
    }

    updateSpotifyState(true);

    setTimeout(() => { startSpotifyStateUpdate() }, (constants.START_CAPTURE_WAIT_TIME * 1000));
});

tpclient.on("Action", async (data) => {
    tpclient.logIt("DEBUG", "Action: Received update from touch portal with id:", data.actionId);
    if (data.actionId === "action_spotifypg_update") {
        updateSpotifyState(true)
    }
    else if (data.actionId === "action_spotifypg_open") {
        spotifyosa.isApplicationClosed().then((isClosed) => {
            if (isClosed) {
                spotifyosa.openApplication().then(() => {
                    previousIsOpenState = "true";
                    tpclient.stateUpdate("state_spotifypg_open", "true");

                    updateSpotifyState(true);

                    if (data.data[0].id === "shouldhide") {
                        if (data.data[0].value == "On") {
                            setTimeout(() => {
                                spotifyosa.hideApplication().then(() => {
                                    previousIsVisibleState = "false";
                                    tpclient.stateUpdate("state_spotifypg_visible", "false");
                                });
                            }, (data.data[1].value * 1000));
                        }
                    }
                });
            }
        });
    }
    else if (data.actionId === "action_spotifypg_toggle_visibilty") {
        spotifyosa.isApplicationOpen().then((isOpen) => {
            if (isOpen) {
                spotifyosa.isApplicationVisible().then((isVisible) => {
                    if (isVisible) {
                        spotifyosa.hideApplication().then(() => {
                            previousIsVisibleState = "false";
                            tpclient.stateUpdate("state_spotifypg_visible", "false");
                        });
                    }
                    else {
                        spotifyosa.showApplication().then(() => {
                            previousIsVisibleState = "true";
                            tpclient.stateUpdate("state_spotifypg_visible", "true");
                        });
                    }
                });
            }
        });
    }
    else if (data.actionId === "action_spotifypg_play") {
        spotifyosa.isApplicationOpen().then((isOpen) => {
            if (isOpen) {
                spotifyosa.isApplicationPlaying().then((isPlaying) => {
                    if (isPlaying == "paused") {
                        spotifyosa.playCurrentTrack().then(() => {
                            previousIsPlayingState = "playing";
                            tpclient.stateUpdate("state_spotifypg_play", "playing");

                            getTrackInfoStates();
                        });
                    }
                });
            }
        });
    }
    else if (data.actionId === "action_spotifypg_pause") {
        spotifyosa.isApplicationOpen().then((isOpen) => {
            if (isOpen) {
                spotifyosa.isApplicationPlaying().then((isPlaying) => {
                    if (isPlaying == "playing") {
                        spotifyosa.pauseCurrentTrack().then(() => {
                            previousIsPlayingState = "paused";
                            tpclient.stateUpdate("state_spotifypg_play", "paused");

                            getTrackInfoStates();
                        });
                    }
                });
            }
        });
    }
    else if (data.actionId === "action_spotifypg_toggle_play") {
        spotifyosa.isApplicationOpen().then((isOpen) => {
            if (isOpen) {
                spotifyosa.playpauseCurrentTrack().then(() => {
                    spotifyosa.isApplicationPlaying().then((isPlaying) => {
                        previousIsPlayingState = isPlaying;
                        tpclient.stateUpdate("state_spotifypg_play", isPlaying);

                        getTrackInfoStates();
                    });
                });
            }
        });
    }
    else if (data.actionId === "action_spotifypg_next") {
        spotifyosa.isApplicationOpen().then((isOpen) => {
            if (isOpen) {
                spotifyosa.playNextTrack().then(() => {
                    getIsPlayingState(true, true);
                });
            }
        });
    }
    else if (data.actionId === "action_spotifypg_previous") {
        spotifyosa.isApplicationOpen().then((isOpen) => {
            if (isOpen) {
                spotifyosa.playPreviousTrack().then(() => {
                    getIsPlayingState(true, true);
                });
            }
        });
    }
    else if (data.actionId === "action_spotifypg_quit") {
        spotifyosa.isApplicationOpen().then((isOpen) => {
            if (isOpen) {
                spotifyosa.quitApplication().then(() => {
                    previousIsOpenState = "false";
                    tpclient.stateUpdate("state_spotifypg_open", "false");

                    sendDefaultStates();
                });
            }
        });
    }
    else {
        tpclient.logIt("DEBUG", "Action was not defined for ", data.actionId);
    }
});

tpclient.on("ConnectorChange", (data) => {
    tpclient.logIt("DEBUG", "Connector: Received update from touch portal with id:", data.connectorId);
});

tpclient.on("ListChange", (data) => {
    tpclient.logIt("DEBUG", "List Change: Received update from touch portal with id:", data.actionId);
});

tpclient.on("Info", data => {
    tpclient.logIt("DEBUG", "Info: Received update from touch portal");

    if (process.platform != "darwin") {
        tpclient.sendNotification(
            `${pluginId}_unsupported_platform_notification`,
            `${pluginId}: Unsupported Platform '${process.platform}'`,
            `\Some plugin functionality may be limited or unavailable.`,
            [
                {
                    id: `${pluginId}_unsupported_platform_notification_clicked`,
                    title: "Got to Plugin Website",
                },
            ]
        );
    }
});

tpclient.on("Broadcast", (data) => {
    tpclient.logIt("DEBUG", "Broadcast: Received update from touch portal with id:", data.event);
    if (data.event == "pageChange") {
        if (data.pageName == spotifyPageName) {
            updateSpotifyState(true);
        }
    }
});

tpclient.on("Update", (current, updated) => {
    tpclient.logIt("DEBUG", "Update: Received update notification: Current:", current, " Updated:", updated);
    tpclient.sendNotification(
        `${pluginId}_update_notification`,
        `${pluginId}: Update Available (${updated})`,
        `\nPlease update to get the latest bug fixes and new features\n\nCurrent Installed Version: ${current}`,
        [
            {
                id: `${pluginId}_update_notification_go_to_download`,
                title: "Go To Download Location",
            },
        ]
    );
});

tpclient.on("NotificationClicked", (data) => {
    tpclient.logIt("DEBUG", "Notification Clicked: Received update from touch portal");
    if (data.optionId === `${pluginId}_unsupported_platform_notification_clicked`) {
        open(pluginUrl);
    }
    else if (data.optionId === `${pluginId}_update_notification_go_to_download`) {
        open(pluginReleaseUrl);
    }
});

tpclient.on("Close", (data) => {
    tpclient.logIt("WARN", "Close: Received update from touch portal");

    if (updateLoop) {
        clearInterval(updateLoop);
    }
});

function startSpotifyStateUpdate() {
    tpclient.logIt("DEBUG", "Starting update loop with interval", updateFrequency);
    updateLoop = setInterval(() => {
        if (updateAuto == "true") {
            updateSpotifyState(false);
        }
    }, (updateFrequency * 1000));
}

function updateSpotifyState(shouldForceUpdate) {
    spotifyosa.isApplicationOpen().then((isOpen) => {
        if (previousIsOpenState != isOpen.toString()) {
            previousIsOpenState = isOpen.toString();
            tpclient.stateUpdate("state_spotifypg_open", isOpen.toString());

            if (!isOpen) {
                sendDefaultStates();
            }
        }

        if (isOpen) {
            getIsVisibleState();
            getIsPlayingState(shouldForceUpdate);
        }
    });
}

function getIsVisibleState() {
    spotifyosa.isApplicationVisible().then((isVisible) => {
        if (previousIsVisibleState != isVisible) {
            previousIsVisibleState = isVisible;
            tpclient.stateUpdate("state_spotifypg_visible", isVisible.toString());
        }
    });
}

function getIsPlayingState(shouldForceUpdate, shouldUpdateTrackInfoStates) {
    if (updateIsPlayingAuto == "true" || shouldForceUpdate) {
        spotifyosa.isApplicationPlaying().then((isPlaying) => {
            if (previousIsPlayingState != isPlaying) {
                previousIsPlayingState = isPlaying;
                tpclient.stateUpdate("state_spotifypg_play", isPlaying);
            }

            if (shouldUpdateTrackInfoStates) {
                getTrackInfoStates();
            }
        });
    }
}

function getTrackInfoStates() {
    spotifyosa.getTrackTitle().then((result) => {
        currentTrackTitle = result;
        if (currentTrackTitle != "" && previousIsPlayingState == "playing") {
            spotifyosa.getTrackAlbum().then((result) => {
                currentTrackAlbum = result;

                spotifyosa.getTrackArtist().then((result) => {
                    currentTrackArtist = result;

                    spotifyosa.getTrackAlbumArtist().then((result) => {
                        currentTrackAlbumArtist = result;

                        spotifyosa.getTrackDuration().then((result) => {
                            currentTrackDuration = result;

                            spotifyosa.getTrackId().then((result) => {
                                currentTrackId = result;

                                spotifyosa.getTrackArtworkUrl().then((result) => {
                                    currentTrackArtworkUrl = result;

                                    sendTrackInfoStates(currentTrackTitle, currentTrackAlbum, currentTrackArtist, currentTrackAlbumArtist, currentTrackDuration, currentTrackId, currentTrackArtworkUrl);
                                });
                            });
                        });
                    });
                });
            });
        }
        else if (currentTrackTitle == "Advertisement") {
            sendTrackInfoStates("Advertisement", "", "", "", "", "", "");
        }
        else {
            sendTrackInfoStates("", "", "", "", "", "", "");
        }
    });
}

function sendTrackInfoStates(trackTitle, trackAlbum, trackArtist, trackAlbumArtist, trackDuration, trackId, trackArtworkUrl) {
    let states = [
        { id: 'state_spotifypg_track_title', value: trackTitle },
        { id: 'state_spotifypg_track_album', value: trackAlbum },
        { id: 'state_spotifypg_track_artist', value: trackArtist },
        { id: 'state_spotifypg_track_album_artist', value: trackAlbumArtist },
        { id: 'state_spotifypg_track_duration', value: trackDuration },
        { id: 'state_spotifypg_track_id', value: trackId },
        { id: 'state_spotifypg_track_artwork', value: trackArtworkUrl },
    ];
    tpclient.stateUpdateMany(states);
}

function sendDefaultStates() {
    let states = [
        { id: "state_spotifypg_visible", value: "false" },
        { id: "state_spotifypg_play", value: "paused" },
    ];
    tpclient.stateUpdateMany(states);
}

tpclient.connect({ pluginId: pluginId, updateUrl: pluginUpdateUrl });
