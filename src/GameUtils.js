export const BOARD_SIZE = 4;

export const initializeBoard = () => {
  let board = Array.from(Array(BOARD_SIZE), () => new Array(BOARD_SIZE).fill(null));
  placeRandom(board);
  placeRandom(board);
  return board;
};

export const placeRandom = (board) => {
  const emptySquares = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (!board[i][j]) {
        emptySquares.push([i, j]);
      }
    }
  }
  const [x, y] = emptySquares[Math.floor(Math.random() * emptySquares.length)];
  board[x][y] = 2;
};

export const checkGameOver = (board) => {
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (!board[i][j]) return false;
      if (j < BOARD_SIZE - 1 && board[i][j] === board[i][j + 1]) return false;
      if (i < BOARD_SIZE - 1 && board[i][j] === board[i + 1][j]) return false;
    }
  }
  return true;
};
