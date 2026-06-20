# 🖥️ Fabula Engine — Desktop Export (Tauri)

Turn any game you make in Fabula Engine into a real native desktop app — a Windows
`.exe`/`.msi` (or `.dmg` on macOS, `.AppImage` on Linux) that Steam can launch.

This folder is a ready-to-build [Tauri v2](https://tauri.app) wrapper. It bundles your
exported game into a tiny (~3–6 MB) native binary that runs in its own window with no
browser required.

## One-time setup

1. **Install Rust** → https://rustup.rs (Tauri needs the Rust toolchain).
2. On Windows, install **Microsoft C++ Build Tools** and **WebView2** (preinstalled on
   Windows 10/11). On Linux, install `webkit2gtk` and friends (see Tauri prerequisites).
3. From this `desktop/` folder:
   ```bash
   npm install
   ```

## Build your game into an .exe

1. In Fabula Engine, open your project and click **⬇ Export**.
2. Save/rename the downloaded file to **`desktop/dist/index.html`** (overwrite the
   placeholder that's there).
3. (Optional) Drop a square PNG named `app-icon.png` in this folder and run
   `npm run icons` to generate all platform icons into `src-tauri/icons/`.
   *(Tauri ships default icons, so you can skip this for a first test build.)*
4. Edit `src-tauri/tauri.conf.json` → set `productName`, `version` and `identifier`
   (e.g. `com.yourstudio.yourgame`) to your real values.
5. Build:
   ```bash
   npm run build
   ```
6. Find your installer / executable in
   `src-tauri/target/release/bundle/` (e.g. `nsis/…-setup.exe`, `msi/…-x64.msi`).
   The raw binary is at `src-tauri/target/release/fabula-game.exe`.

## Test it live (hot window) before bundling

```bash
npm run dev
```

## Ship to Steam

- Steam launches your `.exe` (or the unpacked binary) directly — point the Steamworks
  app's launch options at it.
- Use **SteamPipe** to upload the `target/release/` build as a depot.
- Complete the store page, content/age-rating survey, and payee/tax info first — see the
  **Ship It** tab inside Fabula Engine for the full checklist.

> Note: icons and `identifier` must be set before you can publish; a default-icon build is
> fine for local testing.
