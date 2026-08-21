import { getSocket, onSocketEvent, sendCommandViaSocket } from './socket';

let peerConnection: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export type StreamType = 'screen' | 'camera';

interface StreamCallbacks {
  onStream: (stream: MediaStream) => void;
  onError: (error: string) => void;
  onConnected: () => void;
  onDisconnected: () => void;
}

let callbacks: StreamCallbacks | null = null;

export function initWebRTC(cbs: StreamCallbacks) {
  callbacks = cbs;
}

export function cleanupWebRTC() {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  if (localStream) {
    localStream.getTracks().forEach((t) => t.stop());
    localStream = null;
  }
  callbacks = null;
}

async function createPeerConnection(): Promise<RTCPeerConnection> {
  if (peerConnection) {
    peerConnection.close();
  }

  peerConnection = new RTCPeerConnection(ICE_SERVERS);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      sendCommandViaSocket('webrtc:ice', {
        candidate: event.candidate.toJSON(),
      });
    }
  };

  peerConnection.ontrack = (event) => {
    if (event.streams[0]) {
      callbacks?.onStream(event.streams[0]);
      callbacks?.onConnected();
    }
  };

  peerConnection.onconnectionstatechange = () => {
    const state = peerConnection?.connectionState;
    if (state === 'failed' || state === 'disconnected' || state === 'closed') {
      callbacks?.onDisconnected();
    } else if (state === 'connected') {
      callbacks?.onConnected();
    }
  };

  peerConnection.oniceconnectionstatechange = () => {
    const state = peerConnection?.iceConnectionState;
    if (state === 'failed') {
      callbacks?.onError('فشل الاتصال via WebRTC');
    }
  };

  return peerConnection;
}

export async function startWebRTCStream(deviceToken: string, streamType: StreamType) {
  const pc = await createPeerConnection();

  pc.addTransceiver('recvonly', { direction: 'recvonly' });

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  sendCommandViaSocket('webrtc:offer', {
    device_token: deviceToken,
    sdp: offer.sdp,
    type: offer.type,
    stream_type: streamType,
  });

  const unsubOffer = onSocketEvent('webrtc:answer', async (data: unknown) => {
    const d = data as { sdp: string; type: RTCSdpType };
    if (pc.signalingState === 'have-local-offer') {
      await pc.setRemoteDescription(new RTCSessionDescription(d));
    }
  });

  const unsubIce = onSocketEvent('webrtc:ice:remote', (data: unknown) => {
    const d = data as { candidate: RTCIceCandidateInit };
    if (d.candidate && pc.remoteDescription) {
      pc.addIceCandidate(new RTCIceCandidate(d.candidate)).catch(() => {});
    }
  });

  return () => {
    unsubOffer();
    unsubIce();
  };
}

export async function stopWebRTCStream() {
  if (peerConnection) {
    sendCommandViaSocket('webrtc:stop', {});
    peerConnection.close();
    peerConnection = null;
  }
  if (localStream) {
    localStream.getTracks().forEach((t) => t.stop());
    localStream = null;
  }
}

export function getPeerConnection(): RTCPeerConnection | null {
  return peerConnection;
}
