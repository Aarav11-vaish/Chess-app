import { useState } from 'react'
import Game from './screen/Game';
import Landing from './screen/landing';

import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <div className='h-screen bg-slate-930'>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/game" element={<Game />} />

        </Routes>
      </BrowserRouter>




    </div>
  )
}

export default App;
