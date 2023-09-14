class PeerService {
    constructor() {
        if (!this.peer) {
            this.peer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [
                            "stun:stun.l.google.com:19302",
                            "stun:global.stun.twilio.com:3478",
                        ],
                    }
                ]

            })
        }
    }
    async getAnswer(offer) {//This answer contains information about your audio and video settings in response to the offer.
        if (this.peer) {
            await this.peer.setRemoteDescription(offer)
            const ans = await this.peer.createAnswer()
            await this.peer.setLocalDescription(new RTCSessionDescription(ans));
            return ans;

        }
    }
    async setLocalDescription(ans) {//set Remote description is used to store  information about communication
        if (this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
        }
    }

    async getOffer() {//This offer contains information about your audio and video 
        //settings and how the call should be set up.
        if (this.peer) {//setLocalDescription is used to send your preferences 
            const offer = await this.peer.createOffer()
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));//RTCSessionDescription holds all the information needed for conversation or connection
            return offer;
        }
    }
}

export default new PeerService();
