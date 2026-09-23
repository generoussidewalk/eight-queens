# Eight Queens (but the board gets progressively larger and also there are random pieces)

I like this puzzle, so I made it a little more difficult.

My project is an implementation of the Eight Queens puzzle, where a player needs to place eight queens on a chess board, without any of them attacking each other. In this project, I just adjusted a few aspects of this problem to make it a little more interesting.

##Run

https://stackblitz.com/github/generoussidewalk/eight-queens

## Run locally

1. Install Node.js 22.12 or newer.
2. Clone the repository and enter the folder:
   ```
   git clone <repo-url>
   cd eight-queens
   ```
3. Install dependencies: `npm install`
4. Start the backend and frontend together: `npm run dev:all`
5. Open localhost in your browser.

No other setup is needed. Without a `.env` file, runs are kept in server memory, so Past Runs resets when the backend restarts.

### Optional: save runs in Firestore

If you already have a Firebase project with a Firestore database:

1. In the Firebase console, open Project settings → Service accounts and click **Generate new private key**. Save the JSON file somewhere outside this folder.
2. Create a file named `.env` next to `package.json`:
   ```
   FIREBASE_PROJECT_ID=your-project-id
   GOOGLE_APPLICATION_CREDENTIALS="C:/path/to/your-key.json"
   PORT=8080
   ```
3. Restart `npm run dev:all`. The terminal should now say `saving to Firestore`, and completed runs appear in a `runs` collection.

Never commit `.env` or the key file; both are already listed in `.gitignore`.
## Play

- Start a run. The server picks one of 7–8 predetermined sets for each puzzle.
- Select a piece, then select a square. Select a placed piece to remove it.
- Pieces must not attack each other in either direction. There are no opponents, turns, captures, or pawns. Kings attack one square in any direction.
- Red squares mark conflicting pieces. A fully placed, safe board is submitted automatically.
- Express verifies the exact assigned pieces, bounds, duplicate squares, and attack rules before accepting a solution.
- Complete all eight puzzles to save the final time.


 Human difficulty varies between sets; it is not mathematically ranked, I designed the puzzles myself. Answers are not offered in the game. 

 ## Lessons Learnt

This is my first time using Firestore. My experience so far has been very smooth and it is very responsive.

## References
https://en.wikipedia.org/wiki/Eight_queens_puzzle
FSAB Bootcamp Materials


