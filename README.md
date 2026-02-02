# 2 Truths and 1 Lie - Miro Game

A collaborative game for Miro boards where players share two truths and one lie, and others vote to identify the lie.

## Features

- Multiplayer collaborative gameplay on Miro boards
- Interactive React TypeScript interface
- Real-time voting and results
- Visual game board created directly on Miro
- Score tracking across rounds
- Beautiful, modern UI

## Prerequisites

- Node.js version 14.15 or later
- A Miro account
- A Miro Developer team (free to create)

## Setup Instructions

### 1. Create a Miro App

1. Go to [Miro App Settings](https://miro.com/app/settings/user-profile/apps)
2. Click "Create new app"
3. Fill in the app details:
   - **App Name**: 2 Truths and 1 Lie
   - **Description**: A collaborative game for Miro boards
4. Set the **Redirect URI** to: `http://localhost:3000`
5. Enable the following **Permissions**:
   - `boards:read`
   - `boards:write`
6. Copy your **App ID** and **Client Secret**

### 2. Configure the App

1. Open the `.appconfig` file in the project root
2. Replace the placeholders with your actual values:
   ```
   appId=YOUR_APP_ID_HERE
   clientSecret=YOUR_CLIENT_SECRET_HERE
   redirectUrl=http://localhost:3000
   ```

### 3. Install Dependencies

```bash
cd two-truths-one-lie
npm install
```

### 4. Start the Development Server

```bash
npm start
```

The app will be available at `http://localhost:3000`

### 5. Install the App on a Miro Board

1. Go back to your app settings in Miro
2. Click "Install app and get OAuth token"
3. Select a board to install the app on
4. Grant the requested permissions

### 6. Open the App

1. Navigate to your Miro board
2. Click on the app icon in the left sidebar
3. Start playing!

## How to Play

### Setup Phase

1. **Add Players**: Each player enters their name and three statements (2 truths, 1 lie)
2. **Mark the Lie**: Select which statement is the lie for each player
3. **Start Game**: Once you have at least 2 players, click "Start Game"

### Playing Phase

1. **View Statements**: Each player's statements are displayed one at a time
2. **Vote**: All other players vote on which statement they think is the lie
3. **Results**: After voting, the lie is revealed and scores are updated
4. **Next Player**: Continue through all players

### Scoring

- Players earn 1 point for each person who correctly identifies their lie
- The player with the most points at the end wins!

## Game Flow

```
Setup → Playing → Voting → Results → Next Player → ... → Final Results
```

## Technologies Used

- **React** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Miro Web SDK 2.0** - Integration with Miro boards
- **CSS3** - Modern styling with gradients and animations

## Project Structure

```
two-truths-one-lie/
├── src/
│   ├── components/
│   │   ├── GameSetup.tsx       # Player setup and statement input
│   │   ├── GameBoard.tsx       # Display current player's statements
│   │   ├── VotingPanel.tsx     # Voting interface
│   │   └── ResultsPanel.tsx    # Show results and scores
│   ├── types.ts                # TypeScript interfaces
│   ├── App.tsx                 # Main app component
│   ├── App.css                 # App styles
│   ├── index.tsx               # Entry point
│   └── index.css               # Global styles
├── index.html                  # HTML template
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
├── app-manifest.json           # Miro app manifest
└── README.md                   # This file
```

## Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Adding Features

The game is designed to be extensible. Some ideas for enhancements:

- Timer for voting rounds
- Custom themes and colors
- Sound effects
- More game modes (e.g., "Find the Truth" instead)
- Leaderboard persistence
- Team play mode
- Chat integration

## Troubleshooting

### App doesn't appear in Miro

- Make sure you've installed the app on your board
- Check that your app ID and client secret are correct
- Verify the redirect URI matches your local server

### Miro SDK errors

- Ensure you're accessing the app from within a Miro board
- Check the browser console for specific error messages
- Make sure the Miro SDK script is loaded (check index.html)

### Build errors

- Delete `node_modules` and run `npm install` again
- Check that you're using Node.js 14.15 or later
- Verify all TypeScript types are correct

## Resources

- [Miro Developer Documentation](https://developers.miro.com/docs)
- [Miro Web SDK Reference](https://developers.miro.com/docs/miro-web-sdk-introduction)
- [Miro Community Forum](https://community.miro.com/developer-platform-and-apis-57)

## License

MIT

## Contributing

Feel free to submit issues and pull requests!
