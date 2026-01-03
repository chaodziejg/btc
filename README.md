
# teen-chat.org QOL Userscript

A **quality‑of‑life userscript** for TeenChat that modernizes the UI, restores legacy features, and adds powerful safety and usability improvements that the official platform lacks.

This script is focused on **better UX, customization, and user safety**, while staying lightweight and optional.

## Features

### Main Features

* **Completely revamped login & registration page**
* **Advanced chat filter**
* **New loading spinners**
* **Fully revamped settings menu**
* **Fully customizable experience**
* **Improved UI across the site**
* **Extended chat & DM history**
* **Server‑side filter bypass (selective)**

---

### Current Features

* **Completely revamped login & registration page**
    * Cleaner layout
    * More modern and user‑friendly design

* **Restores the classic DM layout (pre-Codychat 9.0)**
    * Your messages on the left
    * Other user’s messages on the right
    * Much easier to read and follow conversations

* **Advanced chat filter**
    * Filters inappropriate messages
    * Detects grooming‑related messages
    * Blocks harmful or disturbing content
    * Added because moderation alone isn’t enough

* **Restores legacy icons (pre‑ Codychat 9.0)**
    * Brings back the classic look

* **Disables profile music autoplay**
    * Music will no longer start playing automatically when viewing profiles

* **New loading spinners**
    * Faster‑feeling
    * Cleaner
    * Way better looking than the default ones

---

## Planned Features

* **Fully revamped settings menu**
    * Toggle new vs old look
    * Configure the chat filter
        * Custom rules
        * Editable rule lists
        * Toggle per chat type (DMs / main chat)
        * Much more customization
    * Toggle userscript features
    * And much more!

* **Fully customizable experience**
    * UI tweaks
    * Behavior settings
    * Personal preferences

* **Improved UI across the site**
    * Cleaner
    * More consistent
    * Easier on the eyes

* **DM chat filtering**
    * Optional spam inbox
    * Better protection in private messages

* **Extended chat & DM history**
    * See more past messages than the default limit

* **Local message saving**
    * Chat messages stored in local storage
    * No server dependency

* **Server‑side filter bypass**
    * Only for cases where filters block harmless content
    * Examples: common words, strings like `str`, `xyz`, etc.
    * Never intended to bypass safety‑critical moderation

* **Automated moderation protection**
    * Prevents accidental kicks, mutes, or bans triggered by rapid message sending (e.g., splitting a message into multiple lines)
    * Detects genuine message activity versus spam and warns before any automated penalty
    * Does not bypass intentional moderation-issued bans, kicks, or mutes


---

## Disclaimer
* I **do not take responsibility** for how this script is used.
* Using userscripts is **always at your own risk**.
* While it is **very unlikely**, there is a **small chance** you could be warned or banned by the platform.
* This script is meant to **improve user experience and safety**, not to abuse or exploit the service.

---

## Installation

1. **Install a userscript manager**:

    * **Tampermonkey** (recommended)
    * Violentmonkey or Greasemonkey also work

2. **Download the script**:

    * Click the `main.user.js` file in this repository
    * Press **Raw**
    * Your userscript manager should prompt you to install

3. **Visit teen-chat.org and refresh the page.** The script will automatically activate.

---

## Notes

* This project is actively evolving.
* Feedback, suggestions, and feature requests are welcome. You can submit them via the **GitHub issues page** or by **DMing ``C418`` on TeenChat**.
* The script is designed to be **modular**, so most features will be optional and toggleable.
