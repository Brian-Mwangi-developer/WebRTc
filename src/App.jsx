import { useState } from 'react'
import {Routes,Route } from 'react-router-dom'
import './App.css'
import LobbyScreen from './screens/Lobby'
import RoomPage from './screens/Room'

function App() {
  const [count, setCount] = useState(0)

  return (
      <Routes>
        <Route path='/' element={<LobbyScreen/>}/>
        <Route path='/room/:roomId' element={<RoomPage/>}/>

      </Routes>
  
  )
}

export default App;
