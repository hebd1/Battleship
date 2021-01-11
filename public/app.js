// make sure content is loaded first
$(document).ready(function () {
  const userGrid = $('.grid-user');
  const computerGrid = $('.grid-computer');
  const displayGrid = $('grid-display');
  const ships = $('.ship');
  const singlePlayerButton = $('#singlePlayerButton');
  const multiplayerButton = $('#multiPlayerButton');

  // client vars
  let currPlayer = 'user'; // default is user
  let gameMode = '';
  let playerNum = 0;
  let ready = false;
  let enemyReady = false;
  let allShipsPlaced = false;
  let shotFired = -1;

  // event listeners for player modes
  singlePlayerButton.click(startSinglePlayer);
  multiplayerButton.click(startMultiPlayer);

  // Multiplayer function
  function startMultiPlayer() {
    gameMode = 'multiPlayer';
    const socket = io(); // only need sockets for multiplayer. Emits connection event

    // get player num from server
    // player 1 is the enemy
    // player 0 is the good guy
    socket.on('player-number', (playerIndex) => {
      console.log({ playerIndex });
      if (playerIndex === -1) {
        infoDisplay.html('Sorry, the server is full..');
      } else {
        playerNum = parseInt(playerIndex); // socketio sends data as a string
        if (playerNum === 1) {
          currPlayer = 'enemy';
        }
        console.log({ playerNum });
        // Get other player status in case they became ready before we connected
        socket.emit('check-player-status');
      }
    });

    // Player ready status
    socket.on('check-players', (players) => {
      console.log({ players });
      players.forEach((p, i) => {
        if (p.connected) playerConnectedOrDisconnected(i);
        if (p.ready) {
          playerReady(i);
          if (i !== playerNum) enemyReady = true;
        }
      });
    });

    // another player has connected
    socket.on('player-connection', (playerIndex) => {
      console.log(`Player ${playerIndex} has connected or disconnected`);
      playerConnectedOrDisconnected(playerIndex);
    });

    // On enemy ready
    socket.on('enemy-ready', (playerIndex) => {
      enemyReady = true;
      playerReady(playerIndex);
      // if we are ready too then start the game
      if (ready) playGameMulti(socket);
    });

    // Ready button click
    startButton.click(() => {
      if (allShipsPlaced) {
        playGameMulti(socket);
      } else {
        infoDisplay.html('Please place all ships before starting');
      }
    });

    // Setup event listeners for firing
    computerSquares.forEach((square) => {
      $(square).click(() => {
        console.log('here');
        if (currentPlayer == 'user' && ready && enemyReady) {
          shotFired = square.dataset.id;
          socket.emit('fire', shotFired);
        }
      });
    });

    // On fire received from other player
    socket.on('fire', (id) => {
      enemyGo(id);
      const square = userSquares[id];
      socket.emit('fire-reply', square.classList);
      playGameMulti(socket);
    });

    // on fire reply received
    socket.on('fire-reply', (classList) => {
      revealSquare(classList);
      playGameMulti(socket);
    });

    function playerConnectedOrDisconnected(playerIndex) {
      let player = `.p${parseInt(playerIndex) + 1}`;
      if ($(`${player} .connected span`).hasClass('green')) {
        $(`${player} .connected span`).removeClass('green');
      } else {
        $(`${player} .connected span`).addClass('green');
      }
      if (parseInt(playerIndex) === playerNum) {
        // player connecting is us
        $(player).css('fontWeight', 'bold');
      }
    }
  }

  // Single Player Function
  function startSinglePlayer() {
    gameMode = 'singlePlayer';

    // draw all ships
    shipArray.forEach((el) => {
      drawShip(el);
    });

    startButton.click(playGameSingle);
  }

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
  let isGameOver = false;
  let currentPlayer = 'user';

  // player ship hit counts
  let destroyerCount = 0;
  let submarineCount = 0;
  let cruiserCount = 0;
  let battleshipCount = 0;
  let carrierCount = 0;

  // computer ship hit counts
  let cpuDestroyerCount = 0;
  let cpuSubmarineCount = 0;
  let cpuCruiserCount = 0;
  let cpuBattleshipCount = 0;
  let cpuCarrierCount = 0;

  // create board
  function createBoard(grid, squares) {
    // es6 syntax for squaring number
    for (let i = 0; i < width ** 2; i++) {
      let square = document.createElement('div');
      square.dataset.id = i;
      grid.append(square);
      squares.push(square); // changing user squares changes the grid element
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

  // rotates ships
  function rotate() {
    if (isHorizontal) {
      destroyer.attr('class', 'destroyer-container-vertical ship');
      cruiser.attr('class', 'cruiser-container-vertical ship');
      submarine.attr('class', 'submarine-container-vertical ship');
      carrier.attr('class', 'carrier-container-vertical ship');
      battleship.attr('class', 'battleship-container-vertical ship');
    } else {
      destroyer.attr('class', 'destroyer-container ship');
      cruiser.attr('class', 'cruiser-container ship');
      submarine.attr('class', 'submarine-container ship');
      carrier.attr('class', 'carrier-container ship');
      battleship.attr('class', 'battleship-container ship');
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
  userSquares.forEach(function (el) {
    $(el).on('dragend', dragEnd);
  });

  // started dragging
  function dragStart(e) {
    draggedShip = e.target;
    draggedShipLength = e.target.querySelectorAll('div').length;
  }

  function dragLeave() {}
  function dragDrop(e) {
    let shipNameWithLastId = $(draggedShip).children().last().attr('id');
    let shipClass = shipNameWithLastId.slice(0, -2);
    let lastShipIndex = parseInt(shipNameWithLastId.substr(-1));

    selectedShipSquareIndex = parseInt(selectedShipNameWithIndex.substr(-1));
    let shipLastIdOnBoard = isHorizontal
      ? lastShipIndex - selectedShipSquareIndex + parseInt(e.target.dataset.id)
      : (lastShipIndex - selectedShipSquareIndex) * width +
        parseInt(e.target.dataset.id);

    console.log(shipLastIdOnBoard);
    // can't have last ship index in these squares
    const notAllowedHorizontal = [];
    for (i = 0; i < 4; i++) {
      for (j = 0; j < 100; j += 10) {
        notAllowedHorizontal.push(i + j);
      }
    }

    const notAllowedHorizontalForSelectedShip = notAllowedHorizontal.splice(
      0,
      10 * lastShipIndex
    );

    // TODO: disallow adding ships at the top
    const notAllowedVertical = [];
    for (i = 100; i < 140; i += 10) {
      for (j = 9; j > -1; j--) {
        notAllowedVertical.push(i + j);
      }
    }
    const notAllowedVerticalForSelectedShip = notAllowedVertical.splice(
      0,
      10 * lastShipIndex
    );
    if (
      isHorizontal &&
      !notAllowedHorizontalForSelectedShip.includes(shipLastIdOnBoard) &&
      shipLastIdOnBoard <= 99
    ) {
      // add class to game board
      for (let i = 0; i < draggedShipLength; i++) {
        let squareIndex =
          parseInt(e.target.dataset.id) - selectedShipSquareIndex + i;
        userSquares[squareIndex].classList.add('taken', shipClass);
      }
    } else if (
      !isHorizontal &&
      !notAllowedVerticalForSelectedShip.includes(shipLastIdOnBoard)
    ) {
      for (let i = 0; i < draggedShipLength; i++) {
        let squareIndex =
          parseInt(e.target.dataset.id) - selectedShipSquareIndex + i * width;
        userSquares[squareIndex].classList.add('taken', shipClass);
      }
    } else return;
    $(draggedShip).remove();

    // Verify all ships have been placed
    if ($(displayGrid).find('.ship').length === 0) allShipsPlaced = true;
  }
  function dragEnd() {
    console.log('dragend');
  }

  // game logic
  function playGameSingle() {
    console.log('current player: ' + currentPlayer);
    if (isGameOver) return;
    if (currentPlayer === 'user') {
      computerSquares.forEach(function (square) {
        $(square).click(revealSquare.classList);
      });
    } else if (currentPlayer === 'computer') {
      var duration = Math.floor(Math.random() * 1000) + 1;
      setTimeout(enemyGo, duration);
    }
  }

  function playGameMulti(socket) {
    if (isGameOver) return;
    if (!ready) {
      socket.emit('player-ready');
      ready = true;
      playerReady(playerNum);
    }
    if (enemyReady) {
      if (currPlayer === 'user') {
        turnDisplay.html('Your turn');
      } else if (currPlayer === 'enemy') {
        turnDisplay.html("Enemy's turn");
      }
    }
  }

  function playerReady(playerIndex) {
    let player = `.p${parseInt(playerIndex) + 1}`;
    $(`${player} .ready span`).addClass('green');
  }

  // reveals to player if their turn was a hit or miss
  // takes class list of square
  function revealSquare(classList) {
    const enemySquare = computerGrid.find(`#${shotFired}`);
    const obj = Object.values(classList);
    let nextTurn = 'computer';
    if (obj.length > 0) {
      if (obj.indexOf('miss') >= 0 || obj.indexOf('boom') >= 0) {
      } else if (obj.indexOf('taken') >= 0) {
        console.log('taken');
        enemySquare.classList.add('boom'); //hit
        nextTurn = 'user';
        if (obj.indexOf('destroyer') >= 0) destroyerCount++;
        else if (obj.indexOf('submarine') >= 0) submarineCount++;
        else if (obj.indexOf('cruiser') >= 0) cruiserCount++;
        else if (obj.indexOf('battleship') >= 0) battleshipCount++;
        else if (obj.indexOf('carrier') >= 0) carrierCount++;
      }
    } else {
      enemySquare.classList.add('miss'); //miss
    }

    currentPlayer = nextTurn;
    turnDisplay.html(nextTurn + ' turn');
    // remove event listeners from computer squares after their turn
    computerSquares.forEach(function (square) {
      $(square).off();
    });
    checkForWins();
    if (gameMode == 'singlePlayer') playGameSingle();
  }

  // Chooses random square for computer turn
  function enemyGo(square) {
    console.log('enemy turn');
    if (gameMode == 'singlePlayer')
      square = Math.floor(Math.random() * userSquares.length);
    console.log('ship index: ' + square);
    let squareClass = $(userSquares[square]).attr('class');
    console.log('square class: ' + squareClass);
    let nextTurn = 'user';
    if (squareClass != null) {
      // enemy tries again if they already guessed this square
      if (
        squareClass.indexOf('miss') >= 0 ||
        (squareClass.indexOf('boom') >= 0 && gameMode == 'singlePlayer')
      ) {
        enemyGo();
        return;
      }
      // valid guess. if taken, mark a boom, else a miss
      else if (squareClass.indexOf('taken') >= 0) {
        $(userSquares[square]).addClass('boom'); // hit
        nextTurn = 'computer';
        if (squareClass.indexOf('destroyer') >= 0) cpuDestroyerCount++;
        else if (squareClass.indexOf('submarine') >= 0) cpuSubmarineCount++;
        else if (squareClass.indexOf('cruiser') >= 0) cpuCruiserCount++;
        else if (squareClass.indexOf('battleship') >= 0) cpuBattleshipCount++;
        else if (squareClass.indexOf('carrier') >= 0) cpuCarrierCount++;
      }
    } else {
      $(userSquares[square]).addClass('miss');
    }

    currentPlayer = nextTurn;
    turnDisplay.html(nextTurn + ' turn');
    checkForWins();
    if (gameMode == 'singlePlayer') playGameSingle();
  }

  function checkForWins() {
    // check for sunk ships
    // players
    if (destroyerCount === 2) {
      infoDisplay.html("You sunk the computer's destoryer!");
      destroyerCount = 10;
    }
    if (submarineCount === 3) {
      infoDisplay.html("You sunk the computer's submarine!");
      submarineCount = 10;
    }
    if (cruiserCount === 3) {
      infoDisplay.html("You sunk the computer's cruiser!");
      cruiserCount = 10;
    }
    if (battleshipCount === 4) {
      infoDisplay.html("You sunk the computer's battleship!");
      battleshipCount = 10;
    }
    if (carrierCount === 5) {
      infoDisplay.html("You sunk the computer's carrier!");
      carrierCount = 10;
    }
    // computer
    if (cpuDestroyerCount === 2) {
      infoDisplay.html('Your destoryer has sunk!');
      cpuDestroyerCount = 10;
    }
    if (cpuSubmarineCount === 3) {
      infoDisplay.html('Your submarine has sunk!');
      cpuSubmarineCount = 10;
    }
    if (cpuCruiserCount === 3) {
      infoDisplay.html('Your cruiser has sunk!');
      cpuCruiserCount = 10;
    }
    if (cpuBattleshipCount === 4) {
      infoDisplay.html('Your battleship has sunk!');
      cpuBattleshipCount = 10;
    }
    if (cpuCarrierCount === 5) {
      infoDisplay.html('Your carrier has sunk!');
      cpuCarrierCount = 10;
    }
    // check for wins
    if (
      battleshipCount +
        cruiserCount +
        submarineCount +
        carrierCount +
        destroyerCount ===
      50
    ) {
      infoDisplay.html('You win!');
      gameOver();
    } else if (
      cpuBattleshipCount +
        cpuCruiserCount +
        cpuSubmarineCount +
        cpuCarrierCount +
        cpuDestroyerCount ===
      50
    ) {
      infoDisplay.html('You win!');
      gameOver();
    }
  }

  function gameOver() {
    isGameOver = true;
    startButton.off();
  }
});
