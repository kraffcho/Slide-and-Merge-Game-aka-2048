# Slide & Merge Game

![Game Preview in Dark Mode](./game_preview.png)

## Description

Slide & Merge is a React-based game inspired by the 2048 game. The objective is to slide the numbered tiles on a grid to combine them and create a tile with the number 2048. This game features smooth animations, a dark/light theme toggle, a tutorial, and records your high score!

## Features

- 4x4 game board
- Keyboard and Touchscreen controls
- High Score tracking
- Dark/Light Theme Toggle
- Timer to keep track of playtime
- Local Storage to save game state and theme
- Easy-to-follow tutorial for beginners

## Installation

```bash
git clone https://github.com/kraffcho/slide-and-merge-game-aka-2048.git
cd slide-and-merge
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## How To Play

### On Desktop

- Use your keyboard's arrow keys to move the tiles.
- Tiles with the same number will merge into one when they touch.

### On Mobile Devices

- Swipe to move the tiles.
- Tiles with the same number will merge into one when they touch.

## Usage

Below are the main functionalities of the application:

### Toggle Theme

You can toggle between light and dark themes.

### Show Tutorial

For first-time players, a tutorial can be displayed.

### Restart Game

Restart the game at any point to try and beat your high score!

## Technologies Used

- React
- CSS
- Local Storage for state persistence

## Code Structure

- `GameUtils.js`: Contains utility functions like board initialization and game-over checks.
- `App.js`: Contains the main application logic, UI components, and state management.

### Key Functions

- `initializeBoard`: Initializes the game board.
- `checkGameOver`: Checks if the game is over.
- `placeRandom`: Places a random tile on the board.

## Demo

[PLAY THE GAME](https://6ytftn.csb.app/)

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

MIT

---

Enjoy the game!
