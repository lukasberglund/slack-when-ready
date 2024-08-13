// ==UserScript==
// @name         Enhanced Slack Sidebar Toggle (In-Line, Hide by Default, Auto-Hide)
// @namespace    http://tampermonkey.net/
// @version      0.8
// @description  Toggle badges, bold text, and banners in Slack sidebar with improved performance, in-line toggle, hidden by default, and auto-hide after 10 minutes
// @match        https://app.slack.com/client*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let toggleState = true; // Start with elements hidden
    let autoHideTimer = null;

    // Create and inject CSS
    const style = document.createElement('style');
    style.textContent = `
        .sidebar-toggle {
            background-color: transparent;
            color: var(--sk_primary_foreground);
            border: none;
            padding: 0 8px;
            font-size: 13px;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.3s;
        }
        .sidebar-toggle:hover {
            opacity: 1;
        }
        .sidebar-toggle.active {
            color: var(--sk_highlight);
        }
    `;
    document.head.appendChild(style);

    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.textContent = '👁️‍🗨️'; // Default icon (hidden state)
    toggleButton.title = 'Toggle Sidebar Elements';
    toggleButton.className = 'sidebar-toggle active'; // Start with active class

    // Add toggle functionality
    toggleButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleState = !toggleState;
        this.classList.toggle('active');
        updateSidebar();
        updateButtonIcon();
        setAutoHideTimer();
    });

    // Function to update button icon
    function updateButtonIcon() {
        toggleButton.textContent = toggleState ? '👁️‍🗨️' : '👁️';
    }

    // Function to set auto-hide timer
    function setAutoHideTimer() {
        if (autoHideTimer) {
            clearTimeout(autoHideTimer);
        }
        if (!toggleState) {
            autoHideTimer = setTimeout(() => {
                toggleState = true;
                toggleButton.classList.add('active');
                updateSidebar();
                updateButtonIcon();
            }, 10 * 60 * 1000); // 10 minutes
        }
    }

    // Function to insert the button
    function insertButton() {
        const targetDiv = document.querySelector('.p-channel_sidebar__section_heading_label');
        if (targetDiv && !targetDiv.querySelector('.sidebar-toggle')) {
            targetDiv.appendChild(toggleButton);
        }
    }

    // Create a style element for dynamic styles
    const dynamicStyle = document.createElement('style');
    document.head.appendChild(dynamicStyle);

    function updateSidebar() {
        const css = toggleState ? `
            .p-channel_sidebar__badge { display: none !important; }
            .p-channel_sidebar__name span { font-weight: normal !important; }
            .c-button-unstyled.p-channel_sidebar__banner.p-channel_sidebar__banner--mentions.p-channel_sidebar__banner--bottom { display: none !important; }
            /* Target notification channels */
            .p-channel_sidebar__channel--unread .p-channel_sidebar__name,
            .p-channel_sidebar__link--unread .p-channel_sidebar__name,
            .p-channel_sidebar__link--unread:not(.p-channel_sidebar__link--selected) .p-channel_sidebar__name,
            .p-channel_sidebar__link--unread:not(.p-channel_sidebar__link--selected):hover .p-channel_sidebar__name {
                font-weight: normal !important;
                color: inherit !important;
            }
        ` : '';
        dynamicStyle.textContent = css;
    }

    // Initial update and button insertion
    updateSidebar();
    insertButton();
    updateButtonIcon(); // Set initial icon

    // Set up a more efficient observer
    const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        let shouldInsertButton = false;
        for (let mutation of mutations) {
            if (mutation.type === 'childList') {
                if (mutation.addedNodes.length > 0) {
                    shouldUpdate = true;
                }
                shouldInsertButton = true;
            }
        }
        if (shouldUpdate) {
            updateSidebar();
        }
        if (shouldInsertButton) {
            insertButton();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
