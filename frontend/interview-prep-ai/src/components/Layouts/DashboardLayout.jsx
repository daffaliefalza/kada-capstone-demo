import React, { useContext } from 'react'
import { UserContext } from '../../context/userContext'

const DashboardLayout = ({children}) => {
  const {user} = useContext(UserContext)
  return (
    <div>

      {user && <div>{children}</div>}
    </div>
  )
}

export default DashboardLayout