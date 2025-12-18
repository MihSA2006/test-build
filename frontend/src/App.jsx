import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { appRoutes } from './routes/appRoutes'
import './App.css'

function App() {


  return (
    <>
      <Routes>
        {appRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={route.element}
          />
        ))}
      </Routes>
    </>
  )
}

export default App
