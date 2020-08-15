// make sure content is loaded first
$(document).ready(function () {
  const userGrid = $('.grid-user');
  const computerGrid = $('.grid-computer');
  const displayGrid = $('grid-display');
  const ships = $('.ship');

  // ships
  const destroyer = $('.destroyer-container');
  const carrier = $('.carrier-container');
  const submarine = $('.submarine-container');
  const cruiser = $('.cruiser-container');
  const battleship = $('.battleship-container');

  // buttons
  const startButton = $('#start');
  const rotateButton = $('#rotate');
  const turnDisplay = $('#whose-go');
  const infoDisplay = $('#info');

  const width = 10;
  const userSquares = [];
  const computerSquares = [];

  // create board
  function createBoard(grid, squares) {
    // es6 syntax for squaring number
    for (let i = 0; i < width ** 2; i++) {
      let square = document.createElement('div');
      square.dataset.id = i;
      grid.append(square);
      squares.push(square);
    }
  }

  createBoard(userGrid, userSquares);
  createBoard(computerGrid, computerSquares);

  // ships
  const shipArray = [
    {
      name: 'destroyer',
      direction: [
        [0, 1], // vertical
        [0, width], // horizontal
      ],
    },
    {
      name: 'submarine',
      direction: [
        [0, 1, 2],
        [0, width, width * 2],
      ],
    },
    {
      name: 'cruiser',
      direction: [
        [0, 1, 2],
        [0, width, width * 2],
      ],
    },
    {
      name: 'battleship',
      direction: [
        [0, 1, 2, 3],
        [0, width, width * 2, width * 3],
      ],
    },
    {
      name: 'carrier',
      direction: [
        [0, 1, 2, 3, 4],
        [0, width, width * 2, width * 3, width * 4],
      ],
    },
  ];

  // draw computer ships in random locations
  function drawShip(ship) {
    let randomDirection = Math.floor(Math.random() * 2);
    let current = ship.direction[randomDirection];
    if (randomDirection === 0) direction = 1;
    if (randomDirection === 1) direction = 10;
    let randomStart = Math.abs(
      Math.floor(
        Math.random() * computerSquares.length -
          ship.direction[0].length * direction
      )
    );
    // array.some - tests whether at least one element in the array passes the test
    const isTaken = current.some((index) =>
      computerSquares[randomStart + index].classList.contains('taken')
    );
    const isAtRightEdge = current.some(
      (index) => (randomStart + index) % width === width - 1
    );
    const isAtLeftEdge = current.some(
      (index) => (randomStart + index) % width === 0
    );

    if (!isTaken && !isAtRightEdge && !isAtLeftEdge) {
      current.forEach((index) => {
        // add taken to classlist of each square in of the ship
        computerSquares[randomStart + index].classList.add('taken', ship.name);
      });
    }
    // draw again if doesn't work
    else drawShip(ship);
  }

  // draw all ships
  shipArray.forEach((el) => {
    drawShip(el);
  });
});
