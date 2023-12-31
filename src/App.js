import { useEffect, useState, useRef } from "react";
import Button from '@mui/joy/Button';
import Sheet from '@mui/joy/Sheet';
import { CssVarsProvider, useColorScheme } from '@mui/joy/styles';
import { CssBaseline, ListItem } from "@mui/joy";
import Typography from '@mui/joy/Typography';
import List from '@mui/joy/List';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import Stack from '@mui/joy/Stack';
import Switch from '@mui/joy/Switch';

function Square({squareID, value, fillSquare, winningSquares}) {
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

class BoardState{
  constructor(board, isGravityDrop, gravityWeightedIndex) {  //Add (player, squareID, winningSquares)
    this.board = board;
    this.isGravityDrop = isGravityDrop;
    this.gravityWeightedIndex = gravityWeightedIndex;
  }
}

export default function Game() {  
  const defaultBoard = Array.from({length:6}, () => Array(7).fill(null));
  const [boardHistory, setHistory] = useState([new BoardState(defaultBoard, false, 0)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [winCon, setWinCon] = useState(4);
  const [winningSquares, setWinningSquares] = useState(null);
  const [gravity, setGravity] = useState(false);
  const dropCount = boardHistory.filter(item => item.isGravityDrop === true).length;
  const gravityWeightedIndex = currentMove-dropCount;
  const xIsNext = (currentMove-dropCount) % 2 === 0;
  const currentSquares = boardHistory[currentMove];

  function handlePlay(nextState){
    const nextHistory = [...boardHistory.slice(0, currentMove +1), nextState];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length-1);
  }
  function jumpTo(nextMove){
    if (winningSquares){
      stillWinner = winningSquares;
    }
    setWinningSquares(null);
    setCurrentMove(nextMove);
    if (nextMove == boardHistory.length-1){
      setWinningSquares(stillWinner);
    }
  }
  function gravityDrop(){
    let nextSquares = deepCopy(currentSquares.board);
    let isChanged = false;
    //lower all tokens
    for (let columnPos=0;columnPos<nextSquares[0].length;columnPos++){
      let emptyCells = [];
      for (let rowNum=nextSquares.length-1;rowNum>=0;rowNum--){
        let boxInQuestion = nextSquares[rowNum][columnPos];
        if (!boxInQuestion){
          emptyCells.push(rowNum);
        } else {
          if (!emptyCells.length == 0){
            isChanged = true;
            const newRow = emptyCells.shift();
            nextSquares[newRow][columnPos] = boxInQuestion;
            nextSquares[rowNum][columnPos] = null;
            emptyCells.push(rowNum);
          }
        }
      }
    }
    if (isChanged){
      //check for winner on new board (should find some way to avoid needing loop label)
      const winningList = AnyWinnerAllSquares(nextSquares, winCon);
      setWinningSquares(winningList);
      //create new board object and add to history
      const newBoard = new BoardState(nextSquares,true,gravityWeightedIndex)
      handlePlay(newBoard);
    }
    setGravity(true);
  }
  let buttonDrops = 0;
  const moves = boardHistory.map((state, move) => {
    const squares = state.board;
    let description;
    if (state.isGravityDrop){
      description = "Oh, there goes gravity!";
      buttonDrops += 1;
    } else if (move > 0) {
      //find position of move
      for (let row =0; row < squares.length; row++){
        for (let column=0; column<squares[row].length; column++){
          if (squares[row][column] != boardHistory[move-1].board[row][column]){
            //assign position to button
            const playedSquare = "" + (squares.length-row) + String.fromCharCode(column+97);
            const player = move % 2 == 0 ? ": O" : ": X" 
            description = "Move #" + (move-buttonDrops) + player + " at " + playedSquare;
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
    current = "You are on turn " + (gravityWeightedIndex+1)
  }
    return (
    <CssVarsProvider>
      <CssBaseline/>
      <ModeToggle /> 
      <div className="game">
        <Stack
          direction="column"
          alignItems="center"
          justifyContent="center"
          spacing="2">
          <Typography endDecorator={<Switch checked={gravity} onChange={(event)=> gravity ? setGravity(false) : gravityDrop()} endDecorator={gravity ? "On" : "Off"}/>}>Gravity</Typography>
          <ChangeGame currentWidth={currentSquares.board[0].length} currentHeight={currentSquares.board.length} setHistory={setHistory} setCurrentMove={setCurrentMove} winCon={winCon} setWinCon={setWinCon} setWinningSquares={setWinningSquares} />
        </Stack>
        <Sheet variant="outlined"
          className="gameBoard">
          <Board xIsNext={xIsNext} state={currentSquares} winCon={winCon} winningSquares={winningSquares} setWinningSquares={setWinningSquares} onPlay={handlePlay} gravity={gravity} gravityWeightedIndex={gravityWeightedIndex} />
        </Sheet>
      <Sheet className="gameInfo" variant="outlined"
        sx={{maxHeight: 34*(currentSquares.board.length+2),
              overflow: "scroll",}}>
        <List size="small">
          {moves}
          <Typography key='current'>{current}</Typography>
        </List>
      </Sheet>
      </div>
    </CssVarsProvider>
  )
}
function Board({xIsNext, state, onPlay, winCon, winningSquares, setWinningSquares, gravity, gravityWeightedIndex}) {
  const squares = state.board;
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
    //change row value if gravity is toggled on
    if (gravity){
      for (let i=squares.length-1;i>=0;i--){
        if (squares[i][column]){
          continue;
        } else {
          row = i
          break;
        }
      }
    } 
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
    setWinningSquares(calculateWinner(nextSquares, row, column, winCon));
    //create new state and add to history
    const playedState = new BoardState(nextSquares, false, gravityWeightedIndex);
    onPlay(playedState);
  }
  //layout squares and labels for board
  const grid = squares.map((lines, rowNum) => {
    const rowKey = squares.length-rowNum;
    const rows = lines.map((value, columnNum) => {
      const columnLetter = String.fromCharCode(columnNum+97)
      const squareKey = rowKey + columnLetter;
      const squareID = [rowNum, columnNum]
      return (
        <Square key={squareKey} squareID={squareID} value={value} winningSquares={winningSquares} fillSquare={() => handleClick(rowNum, columnNum)} />
      )
    })
    const numLabel = <Label character={rowKey}></Label>
    return (   
      <Sheet key={rowKey} className="board-row">{numLabel}{rows}</Sheet>
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
function ChangeGame({currentWidth, currentHeight, setHistory, setCurrentMove, winCon, setWinCon, setWinningSquares}){
  const [open,setOpen] = useState(false);
  const [inputHeight,setInputHeight] = useState(currentHeight);
  const [inputWidth,setInputWidth] = useState(currentWidth);
  const [inputWinCon,setInputWinCon] = useState(winCon);
  //Change board parameters  
  function ChangeSettings(inputHeight, inputWidth, inputWinCon){
    setHistory([Array.from({length:inputHeight}, () => Array(parseInt(inputWidth)).fill(null))]);
    setCurrentMove(0);
    setWinCon(parseInt(inputWinCon));
    setWinningSquares(null);
    setOpen(false);
  }
  return(
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Change Settings</Button>
      <Modal open={open} onClose={()=>setOpen(false)}>
        <ModalDialog>
          <DialogTitle>New Board. New game.</DialogTitle>
          <form onSubmit={(event)=> {
            event.preventDefault();
            ChangeSettings(inputHeight, inputWidth, inputWinCon)
          }}
          >
            <Stack spacing={1} direction="row">
              <FormControl error={false}>
                <FormLabel>length</FormLabel>
                <Input
                  required type="number"
                  defaultValue={inputWidth}
                  onChange={event => {setInputWidth(event.target.value)}}
                  slotProps={{
                    input: {
                      min: 3,
                      max: 100
                    }
                  }}/>
              </FormControl>
              <FormControl error={false}>
                <FormLabel>height</FormLabel>
                <Input
                  required type="number"
                  defaultValue={inputHeight}
                  onChange={event => {setInputHeight(event.target.value)}}
                  slotProps={{
                    input: {
                      min: 3,
                      max: 999

                    }
                  }}/>
              </FormControl>
              <FormControl error={false}>
                <FormLabel>winning straight</FormLabel>
                <Input
                  required type="number"
                  defaultValue={winCon}
                  onChange={event => {setInputWinCon(event.target.value)}}
                  slotProps={{
                    input: {
                      min: 3,
                      max: 20
                    }
                  }}/>
              </FormControl>
              <Button type="submit">Let's play!</Button>
            </Stack>
          </form>
        </ModalDialog>
      </Modal>
    </>
  )
}
function AnyWinnerAllSquares(squares, winCon){
  let winner = null;
  for (let columnPos=0;columnPos<squares[0].length;columnPos++){
    for (let rowNum=squares.length-1;rowNum>=0;rowNum--){
      if (squares[rowNum][columnPos]){
        winner = calculateWinner(squares, rowNum, columnPos, winCon);
        if (winner){
          return winner;
        }
      }
    }
  }
}
function calculateWinner(squares, rowPos, columnPos, winCon) {
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