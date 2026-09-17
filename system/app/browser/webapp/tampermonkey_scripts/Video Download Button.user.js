// ==UserScript==
// @name         Video Download Button
// @namespace    https://tampermonkey.net/
// @version      1.1
// @description  Adds a download button above the top-left corner of a video
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const BUTTON_ID = '__video_download_button__';

    let currentVideo = null;

    // ------------------------------------------------------------
    // Create button
    // ------------------------------------------------------------

    const button = document.createElement('a');

    button.id = BUTTON_ID;
    button.textContent = '⬇ Download';

    Object.assign(button.style, {
        position: 'fixed',
        display: 'none',
        zIndex: '2147483647',

        padding: '5px 9px',
        background: 'white',
        color: 'black',
        border: '1px solid black',
        borderRadius: '3px',

        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        lineHeight: 'normal',

        textDecoration: 'none',
        cursor: 'pointer',

        boxShadow: '0 1px 4px rgba(0,0,0,0.4)'
    });

    document.documentElement.appendChild(button);


    // ------------------------------------------------------------
    // Find visible / playing video
    // ------------------------------------------------------------

    function findVideo() {

        const videos = Array.from(
            document.querySelectorAll('video')
        );

        if (videos.length === 0)
            return null;

        // Prefer currently playing video
        let video = videos.find(v =>
            !v.paused &&
            !v.ended &&
            v.readyState >= 2 &&
            v.offsetWidth > 0 &&
            v.offsetHeight > 0
        );

        if (video)
            return video;

        // Otherwise use visible video
        video = videos.find(v => {
            const rect = v.getBoundingClientRect();

            return (
                rect.width > 0 &&
                rect.height > 0
            );
        });

        return video || null;
    }


    // ------------------------------------------------------------
    // Get video source
    // ------------------------------------------------------------

    function getVideoSource(video) {

        if (video.currentSrc)
            return video.currentSrc;

        if (video.src)
            return video.src;

        const source = video.querySelector('source');

        if (source)
            return source.src;

        return null;
    }


    // ------------------------------------------------------------
    // Position button
    // ------------------------------------------------------------

    function updateButton() {

        const video = findVideo();

        if (!video) {
            currentVideo = null;
            button.style.display = 'none';
            return;
        }

        currentVideo = video;

        const rect = video.getBoundingClientRect();

        if (
            rect.width <= 0 ||
            rect.height <= 0 ||
            rect.bottom < 0 ||
            rect.right < 0 ||
            rect.top > window.innerHeight ||
            rect.left > window.innerWidth
        ) {
            button.style.display = 'none';
            return;
        }

        const src = getVideoSource(video);

        if (!src) {
            button.style.display = 'none';
            return;
        }

        // --------------------------------------------------------
        // Put button ABOVE the video's top-left corner.
        //
        // We first make it visible so offsetHeight/Width are
        // available.
        // --------------------------------------------------------

        button.style.display = 'block';

        const buttonHeight = button.offsetHeight;
        const buttonWidth = button.offsetWidth;

        const gap = 4;

        let top = rect.top - buttonHeight - gap;
        let left = rect.left;

        // If there isn't enough room above the video,
        // put it inside the video as a fallback.
        if (top < 0) {
            top = rect.top + gap;
        }

        // Keep button horizontally inside viewport
        if (left + buttonWidth > window.innerWidth) {
            left = window.innerWidth - buttonWidth - gap;
        }

        if (left < 0) {
            left = gap;
        }

        button.style.left = `${left}px`;
        button.style.top = `${top}px`;

        // Keep the original URL, including blob: URLs
        button.href = src;
        button.download = 'zoom-recording.mp4';
    }


    // ------------------------------------------------------------
    // Button click
    // ------------------------------------------------------------

    button.addEventListener('click', function (event) {

        event.stopPropagation();

        if (!currentVideo) {
            event.preventDefault();
            return;
        }

        const src = getVideoSource(currentVideo);

        if (!src) {
            event.preventDefault();
            alert('No video source URL found.');
            return;
        }

        button.href = src;
        button.download = 'zoom-recording.mp4';

        // Do NOT preventDefault().
        // Browser handles the link normally.
    });


    // ------------------------------------------------------------
    // Scroll / resize
    // ------------------------------------------------------------

    window.addEventListener(
        'scroll',
        updateButton,
        true
    );

    window.addEventListener(
        'resize',
        updateButton
    );


    // ------------------------------------------------------------
    // Video events
    // ------------------------------------------------------------

    document.addEventListener('play', function (event) {

        if (event.target instanceof HTMLVideoElement) {
            updateButton();
        }

    }, true);


    document.addEventListener('loadedmetadata', function (event) {

        if (event.target instanceof HTMLVideoElement) {
            updateButton();
        }

    }, true);


    document.addEventListener('loadeddata', function (event) {

        if (event.target instanceof HTMLVideoElement) {
            updateButton();
        }

    }, true);


    // ------------------------------------------------------------
    // Detect dynamically-created videos
    //
    // Example:
    //
    // Page loads
    //     ↓
    // JPG placeholder
    //     ↓
    // JavaScript creates <video>
    //     ↓
    // MutationObserver detects it
    //     ↓
    // updateButton()
    // ------------------------------------------------------------

    const observer = new MutationObserver(function (mutations) {

        for (const mutation of mutations) {

            if (mutation.type !== 'childList')
                continue;

            for (const node of mutation.addedNodes) {

                if (
                    node.nodeType === Node.ELEMENT_NODE &&
                    (
                        node.tagName === 'VIDEO' ||
                        node.querySelector?.('video')
                    )
                ) {
                    updateButton();
                    return;
                }
            }
        }

    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });


    // ------------------------------------------------------------
    // ResizeObserver
    //
    // Detect changes to video dimensions without polling.
    // ------------------------------------------------------------

    const resizeObserver = new ResizeObserver(function (entries) {

        for (const entry of entries) {

            if (entry.target instanceof HTMLVideoElement) {
                updateButton();
                return;
            }
        }

    });


    // Observe videos that already exist
    document.querySelectorAll('video').forEach(video => {
        resizeObserver.observe(video);
    });


    // Also observe videos added later
    const videoObserver = new MutationObserver(function (mutations) {

        for (const mutation of mutations) {

            for (const node of mutation.addedNodes) {

                if (node.nodeType !== Node.ELEMENT_NODE)
                    continue;

                if (node.tagName === 'VIDEO') {
                    resizeObserver.observe(node);
                }

                node.querySelectorAll?.('video').forEach(video => {
                    resizeObserver.observe(video);
                });
            }
        }

    });

    videoObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
    });


    // ------------------------------------------------------------
    // Initial check
    // ------------------------------------------------------------

    updateButton();

})();



