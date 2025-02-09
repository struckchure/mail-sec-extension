# Chrome Setup Instructions

1. Open Google Chrome and navigate to `chrome://extensions/` in the address bar.

2. Enable "Developer mode" by toggling the switch in the top right corner.

3. Click on "Load unpacked" button in the top left.

4. Navigate to your extension directory and select the folder containing the `manifest.json` file.

5. The extension should now appear in your Chrome extensions list and be ready to use.

## Note

- The extension is now compatible with both Firefox and Chrome browsers.
- Make sure you have built the extension using `npm run build` before loading it in Chrome.
- You can access the extension by clicking its icon in the Chrome toolbar when visiting Gmail.
- To update the extension during development, click the refresh icon on the extension card in `chrome://extensions/`.
