// make sure content is loaded first
document.addEventListener("DOMContentLoaded", () => {
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

  // create board
  function createBoard() {
    // es6 syntax for squaring number
    for (let i = 0; i < width ** 2; i++) {}
  }
});
