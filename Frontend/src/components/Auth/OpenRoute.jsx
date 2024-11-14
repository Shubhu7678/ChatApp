import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';

const OpenRoute = ({children}) => {

  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => { 

    if (token) { 

      navigate('/');
    }  

  },[token,navigate])

    if (!token) {

        return children
    }
    else { 

      return null;
  }
  

  return (
    <div></div>
  )
}

export default OpenRoute