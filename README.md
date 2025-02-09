# Mail Security Extension

A browser extension that scans Gmail messages for potentially suspicious content and displays warning banners. Compatible with both Firefox and Chrome browsers.

## Firefox Setup Instructions

1. Clone or download this repository to your local machine.

2. Open Firefox and type `about:debugging` in the address bar.

3. Click on "This Firefox" in the left sidebar.

4. Click on "Load Temporary Add-on".

5. Navigate to your extension directory and select the `manifest.json` file.

## Chrome Setup Instructions

1. Open Google Chrome and navigate to `chrome://extensions/` in the address bar.

2. Enable "Developer mode" by toggling the switch in the top right corner.

3. Click on "Load unpacked" button in the top left.

4. Navigate to your extension directory and select the folder containing the `manifest.json` file.

5. The extension should now appear in your Chrome extensions list and be ready to use.

**Note**: Make sure you have built the extension using `npm run build` before loading it in Chrome.

## Testing the Extension

1. After loading the extension, go to [Gmail](https://mail.google.com).

2. The extension will automatically scan both new and existing emails for suspicious content.

3. To test the functionality:
   - Compose a new email to yourself
   - Include suspicious phrases like "urgent action required" or "verify account immediately"
   - Send the email
   - Open the received email
   - You should see a warning banner if suspicious content is detected

## Development

- The extension uses manifest v2
- Main components:
  - `manifest.json`: Extension configuration
  - `content.js`: Email scanning logic
  - `popup/`: Contains the extension popup UI files

## File Structure

├── README.md
├── content.js
├── icons
│ ├── extension_128.png
│ ├── extension_16.png
│ ├── extension_32.png
│ └── extension_48.png
├── manifest.json
├── package.json
└── popup
├── popup.css
├── popup.html
└── popup.js

## Note

This is a development version of the extension. After making changes, you'll need to reload the extension in `about:debugging` to see the updates.
