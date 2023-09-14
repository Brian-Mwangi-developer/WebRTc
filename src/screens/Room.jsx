import React, {useCallback, useEffect, useState} from 'react'
import { useSocket } from '../context/SocketProvider'
import ReactPlayer from 'react-player';
import peer from '../service/peer';

const RoomPage = () => {

    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [mystream, setMyStream] = useState();
    const [remoteStream, setRemoteStream] = useState();


    const handleUSerJoined  = useCallback(({email,id}) =>{// when another use joins the same room do the below 
        console.log(`Email:${email} joined room`);
        setRemoteSocketId(id)
    },[]);

     const handleUserCall = useCallback(async()=>{
        const stream = await navigator.mediaDevices.getUserMedia({
            audio:true,
            video:true,
        });
        const offer = await peer.getOffer();//receive an offer  on how to setup a connection
        socket.emit("user:call",{ to: remoteSocketId, offer})
        setMyStream(stream);
     },[remoteSocketId, socket]); 

     const handleIncomingCall = useCallback(async({from ,offer})=>{
        setRemoteSocketId(from)
        const stream = await navigator.mediaDevices.getUserMedia({
            audio:true,
            video:true,
        });
        setMyStream(stream);
        console.log(`Incoming call`,from ,offer);//send to the peer request to join call witht the video info
        const ans = await peer.getAnswer(offer)
        socket.emit('call:accepted',{to:from, ans});
     },[]);
     const sendStreams =useCallback(()=>{
        for (const track of mystream.getTracks()){
            peer .peer.addTrack(track, mystream);
        }
     },[mystream]);

     const handleCallAccepted =useCallback(({from,ans}) =>{
        peer.setLocalDescription(ans);
        console.log("Call Accepted!");
        sendStreams();
     },[sendStreams]);
 
     const handleNegoNeeded =useCallback(async()=>{
        const offer = await peer.getOffer();
        socket.emit('peer:nego:needed',{offer, to: remoteSocketId})
     },[remoteSocketId,socket]); 

     const handleNegoNeedIncoming = useCallback(async({from,offer})=>{
        const ans = await peer.getAnswer(offer);
        socket.emit('peer:nego:done', {to: from ,ans})
     },[socket]);

      const handleNegoNeedFinal = useCallback(async({ans})=>{
        peer.setLocalDescription(ans);
      },[]);

     useEffect(()=>{
        peer.peer.addEventListener('negotiationneeded',handleNegoNeeded);
        return () =>{
            peer.peer.removeEventListener('negotiationneeded',handleNegoNeeded);
        }
     },[handleNegoNeeded]);
 
     useEffect(() =>{
        peer.peer.addEventListener('track', async ev =>{
            const remoteStream = ev.streams;
            console.log("Got Tracks!!");
            setRemoteStream(remoteStream[0]);
        });
     },[])
    useEffect(()=>{
        socket.on('user:joined',handleUSerJoined);
        socket.on('incoming:call',handleIncomingCall);
        socket.on('call:accepted',handleCallAccepted)
        socket.on('peer:nego:needed',handleNegoNeedIncoming)
        socket.on('peer:nego:final',handleNegoNeedFinal)

        return ()=>{
            socket.off('user:joined',handleUSerJoined);
            socket.off('incoming:call',handleIncomingCall);
            socket.off('call:accepted',handleCallAccepted)
            socket.off('peer:nego:needed',handleNegoNeedIncoming)
            socket.off('peer:nego:final',handleNegoNeedFinal)

        }
    }, [socket,handleUSerJoined, handleIncomingCall,handleCallAccepted,handleNegoNeedIncoming,handleNegoNeedFinal]);
  return (
    <div>
    <h1>RoomPage</h1>
    <h4>{remoteSocketId ? "Connected":"No one in the room"}</h4>
    {mystream && <button onClick={sendStreams} className='buttonsubmit'>Send Stream </button>}
    {remoteSocketId && <button className='buttonsubmit'onClick={handleUserCall}>CALL</button>}
    {
        mystream && (
        <>
        <h1>My Stream</h1>
        <ReactPlayer playing 
        muted height="200px" 
        width="400px"
         url ={mystream}/>
        </>
    )}
     {
        remoteStream && (
        <>
        <h1>Remote Stream</h1>
        <ReactPlayer playing 
        muted height="200px" 
        width="400px"
         url ={remoteStream}/>
        </>
    )}
    </div>
  )
}

export default RoomPage