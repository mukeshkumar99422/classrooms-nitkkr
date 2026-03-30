'use client'

import {createContext,useContext,ReactNode } from 'react'
import {Department} from '@/lib/types'

const UserContext = createContext<Department | null>(null)

export const UserProvider = ({children,value} : {children: ReactNode, value: Department | null}) =>{
    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () =>{
    const context = useContext(UserContext)
    if(context === undefined) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}