# Quick Start Guide

Get your "2 Truths and 1 Lie" Miro game running in 5 minutes!

## Step 1: Create Your Miro App (2 minutes)

1. Visit: https://miro.com/app/settings/user-profile/apps
2. Click "Create new app"
3. Fill in:
   - App Name: `2 Truths and 1 Lie`
   - Description: `Collaborative game for Miro boards`
4. Click "Create"
5. In the app settings:
   - Set **Redirect URI**: `http://localhost:3000`
   - Enable permissions: `boards:read` and `boards:write`
   - Copy your **App ID** and **Client Secret**

## Step 2: Configure Your App (30 seconds)

1. Open `.appconfig` in the project folder
2. Replace the placeholder values:
   ```
   appId=YOUR_ACTUAL_APP_ID
   clientSecret=YOUR_ACTUAL_CLIENT_SECRET
   redirectUrl=http://localhost:3000
   ```

## Step 3: Start the App (1 minute)

```bash
npm start
```

The app will open at http://localhost:3000

## Step 4: Install in Miro (1 minute)

1. Go back to your Miro app settings
2. Click "Install app and get OAuth token"
3. Select a board to test on
4. Grant permissions

## Step 5: Play! (30 seconds)

1. Open your Miro board
2. Look for your app icon in the left sidebar
3. Click it to open the game
4. Add players and start playing!

## Troubleshooting

**App not showing in Miro?**
- Make sure you've installed it on your board
- Check that App ID and Client Secret are correct in `.appconfig`

**Can't start the server?**
- Run `npm install` first
- Make sure port 3000 is not already in use

**Miro SDK errors?**
- You must access the app FROM WITHIN a Miro board
- Check browser console for detailed errors

## Next Steps

- Invite team members to play
- Check out [README.md](README.md) for full documentation
- Customize the game styles in the CSS files

**Have fun playing!**
