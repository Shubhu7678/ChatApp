import React, { useState, useEffect } from 'react'
import User from './User'
import { useSelector } from 'react-redux'
import {fetchAllData} from '../../../services/operations/authApi'

const Users = () => {

  const { token } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);

  useEffect(() => { 

    const fetchAllUsersData = async () => { 

      const result = await fetchAllData(token);
      
      if (result) { 

        setUsers(result);
      }
        
    }

    fetchAllUsersData();

  },[])

  return (
    <div className="my-2 h-[calc(100vh-8rem)] overflow-y-auto">
      { 
        users.map((user,index) => (
           <User key={index} user={user} />
        ))
      }  
      
          {/* <User/>
          <User/>
          <User/>
          <User/>
          <User/>
          <User/>
          <User/>
          <User/>
          <User/>
          <User/>
          <User/>
          <User/>
          <User/>
          <User/>
          <User/>
          <User/>
          <User/>
          <User/>
          <User/>
          <User/> */}
    </div>
  )
}

export default Users