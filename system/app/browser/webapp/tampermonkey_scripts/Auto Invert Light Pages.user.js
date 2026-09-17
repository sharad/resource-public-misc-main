// ==UserScript==
// @name         Auto Invert Light Pages
// @namespace    auto-invert-light-pages
// @version      1.0
// @description  Automatically invert predominantly light pages.
// @match        *://*/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

    const STYLE_ID = '__auto_invert_light_page__';

    // How much of the sampled page must be light
    // before inversion is enabled.
    const LIGHT_THRESHOLD = 0.60;

    // A color is considered "light" above this luminance.
    const LUMINANCE_THRESHOLD = 200;

    // Number of points sampled across the visible page.
    const SAMPLE_COUNT = 100;

    function getLuminance(r, g, b) {
        return (
            0.2126 * r +
            0.7152 * g +
            0.0722 * b
        );
    }

    function getPixelColor(x, y) {
        /*
         * JavaScript cannot directly read arbitrary rendered
         * page pixels because of browser security restrictions.
         *
         * Instead, walk up the DOM and find the effective
         * background color at the sampled point.
         */

        let element = document.elementFromPoint(x, y);

        while (element) {
            const style = getComputedStyle(element);
            const bg = style.backgroundColor;

            if (bg && bg !== 'transparent' && !bg.includes('rgba(0, 0, 0, 0)')) {
                const match = bg.match(
                    /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/
                );

                if (match) {
                    return [
                        Number(match[1]),
                        Number(match[2]),
                        Number(match[3])
                    ];
                }
            }

            element = element.parentElement;
        }

        // Browser default page background.
        return [255, 255, 255];
    }

    function calculateLightRatio() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        let light = 0;
        let total = 0;

        /*
         * Sample the visible viewport rather than the whole DOM.
         * This is much closer to what the user actually sees.
         */
        const grid = Math.ceil(Math.sqrt(SAMPLE_COUNT));

        for (let row = 0; row < grid; row++) {
            for (let col = 0; col < grid; col++) {
                if (total >= SAMPLE_COUNT)
                    break;

                const x = Math.floor(
                    (col + 0.5) * width / grid
                );

                const y = Math.floor(
                    (row + 0.5) * height / grid
                );

                const [r, g, b] = getPixelColor(x, y);

                const luminance = getLuminance(r, g, b);

                if (luminance >= LUMINANCE_THRESHOLD)
                    light++;

                total++;
            }
        }

        return total ? light / total : 1;
    }

    function setInverted(enabled) {
        let style = document.getElementById(STYLE_ID);

        if (enabled) {
            if (style)
                return;

            style = document.createElement('style');
            style.id = STYLE_ID;

            /*
             * This intentionally mirrors FireFoxInvertColors.
             *
             * Its style.css is:
             *
             * html {
             *     background-color: black;
             * }
             *
             * body {
             *     filter: invert(100%);
             *     background-color: white;
             *     color: black;
             * }
             */

            style.textContent = `
                html {
                    background-color: black !important;
                }

                body {
                    filter: invert(100%) !important;
                    background-color: white !important;
                    color: black !important;
                }
            `;

            document.documentElement.appendChild(style);
        } else {
            style?.remove();
        }
    }

    let lastState = null;

    function checkPage() {
        const ratio = calculateLightRatio();

        const shouldInvert = ratio >= LIGHT_THRESHOLD;

        if (shouldInvert !== lastState) {
            lastState = shouldInvert;
            setInverted(shouldInvert);

            console.debug(
                `[Auto Invert] light=${(ratio * 100).toFixed(1)}%`,
                `invert=${shouldInvert}`
            );
        }
    }

    // Initial check.
    setTimeout(checkPage, 1000);

    /*
     * Many modern sites construct their UI after page load.
     * Recheck when the DOM changes, but debounce it.
     */
    let timer = null;

    const observer = new MutationObserver(() => {
        clearTimeout(timer);

        timer = setTimeout(() => {
            checkPage();
        }, 1000);
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    /*
     * Also check after resizing because the visible portion
     * of the page may have changed.
     */
    window.addEventListener('resize', () => {
        clearTimeout(timer);

        timer = setTimeout(() => {
            checkPage();
        }, 500);
    });
})();
