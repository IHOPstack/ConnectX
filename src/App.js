import { useState } from "react";

function Square({value, fillSquare}) {
  return <button className="square" onClick={fillSquare}>{value}</button>;
}
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
    setCurrentMove(nextMove);
  }

  const moves = boardHistory.map((squares, move) => {
    let description;
    if (move > 0) {
      description = "Go to move #" + move;
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
  if (isWinner){
    current = "Game ended after turn " + (boardHistory.length-1);
  } else {
    current = "You are on turn " + boardHistory.length
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
let isWinner = null;

function Board({xIsNext, squares, onPlay}) {
  let status;
  if (isWinner) {
    status = "Winner: " + isWinner;
  } else{
    status = "Next player: " + (xIsNext ? "X" : "O");
  }      
function handleClick(row, column) {
    const nextSquares = deepCopy(squares);
    //check if play is possible
    if (squares[row][column] || isWinner){
      return;
    }
    //display the move
    if (xIsNext) {
      nextSquares[row][column] = "X";   
    } else {
      nextSquares[row][column] = "O";
    }
    //determine if we have a winner
    isWinner = calculateWinner(nextSquares, row, column)
    onPlay(nextSquares);
  }
  const grid = squares.map((lines, rowNum) => {
    const rowKey = "row" + rowNum;
    const rows = lines.map((value, columnNum) => {
      const squareKey = "row" + rowNum + "column" + columnNum;
      return (
        <Square key={squareKey} value={value} fillSquare={() => handleClick(rowNum, columnNum)} />
      )
    })
    return (
      <div key={rowKey} className="board-row">{rows}</div>
    )
  })
  return (
    <>
      <div className="status">{status}</div>
      {grid}
    </>
  );
}
function calculateWinner(squares, rowPos, columnPos) {
  const newMark = squares[rowPos][columnPos];

  function checkDirection(rowChange, columnChange){
    let counter = 0
    for (let i=1;i<4;i++){
      const newRow = rowPos + rowChange*i;
      const newColumn = columnPos + columnChange*i;
      console.log("newRow = ", newRow)
      if (newRow>=0 && newRow<=squares.length-1 &&
          newColumn>=0 && newColumn<=squares[rowPos].length &&
          squares[newRow][newColumn] == newMark){
        counter += 1
      } else{
        break
      }
    }
    return counter
  }
  //check horizontal
  if (checkDirection(0,1) + checkDirection(0,-1) == 3){
    return newMark
  }
  //check vertical
  if (checkDirection(1,0) + checkDirection(-1,0) ==3){
    return newMark
  }
  //check diagonal up
  if (checkDirection(-1,-1) + checkDirection(1,1) == 3){
    return newMark
  }
  //check diaonal down
  if (checkDirection(-1,1) + checkDirection(1,-1) ==3){
    return newMark
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