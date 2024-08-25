<h1 align="center">
  <br>
  TPSpotifyPG
  <br>
</h1>

<h4 align="center"><i><a href="https://www.touch-portal.com" target="_blank">Touch Portal</a> plugin to interact with Spotify.</i></h4>

<p align="center">
  <a>
    <img src="https://img.shields.io/badge/OS-macOS-blue?style=for-the-badge"
         alt="Platforms">
  </a>
  <a href="#license">
    <img src="https://img.shields.io/github/license/pratikghodasara/tp-spotify-pg?style=for-the-badge"
         alt="License">
  </a>
  <a href="https://github.com/pratikghodasara/tp-spotify-pg/releases">
    <img src="https://img.shields.io/github/v/release/pratikghodasara/tp-spotify-pg?include_prereleases&sort=semver&style=for-the-badge"
         alt="Release">
  </a>
  <a href="https://github.com/pratikghodasara/tp-spotify-pg/releases">
    <img src="https://img.shields.io/github/release-date-pre/pratikghodasara/tp-spotify-pg?style=for-the-badge"
         alt="Release Date">
  </a>
  <a href="https://github.com/pratikghodasara/tp-spotify-pg/commits/master/">
    <img src="https://img.shields.io/github/commits-since/pratikghodasara/tp-spotify-pg/latest?include_prereleases&style=for-the-badge&label=Commits%20Since%20Release"
         alt="Commits Since Release">
  </a>
</p>

<p align="center">
  <a href="#description">Description</a> •
  <a href="#changelog">Changelog</a> •
  <a href="#plugin-features">Plugin Features</a> •
  <a href="#sample-page">Sample Page</a> •
  <a href="#dependencies">Dependencies</a> •
  <a href="#author">Author</a> •
  <a href="#license">License</a> •
  <a href="#code-of-conduct">Code of Conduct</a>
</p>

## Description

Control Spotify directly from Touch Portal with minimum configuration<br>
Open, hide or show and close application<br>
Play or pause current track<br>
Get current track title, album, artist, artwork, duration and other information<br>
Play next or previous track<br>
Toggle shuffle or repeat<br>
Mute, unmute or change volume<br>
Replay current and set track position<br>

## Changelog

Refer to [Changelog](CHANGELOG.md) for details.

## Plugin Features

### Settings
 - Spotify Page Name - Name of the Spotify Page that will trigger forced state update.
 - Update Spotify State Automatically - Set value to 'true' for the plugin to get state updates from Spotify automatically.
 - Automatic Spotify State Update Frequency - Set the duration (in seconds) of how fequently the plugin will get state updates from Spotify.

### Actions
  - Update Spotify State

## Sample Page

Refer to [Sample Page](resources/tpspotifyas.tpz2) that imports directly into [Touch Portal](https://www.touch-portal.com) and show how to use all the features of the plugin.

## Dependencies

- Project:
  - [out-url](https://www.npmjs.com/package/out-url)
  - [touchportal-api](https://www.npmjs.com/package/touchportal-api)

## Author

- [Pratik Ghodasara](https://github.com/pratikghodasara)

## License

This project is licensed under the GPL 3.0 License - see the [LICENSE](LICENSE) file for details

## Code of Conduct

[Code of Conduct](CODE_OF_CONDUCT.md) is adapted from the [Contributor Covenant](https://www.contributor-covenant.org)'s, [Code-of-Conduct](https://www.contributor-covenant.org/version/1/4/code-of-conduct.html), version 1.4.

For answers to common questions about this code of conduct, see [faq](https://www.contributor-covenant.org/faq).
