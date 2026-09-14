# LBC Tools

Chrome/Chromium extension for Leboncoin that adds a compact price-change indicator to ads and a **Relister** control to the personal listings page.

## Install locally

1. Open `chrome://extensions` (or `edge://extensions`).
2. Enable Developer mode.
3. Choose **Load unpacked** and select this `lbc-tools` directory.

## Relisting behaviour

- **Publish now** copies the listing at the selected price, publishes it, then deletes the original only after the publish flow succeeds.
- **Modify before publishing** creates a draft, deletes the original only after draft creation succeeds, then opens the Leboncoin draft editor.

The extension needs an active Leboncoin session. Leboncoin can change its site/API contracts; errors are deliberately surfaced without deleting the source ad first.
