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

     const handleUserCall = useCallback(async()=>{//give acess to audio and video
        const stream = await navigator.mediaDevices.getUserMedia({
            audio:true,
            video:true,
        });
        const offer = await peer.getOffer();//sends an offer  on how to setup a connection
        socket.emit("user:call",{ to: remoteSocketId, offer})
        setMyStream(stream);
     },[remoteSocketId, socket]); 

     const handleIncomingCall = useCallback(async({from ,offer})=>{//receive a call
        setRemoteSocketId(from)
        const stream = await navigator.mediaDevices.getUserMedia({//the remote id also gives access to his audio and video
            audio:true,
            video:true,
        });
        setMyStream(stream);
        console.log(`Incoming call`,from ,offer);//receiver receives the offer from sender
        const ans = await peer.getAnswer(offer)//provide my answer as my information
        socket.emit('call:accepted',{to:from, ans});
     },[]);
     const sendStreams =useCallback(()=>{
        for (const track of mystream.getTracks()){
            peer .peer.addTrack(track, mystream);
        }
     },[mystream]);

     const handleCallAccepted =useCallback(({from,ans}) =>{//consider peer as the other person on call
        peer.setLocalDescription(ans);//update your call settings by receiving answer
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




// Absolutely, let's break down this code in detail while keeping it easy to understand:

// 1. handleCallAccepted Function:

// This function is called when you've accepted a call from someone.
// Inside, it does three things:
// It tells your peer (the other person on the call) about your acceptance by setting your local description to the received ans. Think of it as updating your call settings.
// It logs a message saying "Call Accepted!" so you know the call is in progress.
// It calls the sendStreams function, which sends your audio and video to the person you're calling.
// 2. handleNegoNeeded Function:

// This function is called when it's needed to negotiate or agree on how the call should work.
// Inside:
// It asks your peer for an "offer," which is like a list of your audio and video settings.
// It sends this offer to the person you want to call (represented by remoteSocketId) through the socket.
// 3. handleNegoNeedIncoming Function:

// When you receive an "offer" from the person you want to call, this function is called.
// It does the following:
// Creates an "answer" to the received offer using your own peer.
// Sends this answer to the person who sent you the offer via the socket.
// 4. handleNegoNeedFinal Function:

// When the negotiation process is finalized and you receive a final answer (an "ans"), this function is called.
// It sets your local description to the received "ans," confirming the call's settings.
// 5. useEffect Hooks:

// The useEffect hooks are special functions in React that run when certain things happen in your component.

// The first useEffect listens for a "negotiation needed" event on your peer. When this event happens, it calls the handleNegoNeeded function. This is important for setting up the call.

// The second useEffect listens for a "track" event on your peer. When you receive tracks (audio or video data) from the person you're calling, it sets up the remote stream so you can see and hear them.

// The third useEffect sets up event listeners for various socket events like when someone joins the room, when you receive an incoming call, when a call is accepted, and when negotiation is needed or finalized. These event listeners call the corresponding functions to handle these events.

// 6. Rendering the Page:

// Finally, the code returns JSX (a way to write HTML in React) that displays a web page for your video call.
// It shows if you're connected or if no one's in the room.
// It provides buttons to send your stream, call the other person, and displays your video stream and the remote person's stream using ReactPlayer.
// In simple terms, this code manages the entire process of making a video call. It handles sending and receiving video and audio streams, negotiating call settings, and updating the user interface to show the video call's progress.





