// class PeerService {
//   constructor() {
//     if (!this.peer) {
//       this.peer = new RTCPeerConnection({
//         iceServers: [
//           {
//             urls: [
//               "stun:stun.l.google.com:19302",
//               "stun:global.stun.twilio.com:3478",
//             ],
//           },
//         ],
//       });
//     }
//   }

//   async getAnswer(offer) {
//     if (this.peer) {
//       await this.peer.setRemoteDescription(offer);
//       const ans = await this.peer.createAnswer();
//       await this.peer.setLocalDescription(new RTCSessionDescription(ans));
//       return ans;
//     }
//   }

//   async setLocalDescription(ans) {
//     if (this.peer) {
//       await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
//     }
//   }

//   async getOffer() {
//     if (this.peer) {
//       const offer = await this.peer.createOffer();
//       await this.peer.setLocalDescription(new RTCSessionDescription(offer));
//       return offer;
//     }
//   }
// }

// export default new PeerService();


///////////////


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
          },
        ],
      });
    }
  }

  // Host creates offer
  async getOffer() {
    const offer = await this.peer.createOffer();

    await this.peer.setLocalDescription(offer);

    console.log(
      "Offer Created | State:",
      this.peer.signalingState
    );

    return offer;
  }

  // Joiner receives offer and creates answer
  async getAnswer(offer) {

    console.log(
      "Before setRemoteDescription:",
      this.peer.signalingState
    );

    if (this.peer.signalingState !== "stable") {
      console.warn("Ignoring duplicate offer");
      return;
    }

    await this.peer.setRemoteDescription(offer);

    const answer = await this.peer.createAnswer();

    await this.peer.setLocalDescription(answer);

    console.log(
      "Answer Created | State:",
      this.peer.signalingState
    );

    return answer;
  }

  // Host receives answer
  async setLocalDescription(answer) {

    console.log(
      "Before Applying Answer:",
      this.peer.signalingState
    );

    if (this.peer.signalingState !== "have-local-offer") {
      console.warn(
        "Answer ignored. Current State:",
        this.peer.signalingState
      );
      return;
    }

    await this.peer.setRemoteDescription(answer);

    console.log(
      "Answer Applied | State:",
      this.peer.signalingState
    );
  }
}

export default new PeerService();