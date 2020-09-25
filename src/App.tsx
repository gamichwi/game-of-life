import React, { useCallback, useRef, useState } from "react";
import produce from "immer";

import './App.css';

const numRows = 50;
const numCols = 50;

//used for neighbours logic
const operations = [
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, 0],
  [-1, 0],
];

//1 = alive, 0 = dead, dead = default.

const generateEmptyGrid = () => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numCols), () => 0));
  }

  return rows;
};

const App: React.FC = () => {
  const [grid, setGrid] = useState(() => {
    return generateEmptyGrid();
  });

  const [running, setRunning] = useState(false);

  //store the running state to be used by runSimulation
  const runningRef = useRef(running);
  runningRef.current = running;

  //usecallback so that this function is not run with every render
  const runSimulation = useCallback(() => {
    //check if running
    //if not, end.
    if (!runningRef.current) {
      return;
    }

    setGrid((currentGridValue) => {
      return produce(currentGridValue, (gridCopy) => {
        //Go through every value in the grid
        for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
          for (let colIndex = 0; colIndex < numCols; colIndex++) {
            let neighbours = 0;
            operations.forEach(([operationsRowIndex, operationsColIndex]) => {
              const newRowIndex = rowIndex + operationsRowIndex;
              const newColIndex = colIndex + operationsColIndex;
              //check we don't go below or above our bounds
              if (
                newRowIndex >= 0 &&
                newRowIndex < numRows &&
                newColIndex >= 0 &&
                newColIndex < numCols
              ) {
                neighbours += currentGridValue[newRowIndex][newColIndex];
              }
            });

            //Any live cell with two or three live neighbours lives on to the next generation.
            //Doesn't require logic

            //Any live cell with fewer than two live neighbours dies, as if by underpopulation.
            //Any live cell with more than three live neighbours dies, as if by overpopulation.
            if (neighbours < 2 || neighbours > 3) {
              gridCopy[rowIndex][colIndex] = 0;
            }
            // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
            else if (
              currentGridValue[rowIndex][colIndex] === 0 &&
              neighbours === 3
            ) {
              gridCopy[rowIndex][colIndex] = 1;
            }
          }
        }
      });
    });

    // simulate (call every 1 second)
    setTimeout(runSimulation, 100);
  }, []);

  return (
    <>
      <div
        className="container"
        style={{
          padding: "auto",
        }}
      >
        <div
          className="topbar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "auto",
          }}
        >
          <div className="title">
            <h1
              style={{
                color: "white",
                margin: "0",
                display:"flex",
                textShadow: "2px 2px salmon"
              }}
            >
              The Game of Life
            </h1>
          </div>
          <div
            className="buttons"
            style={{
              display: "flex",
            }}
          >
            <button
              style={{
                padding: "0 50px",
              }}
              onClick={() => {
                setRunning(!running);
                if (!running) {
                  runningRef.current = true;
                  runSimulation();
                }
              }}
            >
              {running ? "Stop" : "Start"}
            </button>
            <button
              style={{
                padding: "0 50px",
              }}
              onClick={() => {
                setGrid(generateEmptyGrid());
              }}
            >
              Clear
            </button>

            <button
              style={{
                padding: "0 50px",
              }}
              onClick={() => {
                const rows = [];
                for (let i = 0; i < numRows; i++) {
                  rows.push(
                    Array.from(Array(numCols), () =>
                      Math.random() > 0.7 ? 1 : 0
                    )
                  );
                }

                setGrid(rows);
              }}
            >
              Random
            </button>
          </div>
        </div>

        {/* Render the grid */}
        <div
          className="Grid"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${numCols}, 20px)`,
          }}
        >
          {grid.map((rows, rowIndex) =>
            rows.map((col, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                //colour with click
                onClick={() => {
                  //Immer will make an immutable change and generate a new grid for us
                  const newGrid = produce(grid, (gridCopy) => {
                    gridCopy[rowIndex][colIndex] = grid[rowIndex][colIndex]
                      ? 0
                      : 1;
                  });
                  setGrid(newGrid);
                }}
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: grid[rowIndex][colIndex]
                    ? "salmon"
                    : "white",
                  border: "solid 1px black",
                }}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default App;
