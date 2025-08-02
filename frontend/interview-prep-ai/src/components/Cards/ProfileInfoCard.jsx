import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../context/userContext'
import ProfileImage from '../ProfileImage'

const ProfileInfoCard = () => {
    const { user, clearUser } = useContext(UserContext)
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.clear()
        clearUser()
        navigate("/")
    }

    return (
        user && (
            <div className="flex items-center">
                {/* Show regular img tag for standard login */}
                {user.registerType !== 'google' && user.profileImageUrl && (
                    <img
                        src={user.profileImageUrl}
                        alt="User profile"
                        className="w-11 h-11 bg-gray-300 rounded-full mr-3 object-cover"
                    />
                )}
                
                {/* Show ProfileImage component for Google login */}
                {user.registerType === 'google' && (
                    <ProfileImage
                        user={user}
                        size={44}
                        className="mr-3"
                    />
                )}
                
                <div>
                    <div className="text-[15px] text-block font-bold leading-3">
                        {user.name || ""}
                    </div>
                    <button
                        className="text-purple-600 text-sm font-semibold cursor-pointer hover:underline"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>
        )
    )
}

export default ProfileInfoCard