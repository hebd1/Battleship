// make sure content is loaded first
$(document).ready(function () {
  const userGrid = $(".grid-user");
  const computerGrid = $(".grid-computer");
  const displayGrid = $("grid-display");
  const ships = $(".ship");

  // ships
  const destroyer = $(".destroyer-container");
  const carrier = $(".carrier-container");
  const submarine = $(".submarine-container");
  const cruiser = $(".cruiser-container");
  const battleship = $(".battleship-container");

  // buttons
  const startButton = $("#start");
  const rotateButton = $("#rotate");
  const turnDisplay = $("#whose-go");
  const infoDisplay = $("#info");

  const width = 10;
  const userSquares = [];
  const computerSquares = [];
  let isHorizontal = true;
  let isGameOver = false;
  let currentPlayer = "user";

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
      let square = document.createElement("div");
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
      name: "destroyer",
      direction: [
        [0, 1], // vertical
        [0, width], // horizontal
      ],
    },
    {
      name: "submarine",
      direction: [
        [0, 1, 2],
        [0, width, width * 2],
      ],
    },
    {
      name: "cruiser",
      direction: [
        [0, 1, 2],
        [0, width, width * 2],
      ],
    },
    {
      name: "battleship",
      direction: [
        [0, 1, 2, 3],
        [0, width, width * 2, width * 3],
      ],
    },
    {
      name: "carrier",
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
      computerSquares[randomStart + el].classList.contains("taken")
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
        computerSquares[randomStart + el].classList.add("taken", ship.name);
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
      destroyer.attr("class", "destroyer-container-vertical ship");
      cruiser.attr("class", "cruiser-container-vertical ship");
      submarine.attr("class", "submarine-container-vertical ship");
      carrier.attr("class", "carrier-container-vertical ship");
      battleship.attr("class", "battleship-container-vertical ship");
    } else {
      destroyer.attr("class", "destroyer-container ship");
      cruiser.attr("class", "cruiser-container ship");
      submarine.attr("class", "submarine-container ship");
      carrier.attr("class", "carrier-container ship");
      battleship.attr("class", "battleship-container ship");
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
    $(this).on("dragstart", dragStart);
  });
  ships.each(function () {
    $(this).on("mousedown", (e) => {
      selectedShipNameWithIndex = e.target.id;
      // console.log(selectedShipNameWithIndex);
    });
  });
  // userSquares.forEach(function () {
  //   $(this).on('dragstart', dragStart);
  // });
  userSquares.forEach(function (el) {
    $(el).on("dragover", (e) => e.preventDefault());
  });
  userSquares.forEach(function (el) {
    $(el).on("dragenter", (e) => e.preventDefault());
  });
  userSquares.forEach(function (el) {
    $(el).on("dragleave", dragLeave);
  });
  userSquares.forEach(function (el) {
    $(el).on("drop", dragDrop);
  });
  userSquares.forEach(function (el) {
    $(el).on("dragend", dragEnd);
  });

  // started dragging
  function dragStart(e) {
    draggedShip = e.target;
    draggedShipLength = e.target.querySelectorAll("div").length;
  }

  function dragLeave() {}
  function dragDrop(e) {
    let shipNameWithLastId = $(draggedShip).children().last().attr("id");
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
        userSquares[squareIndex].classList.add("taken", shipClass);
      }
    } else if (
      !isHorizontal &&
      !notAllowedVerticalForSelectedShip.includes(shipLastIdOnBoard)
    ) {
      for (let i = 0; i < draggedShipLength; i++) {
        let squareIndex =
          parseInt(e.target.dataset.id) - selectedShipSquareIndex + i * width;
        userSquares[squareIndex].classList.add("taken", shipClass);
      }
    } else return;
    $(draggedShip).remove();
  }
  function dragEnd() {
    console.log("dragend");
  }

  startButton.click(playGame);

  // game logic
  function playGame() {
    console.log("current player: " + currentPlayer);
    if (isGameOver) return;
    if (currentPlayer === "user") {
      computerSquares.forEach(function (square) {
        $(square).click(revealSquare);
      });
    } else if (currentPlayer === "computer") {
      var duration = Math.floor(Math.random() * 1000) + 1;
      setTimeout(computerTurn, duration);
    }
  }

  // reveals to player if their turn was a hit or miss
  function revealSquare(square) {
    let squareClass = $(square.target).attr("class");
    let nextTurn = "computer";
    console.log("square class: " + squareClass);
    if (squareClass != null) {
      if (
        squareClass.indexOf("miss") >= 0 ||
        squareClass.indexOf("boom") >= 0
      ) {
      } else if (squareClass.indexOf("taken") >= 0) {
        console.log("taken");
        $(square.target).addClass("boom"); //hit
        nextTurn = "user";
        if (squareClass.indexOf("destroyer") >= 0) destroyerCount++;
        else if (squareClass.indexOf("submarine") >= 0) submarineCount++;
        else if (squareClass.indexOf("cruiser") >= 0) cruiserCount++;
        else if (squareClass.indexOf("battleship") >= 0) battleshipCount++;
        else if (squareClass.indexOf("carrier") >= 0) carrierCount++;
      }
    } else {
      $(square.target).addClass("miss"); //miss
    }

    currentPlayer = nextTurn;
    turnDisplay.html(nextTurn + " turn");
    // remove event listeners from computer squares after their turn
    computerSquares.forEach(function (square) {
      $(square).off();
    });
    checkForWins();
    playGame();
  }

  // Chooses random square for computer turn
  function computerTurn() {
    console.log("computer turn ");
    let randomIndex = Math.floor(Math.random() * userSquares.length);
    console.log("random index: " + randomIndex);
    let squareClass = $(userSquares[randomIndex]).attr("class");
    console.log("square class: " + squareClass);
    let nextTurn = "user";
    if (squareClass != null) {
      if (
        squareClass.indexOf("miss") >= 0 ||
        squareClass.indexOf("boom") >= 0
      ) {
        computerTurn();
        return;
      } else if (squareClass.indexOf("taken") >= 0) {
        $(userSquares[randomIndex]).addClass("boom"); //hit
        nextTurn = "computer";
        if (squareClass.indexOf("destroyer") >= 0) cpuDestroyerCount++;
        else if (squareClass.indexOf("submarine") >= 0) cpuSubmarineCount++;
        else if (squareClass.indexOf("cruiser") >= 0) cpuCruiserCount++;
        else if (squareClass.indexOf("battleship") >= 0) cpuBattleshipCount++;
        else if (squareClass.indexOf("carrier") >= 0) cpuCarrierCount++;
      }
    } else {
      $(userSquares[randomIndex]).addClass("miss");
    }

    currentPlayer = nextTurn;
    turnDisplay.html(nextTurn + " turn");
    checkForWins();
    playGame();
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
      infoDisplay.html("Your destoryer has sunk!");
      cpuDestroyerCount = 10;
    }
    if (cpuSubmarineCount === 3) {
      infoDisplay.html("Your submarine has sunk!");
      cpuSubmarineCount = 10;
    }
    if (cpuCruiserCount === 3) {
      infoDisplay.html("Your cruiser has sunk!");
      cpuCruiserCount = 10;
    }
    if (cpuBattleshipCount === 4) {
      infoDisplay.html("Your battleship has sunk!");
      cpuBattleshipCount = 10;
    }
    if (cpuCarrierCount === 5) {
      infoDisplay.html("Your carrier has sunk!");
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
      infoDisplay.html("You win!");
      gameOver();
    } else if (
      cpuBattleshipCount +
        cpuCruiserCount +
        cpuSubmarineCount +
        cpuCarrierCount +
        cpuDestroyerCount ===
      50
    ) {
      infoDisplay.html("You win!");
      gameOver();
    }
  }

  function gameOver() {
    isGameOver = true;
    startButton.off();
  }
});
