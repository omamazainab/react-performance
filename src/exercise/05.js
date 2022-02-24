// Optimize context value
// http://localhost:3000/isolated/exercise/05.js

import * as React from 'react'
import {
  useForceRerender,
  useDebouncedState,
  AppGrid,
  updateGridState,
  updateGridCellState,
} from '../utils'

const AppStateContext = React.createContext()

const initialGrid = Array.from({length: 100}, () =>
  Array.from({length: 100}, () => Math.random() * 100),
)

function appReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_GRID_CELL': {
      return {...state, grid: updateGridCellState(state.grid, action)}
    }
    case 'UPDATE_GRID': {
      return {...state, grid: updateGridState(state.grid)}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function DogNameProvider({children}) {
  const [state, setState] = React.useState('')
  const value = React.useMemo(() => [state, setState], [state])
  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  )
}

function GridProvider({children}) {
  const [state, dispatch] = React.useReducer(appReducer,{grid : initialGrid})
  const value = React.useMemo(() => [state, dispatch], [state])
  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  )
}

function useAppState() {
  const context = React.useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within the AppProvider')
  }
  return context
}

function Grid() {
  const [, dispatch] = useAppState()
  const [rows, setRows] = useDebouncedState(50)
  const [columns, setColumns] = useDebouncedState(50)
  const updateGridData = () => dispatch({type: 'UPDATE_GRID'})
  return (
    <AppGrid
      onUpdateGrid={updateGridData}
      rows={rows}
      handleRowsChange={setRows}
      columns={columns}
      handleColumnsChange={setColumns}
      Cell={Cell}
    />
  )
}
Grid = React.memo(Grid)

function Cell({row, column}) {
  const [state, dispatch] = useAppState()
  const cell = state.grid[row][column]
  const handleClick = () => dispatch({type: 'UPDATE_GRID_CELL', row, column})
  return (
    <button
      className="cell"
      onClick={handleClick}
      style={{
        color: cell > 50 ? 'white' : 'black',
        backgroundColor: `rgba(0, 0, 0, ${cell / 100})`,
      }}
    >
      {Math.floor(cell)}
    </button>
  )
}
Cell = React.memo(Cell)

function DogNameInput() {
  const [state, setState] = useAppState()
  // const {dogName} = state

  function handleChange(event) {
    const newDogName = event.target.value
    setState(newDogName);
  }

  return (
    <form onSubmit={e => e.preventDefault()}>
      <label htmlFor="dogName">Dog Name</label>
      <input
        value={state}
        onChange={handleChange}
        id="dogName"
        placeholder="Toto"
      />
      {state ? (
        <div>
          <strong>{state}</strong>, I've a feeling we're not in Kansas anymore
        </div>
      ) : null}
    </form>
  )
}

function App() {
  const forceRerender = useForceRerender()
  return (
    <div className="grid-app">
      <button onClick={forceRerender}>force rerender</button>
      <div>
        <DogNameProvider>
          <DogNameInput />
        </DogNameProvider>
        <GridProvider>
          <Grid />
        </GridProvider>
      </div>
    </div>
  )
}

export default App

/*
eslint
  no-func-assign: 0,
*/
