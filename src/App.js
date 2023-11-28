import { useState } from "react";

function Square({squareID, value, fillSquare}) {
  let isWinning = false
  if (winningSquares){
    console.log("ID: ", squareID, "winList: ", winningSquares)
    if (winningSquares.some(arr => JSON.stringify(arr) === JSON.stringify(squareID))) {
      console.log("match found")
      isWinning = true 
    }
  }
  return <button className={isWinning ? "winning":"square"} onClick={fillSquare}>{value}</button>;
}
function Label({character}){
  return <label className="gridLabel">{character}</label>
}
let stillWinner;
const winCon = 4;
export default function Game() {
  const [boardHistory, setHistory] = useState([Array.from({length:6}, () => Array(7).fill(null))]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = boardHistory[currentMove];

  function handlePlay(nextSquares){
    const nextHistory = [...boardHistory.slice(0, currentMove +1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length-1);
  }
  function jumpTo(nextMove){
    if (winningSquares){
      stillWinner = winningSquares;
    }
    winningSquares = null
    console.log("still: ", stillWinner)
    setCurrentMove(nextMove);
    if (nextMove == boardHistory.length-1){
      winningSquares = stillWinner;
    }

  }

  const moves = boardHistory.map((squares, move) => {
    let description;
    if (move > 0) {
      //find position of move
      for (let row =0; row < squares.length; row++){
        for (let column=0; column<squares[row].length; column++){
          if (squares[row][column] != boardHistory[move-1][row][column]){
            //assign position to button
            const playedSquare = "" + (row+1) + String.fromCharCode(column+97);
            description = "Move #" + move + " XorO at " + playedSquare;
            break;
          }
        }
      }
    } else {
      description = "Go to game start";
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    )
  })
  let current = "";
  if (winningSquares){
    current = "Game ended after turn " + (boardHistory.length-1);
  } else {
    current = "You are on turn " + currentMove
  }
  return (
    <div className="game">
      <div className="gameBoard">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="gameInfo">
        <ul>
          {moves}
          <li key='current'>{current}</li>
        </ul>
      </div>
    </div>
  )
}
let winningSquares = null;

function Board({xIsNext, squares, onPlay}) {
  let status;
  if (winningSquares) {
    status = "Winner: " + winningSquares[0];
  } else{
    status = "Next player: " + (xIsNext ? "X" : "O");
  }      
function handleClick(row, column) {
    const nextSquares = deepCopy(squares);
    //check if play is possible
    if (squares[row][column] || winningSquares){
      return;
    }
    //display the move
    if (xIsNext) {
      nextSquares[row][column] = "X";   
    } else {
      nextSquares[row][column] = "O";
    }
    //determine if we have a winner
    winningSquares = calculateWinner(nextSquares, row, column)
    onPlay(nextSquares);
  }
  //layout squares for board
  const grid = squares.map((lines, rowNum) => {
    const rowKey = "row" + rowNum;
    const rows = lines.map((value, columnNum) => {
      const squareKey = "row" + rowNum + "column" + columnNum;
      const squareID = [rowNum, columnNum]
      return (
        <Square key={squareKey} squareID={squareID} value={value} fillSquare={() => handleClick(rowNum, columnNum)} />
      )
    })
    return (
      <div key={rowKey} className="board-row">{rows}</div>
    )
  })
  //create lower labels
  for (let i=0;i<squares[0];i++){
    break;
  }
  //return the board
  return (
    <>
      <div className="status">{status}</div>
      {grid}
      <Label character={"kdfdfs"}></Label>
      <div className="gridLabel" style={{width: 34*7}}>1 2 3 4 5 6 7</div>
    </>
  );
}
function calculateWinner(squares, rowPos, columnPos) {
  const newMark = squares[rowPos][columnPos];
  function checkDirection(rowChange, columnChange){
    let squareCounter = [];
    for (let i=1;i<winCon;i++){
      const newRow = rowPos + rowChange*i;
      const newColumn = columnPos + columnChange*i;
      if (newRow>=0 && newRow<=squares.length-1 &&
          newColumn>=0 && newColumn<=squares[rowPos].length &&
          squares[newRow][newColumn] == newMark){
        squareCounter.push([newRow, newColumn])
      } else{
        break
      }
    }
    return squareCounter
  }
  const firstSquare = [newMark, [rowPos, columnPos]]
  //check horizontal
  let horizontalSquares = firstSquare.concat(checkDirection(0,1)).concat(checkDirection(0,-1));
  if (horizontalSquares.length >= winCon+1){
    return horizontalSquares;
  }
  //check vertical
  let verticalSquares = firstSquare.concat(checkDirection(1,0)).concat(checkDirection(-1,0));
  if (verticalSquares.length >= winCon+1){
    return verticalSquares;
  }
  //check diagonal up
  let diagonalUpSquares = firstSquare.concat(checkDirection(1,1)).concat(checkDirection(-1,-1));
  if (diagonalUpSquares.length >= winCon+1){
    return diagonalUpSquares;
  }
  //check diaonal down
  let diagonalDownSquares = firstSquare.concat(checkDirection(-1,1)).concat(checkDirection(1,-1));
  if (diagonalDownSquares.length >= winCon+1){
    return diagonalDownSquares;
  }
  return null
}

function deepCopy(OGarray) {
  let arrayCopy = Array(OGarray.length);
  for (let row=0;row<OGarray.length;row++) {
    arrayCopy[row] = OGarray[row].slice();
    for (let i=0;i<OGarray[row].length;i++){
      arrayCopy[row][i] = OGarray[row][i];
    }
  }
  return arrayCopy;
}