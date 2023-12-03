import { useEffect, useState, useRef } from "react";
import Button from '@mui/joy/Button';
import Sheet from '@mui/joy/Sheet';
import { CssVarsProvider, useColorScheme } from '@mui/joy/styles';
import { CssBaseline, ListItem } from "@mui/joy";
import Typography from '@mui/joy/Typography';
import List from '@mui/joy/List';
import Card from '@mui/joy/Card';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import Stack from '@mui/joy/Stack';


function Square({squareID, value, fillSquare}) {
  let isWinning = false
  if (winningSquares){
    if (winningSquares.some(arr => JSON.stringify(arr) === JSON.stringify(squareID))) {
      isWinning = true 
    }
  }
  return <Button className={isWinning ? "winning":"square"} variant={isWinning ? "solid":"outlined"} onClick={fillSquare}>{value}</Button>;
}
function Label({character}){
  return <Typography className="gridLabel">{character}</Typography>
}
let stillWinner;
const winCon = 4;

export default function Game() {
  const [boardWidth, setBoardWidth] = useState(7);
  const [boardHeight, setBoardHeight] = useState(6);
  const [boardHistory, setHistory] = useState([Array.from({length:boardHeight}, () => Array(boardWidth).fill(null))]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = boardHistory[currentMove];
  console.log("board histyory: ", boardHistory)
  console.log("currennt squares: ", currentSquares);

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
      <ListItem key={move}>
        <Button variant="soft" onClick={() => jumpTo(move)}>{description}</Button>
      </ListItem>
    )
  })
  let current = "";
  if (winningSquares){
    current = "Game ended after turn " + (boardHistory.length-1);
  } else {
    current = "You are on turn " + currentMove
  }
    return (
    <CssVarsProvider>
      <CssBaseline/>
      <ModeToggle /> 
      <div className="game">
        <ChangeGame boardHeight={boardHeight} boardWidth={boardWidth} setBoardHeight={setBoardHeight} setBoardWidth={setBoardWidth} setHistory={setHistory} setCurrentMove={setCurrentMove} />
        <div className="gameBoard">
          <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
        </div>
      <div className="gameInfo">
        <List size="small">
          {moves}
          <Typography key='current'>{current}</Typography>
        </List>
      </div>
      </div>
    </CssVarsProvider>
  )
}
let winningSquares = null;

function Board({xIsNext, squares, onPlay}) {
  let status;
  if (winningSquares) {
    status = <Typography >Winner: 
      <Typography variant="solid">{winningSquares[0]}</Typography>
    </Typography>
  } else{
    status = <Typography >Next player: 
    <Typography variant="solid">{xIsNext ? "X" : "O"}</Typography>
  </Typography>
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
  //layout squares and labels for board
  const grid = squares.map((lines, rowNum) => {
    const rowKey = squares.length-rowNum;
    const rows = lines.map((value, columnNum) => {
      const columnLetter = String.fromCharCode(columnNum+97)
      const squareKey = rowKey + columnLetter;
      const squareID = [rowNum, columnNum]
      return (
        <Square key={squareKey} squareID={squareID} value={value} fillSquare={() => handleClick(rowNum, columnNum)} />
      )
    })
    const numLabel = <Label character={rowKey}></Label>
    return (   
      <div key={rowKey} className="board-row">{numLabel}{rows}</div>
    )
  })
  //lower labels
  const letterLabels = squares[0].map((column, num) =>
    <Label character={String.fromCharCode(num+97)}></Label>
  )
  //return the board
  return (
    <>
      <div className="status">{status}</div>
      {grid}
      <div className="board-row">
        <Label character={""}></Label>
        {letterLabels}
        </div>
    </>
  );
}
function ChangeGame({setBoardHeight, setBoardWidth, boardHeight, boardWidth, setHistory, setCurrentMove}){
  const [open,setOpen] = useState(false);
  const [inputHeight,setInputHeight] = useState(boardHeight);
  const [inputWidth,setInputWidth] = useState(boardWidth);
  const [inputWinCon,setInputWinCon] = useState(winCon);
  //Change board parameters  
  function ChangeSettings(inputHeight, inputWidth, inputWinCon){
    setBoardHeight(inputHeight);
    setBoardWidth(inputWidth);
    setHistory([Array.from({length:inputHeight}, () => Array(parseInt(inputWidth)).fill(null))]);
    setCurrentMove(0);
    console.log(inputHeight, inputWidth);
    setOpen(false);
  }
  return(
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Change Settings</Button>
      <Modal open={open} onClose={()=>setOpen(false)}>
        <ModalDialog>
          <DialogTitle>New Board. New game.</DialogTitle>
          <DialogContent>You know what you're doing. Do I really need to be talking still?</DialogContent>
          <form onSubmit={(event)=> {
            event.preventDefault();
            ChangeSettings(inputHeight, inputWidth, inputWinCon)
          }}
          >
            <Stack spacing={1} direction="row">
              <FormControl error={false}>
                <FormLabel>length</FormLabel>
                <Input required defaultValue={boardWidth} onChange={event => {
                  setInputWidth(event.target.value)}}/>
              </FormControl>
              <FormControl error={false}>
                <FormLabel>height</FormLabel>
                <Input required defaultValue={boardHeight} onChange={event => {
                  setInputHeight(event.target.value)}}/>
              </FormControl>
              <FormControl error={false}>
                <FormLabel>amount in a row needed</FormLabel>
                <Input required defaultValue={winCon} onChange={event => {
                  setInputWinCon(event.target.value)}}/>
              </FormControl>
              <Button type="submit">Let's play!</Button>
            </Stack>
          </form>
        </ModalDialog>
      </Modal>
    </>
  )
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
//Light/Dark mode
function ModeToggle(){
  const {mode,setMode} = useColorScheme();
  const [mounted,setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted){
    return null;
  }
  return(
    <Button variant="outlined"
    onClick={() => {
      setMode(mode === 'light' ? 'dark' : 'light');
    }}
  >{mode === 'light' ? 'Turn dark' : 'Turn light'}</Button>
  );
}