import { useState } from 'react'
import Game from './screen/Game';
import Landing from './screen/Landing';
import Login from './screen/Login';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <div className='bg-slate-930 text-white'>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/game" element={<Game />} />
<Route path="/login" element={<Login/>}/>
        </Routes>
      </BrowserRouter>




    </div>
  )
}

export default App;
