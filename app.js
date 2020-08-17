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
  let isHorizontal = true;

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
    let directionArray = ship.direction[randomDirection];
    if (randomDirection === 0) direction = 1;
    if (randomDirection === 1) direction = 10;
    let randomStart = Math.abs(
      Math.floor(
        Math.random() * computerSquares.length -
          ship.direction[0].length * direction
      )
    );
    // array.some - tests whether at least one element in the array passes the test
    const isTaken = directionArray.some((el) =>
      computerSquares[randomStart + el].classList.contains('taken')
    );
    const isAtRightEdge = directionArray.some(
      (el) => (randomStart + el) % width === width - 1
    );
    const isAtLeftEdge = directionArray.some(
      (el) => (randomStart + el) % width === 0
    );

    if (!isTaken && !isAtRightEdge && !isAtLeftEdge) {
      directionArray.forEach((el) => {
        // add taken to classlist of each square in of the ship
        computerSquares[randomStart + el].classList.add('taken', ship.name);
      });
    }
    // draw again if doesn't work
    else drawShip(ship);
  }

  // draw all ships
  shipArray.forEach((el) => {
    drawShip(el);
  });

  // rotates ships
  function rotate() {
    if (isHorizontal) {
      destroyer.attr('class', 'destroyer-container-vertical');
      cruiser.attr('class', 'cruiser-container-vertical');
      submarine.attr('class', 'submarine-container-vertical');
      carrier.attr('class', 'carrier-container-vertical');
      battleship.attr('class', 'battleship-container-vertical');
    } else {
      destroyer.attr('class', 'destroyer-container');
      cruiser.attr('class', 'cruiser-container');
      submarine.attr('class', 'submarine-container');
      carrier.attr('class', 'carrier-container');
      battleship.attr('class', 'battleship-container');
    }
    isHorizontal = !isHorizontal;
  }

  // rotate ships on click
  rotateButton.click(rotate);
  let selectedShipNameWithIndex;
  let draggedShip;
  let draggedShipLength;
  // drag user ship
  ships.each(function () {
    $(this).on('dragstart', dragStart);
  });
  ships.each(function () {
    $(this).on('mousedown', (e) => {
      selectedShipNameWithIndex = e.target.id;
      // console.log(selectedShipNameWithIndex);
    });
  });
  // userSquares.forEach(function () {
  //   $(this).on('dragstart', dragStart);
  // });
  userSquares.forEach(function (el) {
    $(el).on('dragover', (e) => e.preventDefault());
  });
  userSquares.forEach(function (el) {
    $(el).on('dragenter', (e) => e.preventDefault());
  });
  userSquares.forEach(function (el) {
    $(el).on('dragleave', dragLeave);
  });
  userSquares.forEach(function (el) {
    $(el).on('drop', dragDrop);
  });
  // $(userSquares[0]).on('drop', dragDrop);
  userSquares.forEach(function (el) {
    $(el).on('dragend', dragEnd);
  });

  // started dragging
  function dragStart(e) {
    draggedShip = e.target;
    draggedShipLength = e.target.childNodes.length; // ??
    // console.log(draggedShip);
    // console.log(draggedShipLength);
  }

  function dragLeave() {}
  function dragDrop(e) {
    let shipNameWithLastId = $(draggedShip).children().last().attr('id');
    let shipClass = shipNameWithLastId.slice(0, -2);
    console.log(shipClass);
    let lastShipIndex = parseInt(shipNameWithLastId.substr(-1));
    let shipLastIdOnBoard = lastShipIndex + parseInt(e.target.dataset.id);
    selectedShipSquareIndex = parseInt(selectedShipNameWithIndex.substr(-1));
    console.log(selectedShipSquareIndex);
    shipLastIdOnBoard = shipLastIdOnBoard - selectedShipSquareIndex;
    console.log(shipLastIdOnBoard);
  }
  function dragEnd() {}
});
