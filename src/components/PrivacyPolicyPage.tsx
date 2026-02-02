import React from 'react';
import './PrivacyPolicyPage.css';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: February 2026</p>

        <section>
          <h2>Introduction</h2>
          <p>
            Welcome to "2 Truths and 1 Lie" (the "App"). This Privacy Policy explains how we handle
            information when you use our Miro board application.
          </p>
        </section>

        <section>
          <h2>Information We Collect</h2>
          <p>The App collects and uses the following information:</p>
          <ul>
            <li><strong>Miro User ID and Name:</strong> Used to identify players during the game session</li>
            <li><strong>Game Data:</strong> Statements you submit, votes you cast, and game scores</li>
          </ul>
        </section>

        <section>
          <h2>How We Use Information</h2>
          <p>All information is used solely for:</p>
          <ul>
            <li>Enabling multiplayer gameplay on your Miro board</li>
            <li>Synchronizing game state between all players</li>
            <li>Displaying player names and scores during the game</li>
          </ul>
        </section>

        <section>
          <h2>Data Storage</h2>
          <p>
            All game data is stored temporarily in Miro's board storage. This data:
          </p>
          <ul>
            <li>Is only accessible to users with access to the Miro board</li>
            <li>Is automatically cleared when a new game session starts</li>
            <li>Does not persist when the board is copied</li>
            <li>Is not transmitted to any external servers</li>
          </ul>
        </section>

        <section>
          <h2>Data Sharing</h2>
          <p>
            We do not sell, trade, or share your information with third parties.
            Game data is only visible to other players on the same Miro board.
          </p>
        </section>

        <section>
          <h2>Data Retention</h2>
          <p>
            Game data is temporary and is cleared when:
          </p>
          <ul>
            <li>A new game session begins</li>
            <li>The "Play Again" button is clicked</li>
            <li>The Miro board storage is cleared</li>
          </ul>
        </section>

        <section>
          <h2>Your Rights</h2>
          <p>
            Since no personal data is stored permanently, there is no data to request,
            modify, or delete. All game data is session-based and temporary.
          </p>
        </section>

        <section>
          <h2>Children's Privacy</h2>
          <p>
            This App is intended for use within Miro boards by users who have Miro accounts.
            We do not knowingly collect information from children under 13.
          </p>
        </section>

        <section>
          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be
            reflected in the "Last updated" date above.
          </p>
        </section>

        <section>
          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us through
            the Miro Marketplace or submit feedback through the app.
          </p>
        </section>

        <div className="back-link">
          <a href="/">← Back to App</a>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
