import React, {createContext, useContext, useMemo} from "react";
import {io} from 'socket.io-client'
const SocketContext = createContext(null);

export const useSocket =()=>{
    const socket = useContext(SocketContext);//invoke the  socket for ant=yone who wants to use it
    return socket;
};

export const SocketProvider =(props)=>{
    const socket = useMemo(()=> io("localhost:8000"),[]);//configure the socket connection
    return(//provide the socket configuration to application
         <SocketContext.Provider value={socket}> 
            {props.children}
        </SocketContext.Provider>
    );
}