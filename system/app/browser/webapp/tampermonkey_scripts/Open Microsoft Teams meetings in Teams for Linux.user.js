// ==UserScript==
// @name         Open Microsoft Teams meetings in Teams for Linux
// @namespace    local
// @version      1.0
// @description  Open Teams meeting links in the Teams for Linux Flatpak
// @match        https://teams.microsoft.com/meet/*
// @match        https://teams.microsoft.com/l/meetup-join/*
// @match        https://teams.microsoft.com/light-meetings/*
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const url = new URL(window.location.href);

    const teamsUrl =
        'msteams://' +
        url.host +
        url.pathname +
        url.search +
        url.hash;

    window.location.replace(teamsUrl);
})();