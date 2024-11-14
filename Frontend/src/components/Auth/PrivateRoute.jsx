import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';

const PrivateRoute = ({children}) => {

  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();


  useEffect(() => { 

    if (!token) { 

      navigate('/login');
    }  

  },[token,navigate])

    if (token) {

        return children
    }
    else { 

      return null;
    }

  return (
    <div></div>
  )
}

export default PrivateRoute