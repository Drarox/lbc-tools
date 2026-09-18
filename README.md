<div align="center">
  <h1>LBC Tools</h1>
  <p><strong>A practical companion for Leboncoin.</strong><br>Spot price changes, understand listing age, and relist your own ads in a few clicks.</p>

  [![Chrome Web Store](https://img.shields.io/badge/Chrome-Install-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/lbc-tools)
  [![Firefox Add-ons](https://img.shields.io/badge/Firefox-Install-FF7139?style=for-the-badge&logo=firefox&logoColor=white)](https://addons.mozilla.org/addon/lbc-tools)
  [![GitHub](https://img.shields.io/badge/GitHub-Source-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Drarox/lbc-tools)
</div>

## About

Leboncoin displays the current price, but not the context behind it. LBC Tools adds price history and allows you to relist your ads in a few clicks.

- **See price changes at a glance**: the previous price, absolute change, and percentage are displayed beside the existing price.
- **Read the history of a listing**: publication and renewal dates include a day count and color-coded age.
- **Relist without re-entering everything**: publish a replacement ad directly or open an editable draft first.

## Preview

<table>
  <tr>
    <td width="50%" align="center">
      <img src="previews/oldprice.png" alt="Previous price and price difference displayed on a Leboncoin ad" width="100%"><br>
      <sub><b>Previous price, amount, and percentage change</b></sub>
    </td>
    <td width="50%" align="center">
      <img src="previews/relistbutton.png" alt="Relister button on a personal Leboncoin listing" width="100%"><br>
      <sub><b>One-click relisting</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="previews/relistpopup.png" alt="Relisting dialog with direct publish and edit options" width="90%"><br>
      <sub><b>Relisting popup</b></sub>
    </td>
    <td align="center">
      <img src="previews/popup.png" alt="LBC Tools extension settings popup" width="65%"><br>
      <sub><b>Simple settings</b></sub>
    </td>
  </tr>
</table>

## Installation

### Chrome Web Store (Chrome, Edge, Brave, Opera, etc.)

[![Chrome Web Store](https://img.shields.io/badge/Install%20from-Chrome%20Web%20Store-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/lbc-tools)

### Firefox Add-ons

[![Firefox Add-ons](https://img.shields.io/badge/Install%20from-Firefox%20Add--ons-FF7139?style=for-the-badge&logo=firefox&logoColor=white)](https://addons.mozilla.org/addon/lbc-tools/)

### Manual Installation (Developer Mode)

1. **Download**: Clone or download this repository

   ```bash
   git clone https://github.com/Drarox/lbc-tools.git
   ```

2. **Chromium-based browsers**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension folder

3. **Firefox**:
   - Open `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file

## Privacy and safety

LBC Tools only runs on `leboncoin.fr` and uses Leboncoin’s own authenticated session to perform the actions you explicitly request. It does not send your data to a third-party service.

Relisting uses Leboncoin’s web APIs, which can change without notice. Always review an editable draft before publishing and make sure the selected price is correct.

## Contributing

Ideas, bug reports, and pull requests are welcome. Please open an issue first for significant changes so the implementation can be discussed.

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This extension is independent and not affiliated with or endorsed by Leboncoin. Use it at your own risk and always comply with Leboncoin’s Terms of Service.
