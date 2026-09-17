// ==UserScript==
// @name         Auto-Trigger & Submit YouTube AI Chat (Enter Fix)
// @namespace    http://tampermonkey.net
// @version      1.6
// @description  Types the fixed question and safely triggers submission via Enter key simulation to prevent homepage redirect loops.
// @author       You
// @match        https://www.youtube.com/watch*
// @icon         https://google.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // CONFIGURATION: Set your custom question here
    const MY_FIXED_QUESTION = `Analyze this video and explain what it is actually saying and trying to achieve.

IMPORTANT OUTPUT RULES:
- Write the FINAL ANSWER in the user's specified language. The user's specified language is Hindi unless another language is explicitly requested.
- Keep this instruction itself in English.
- Understand the video; do not merely translate or repeat the transcript.
- Be critical but fair.
- Do not invent statistics, timestamps, claims, or information that cannot reasonably be determined from the available video/transcript.
- The answer MUST contain EXACTLY 4 sections.
- Each section MUST have a clearly visible Markdown heading using ##.
- Do NOT use bullet points for Sections 1 and 2 unless absolutely necessary.
- Sections 1 and 2 must be highly compact and information-dense.
- Use inline text separated by " | " or compact tables for Sections 1 and 2.
- Avoid excessive blank lines.
- Do not repeat the same information across sections.
- The four sections must progressively increase in detail:
  Section 1 = extremely terse
  Section 2 = compact but explanatory
  Section 3 = descriptive analysis
  Section 4 = detailed content explanation

FIRST, classify the video using creative, meaningful categories. Invent category names when useful rather than using only conventional categories.

Examples:
“Clickbait-जाल”, “ज्ञान-सघन”, “Subscribe-प्रधान”, “धीरे खुलने वाली जानकारी”, “कम-सामग्री–लंबा-प्रस्तुतीकरण”, “सूची-आधारित”, “कहानी के बहाने ज्ञान”, “विचार/दर्शन”, “मनोरंजन-प्रधान”, etc.

A video may have multiple classifications.

## 1. QUICK VERDICT

Make this section extremely compact.

Give the information as a single compact block, NOT as a bullet list.

Include:
Duration | Classification | Theme | Watch/Partial Watch/Skip | Best starting point | Must-see information | Major warning

Use very short phrases. The purpose is that I should be able to understand the video's value and decide whether to watch it by looking at this section alone.

## 2. STATS & CONTENT PROFILE

Keep this section compact but slightly more explanatory than Section 1.

Prefer a compact table or tightly packed paragraphs rather than bullet points.

Include, when available or reasonably calculable:
- Duration
- Approximate word count
- Approximate sentence count
- Speech/content density
- Main topics
- Video type/theme
- Useful-content density
- Repetition/promotion/storytelling proportion
- Whether the video's length appears justified
- Major structural characteristics

Do not waste space explaining obvious statistics. Add explanation only where it provides useful insight.

## 3. PRESENTER INTENTION & VIDEO STRATEGY

Now provide a more descriptive analysis.

Explain what the presenter is trying to accomplish, not merely what they say.

Analyze:
- Primary intention: informing, teaching, entertaining, persuading, promoting, selling, gaining subscribers, increasing engagement, or prolonging viewing
- Whether title/thumbnail matches the actual content
- Clickbait or misleading elements
- Whether promised/useful information is deliberately delayed
- Whether important information appears only near the end
- Excessive subscribe/join/like/comment/buy/donate requests
- Repetition, suspense, storytelling, padding, digression, or other time-wasting
- Whether the presenter appears to intentionally prolong the video
- Whether the presentation creates an impression of more information than is actually provided
- Whether the actual content justifies the video's length
- Any other notable persuasion, engagement, or presentation techniques

Clearly distinguish between:
1. What the presenter claims or communicates
2. What can reasonably be inferred about the presenter's intention
3. Your assessment of the video's value/effectiveness

## 4. ACTUAL VIDEO CONTENT & DETAILED EXPLANATION

This is the longest and most detailed section.

Write the MAIN POINTS with their JUSTIFYING LOGIC, and explain WHAT EXACTLY THE PRESENTER WANTED TO SAY.

Do not merely summarize individual sentences. Synthesize the actual meaning, reasoning, arguments, examples, conclusions, and flow of the video.

Explain:
- The central message
- Main arguments and their reasoning
- Important supporting points
- Examples and demonstrations
- Conclusions
- What the presenter ultimately wants the viewer to understand, believe, remember, or do
- The overall flow of the video

If the video contains list-based or structured information, extract it properly and completely, including:
quotes, suggestions, places, steps, rules, recommendations, tips, names, examples, lessons, advantages/disadvantages, or other enumerated information.

Preserve the original meaning and important details.

The final section should allow me to understand the substance of the video without necessarily watching the entire video.

OVERALL PRINCIPLE:

Maximize useful information per screen area.

The output should visually progress like this:

## 1. QUICK VERDICT
[very compact information-dense block]

## 2. STATS & CONTENT PROFILE
[compact statistics + concise interpretation]

## 3. PRESENTER INTENTION & VIDEO STRATEGY
[descriptive analysis]

## 4. ACTUAL VIDEO CONTENT & DETAILED EXPLANATION
[detailed explanation]

Do NOT turn every individual item into a separate bullet point or paragraph when a compact sentence, table, or inline structure can communicate it more efficiently.`;

    let questionSubmitted = false;
    let lastTrackedUrl = window.location.href;

    // Monitor URL state changes for single-page applications
    setInterval(() => {
        if (window.location.href !== lastTrackedUrl) {
            lastTrackedUrl = window.location.href;
            questionSubmitted = false;
            console.log('[UserScript] New video page layout loaded. Workflow clean slate active.');
        }
    }, 1000);

    function runEngine() {
        // Target using your exact DevTools textarea class name
        const textarea = document.querySelector('textarea.chatInputViewModelChatInput');
        const isPanelOpen = textarea !== null;

        // STEP 1: Click the opening button if the panel textarea does not exist yet
        if (!isPanelOpen) {
            const innerDesc = document.querySelector('#description-inner') || document.querySelector('ytd-watch-metadata');
            if (innerDesc) {
                const clickableTargets = innerDesc.querySelectorAll('button, ytd-button-renderer, tp-yt-paper-button');
                for (let target of clickableTargets) {
                    const cleanText = target.textContent ? target.textContent.trim().toLowerCase() : '';

                    if (cleanText.includes('ask questions') || cleanText.includes('ask about video')) {
                        console.log('[UserScript] Box not found. Directing click sequence to trigger target...');
                        target.click();
                        return; // Break execution frame to let the click load the box layout
                    }
                }
            }
        }

        // STEP 2: Handle text input injection and simulate Enter key press
        if (isPanelOpen && !questionSubmitted) {
            if (textarea) {
                console.log('[UserScript] Textarea located. Simulating text entry and keypress dispatch...');

                // Track execution state immediately to prevent multi-firing loops
                questionSubmitted = true;

                // Focus element and assign value
                textarea.focus();
                textarea.value = MY_FIXED_QUESTION;

                // Alert the framework's reactive data tracking that text exists
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                textarea.dispatchEvent(new Event('change', { bubbles: true }));

                // Provide a brief window for YouTube's underlying listeners to parse the new value
                setTimeout(() => {
                    console.log('[UserScript] Dispatching keyboard Enter event...');

                    // Construct an authentic Enter keydown event configuration
                    const enterKeyDown = new KeyboardEvent('keydown', {
                        bubbles: true,
                        cancelable: true,
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        which: 13
                    });

                    const enterKeyUp = new KeyboardEvent('keyup', {
                        bubbles: true,
                        cancelable: true,
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        which: 13
                    });

                    // Fire the events directly into the textarea structure
                    textarea.dispatchEvent(enterKeyDown);
                    textarea.dispatchEvent(enterKeyUp);

                    console.log('[UserScript] Automation sequence complete. Prompt dispatched natively!');
                }, 300);
            }
        }
    }

    // Continuously monitor modifications to structural element trees
    const globalObserver = new MutationObserver(() => {
        if (window.location.href.includes('/watch')) {
            runEngine();
        }
    });

    globalObserver.observe(document.body, { childList: true, subtree: true });
})();

