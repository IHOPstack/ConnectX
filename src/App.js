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

  return (
    <div className="game">
      <div className="gameBoard">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="gameInfo">
        <ul>
          {moves}
          <li key='current'>You are on turn {boardHistory.length}</li>
        </ul>
      </div>
    </div>
  )
}

function Board({xIsNext, squares, onPlay}) {
  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else{
    status = "Next player: " + (xIsNext ? "X" : "O");
  }
  function handleClick(row, column) {
    console.log("square before = ", squares[row][column])
    if (squares[row][column] || winner){
      return;
    }
    const nextSquares = deepCopy(squares);
    if (xIsNext) {
      nextSquares[row][column] = "X";   
    } else {
      nextSquares[row][column] = "O";
    }
    console.log("nextSquares = ", nextSquares[row][column], " squares = ", squares[row][column])
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
function calculateWinner(squares) {
  const lines = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
  ];
  for (let i=0; i<lines.length; i++) {
    const [a,b,c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function deepCopy(OGarray) {
  let arrayCopy = Array(OGarray.length);
  for (let row=0;row<OGarray.length;row++) {
    arrayCopy[row] = OGarray[row].slice();
    for (let i=0;i<OGarray[row].length;i++){
      arrayCopy[row][i] = OGarray[row][i];
    }
  }
  console.log("array cop = ", arrayCopy)
  return arrayCopy
}