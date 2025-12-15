# Sprite Setup for Offline Mode

This app is designed to work fully offline with local Pokemon sprites.

## Quick Setup

1. **Extract the sprites.zip file**:
   - The `public/sprites.zip` file contains all Pokemon sprites (1-809)
   - Extract it to `public/sprites/` folder
   - After extraction, you should have files like `public/sprites/1.png`, `public/sprites/2.png`, etc.

### Windows:
```batch
cd public
tar -xf sprites.zip
```

Or use the built-in Windows extractor:
- Right-click `sprites.zip`
- Select "Extract All..."
- Extract to the `sprites` folder

### Mac/Linux:
```bash
cd public
unzip sprites.zip -d sprites/
```

## Automated Build (Windows)

Run `build-android.bat` - it will automatically:
1. Extract sprites if not already extracted
2. Build the production app
3. Set up Capacitor for Android
4. Sync all assets to the Android project

## Manual Build Steps

1. Extract sprites as described above
2. Run `npm install`
3. Run `npm run build`
4. Run `npx cap sync android`
5. Open in Android Studio: `npx cap open android`

## Sprite Fallback

If local sprites are not found, the app will fallback to loading from the PokeAPI servers online. For full offline functionality, ensure sprites are properly extracted.

## File Structure

```
public/
├── sprites/
│   ├── 1.png      (Bulbasaur)
│   ├── 2.png      (Ivysaur)
│   ├── ...
│   └── 809.png    (Melmetal)
├── backgrounds/
│   ├── pixel-forest.png
│   ├── pixel-meadow.png
│   └── ...
├── icon-192.png
├── icon-512.png
└── sprites.zip    (source archive)
```
