import React from 'react'
import Home from './Pages/Home'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './Pages/Signup';
import Login from './Pages/Login';
import OpenRoute from './components/Auth/OpenRoute';
import PrivateRoute from './components/Auth/PrivateRoute';
import Loading from './components/Common/Loading';

const App = () => {
  return (
    <>
      <Routes>

        <Route path="/" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        <Route path="/signup" element={
          <OpenRoute>
            <Signup />
          </OpenRoute>
        }
        />
        <Route path='/login' element={
          <OpenRoute>
            <Login />
          </OpenRoute>
        }
        />

        <Route path="*" element={<h1>Page Not Found</h1>} />
      </Routes>
      {/* <Loading/> */}

    </>

  )
}

export default App