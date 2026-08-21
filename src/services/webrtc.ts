import { sendCommandViaSocket, onSocketEvent } from './socket';

let peerConnection: RTCPeerConnection | null = null;
let cleanupFns: (() => void)[] = [];

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
  iceCandidatePoolSize: 10,
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
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  callbacks = null;
}

function createPeerConnection(): RTCPeerConnection {
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

export function startWebRTCListener() {
  cleanupWebRTC();

  const unsubOffer = onSocketEvent('webrtc:offer', async (data: unknown) => {
    const d = data as { admin_socket?: string; sdp: string; type: string; stream_type?: string };
    if (!d.sdp) return;

    const pc = createPeerConnection();

    await pc.setRemoteDescription(new RTCSessionDescription({ sdp: d.sdp, type: d.type as RTCSdpType }));

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    sendCommandViaSocket('webrtc:answer', {
      sdp: answer.sdp,
      type: answer.type,
    });
  });

  const unsubIce = onSocketEvent('webrtc:ice:remote', (data: unknown) => {
    const d = data as { candidate: RTCIceCandidateInit };
    if (d.candidate && peerConnection?.remoteDescription) {
      peerConnection.addIceCandidate(new RTCIceCandidate(d.candidate)).catch(() => {});
    }
  });

  const unsubStop = onSocketEvent('webrtc:stop', () => {
    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
      callbacks?.onDisconnected();
    }
  });

  cleanupFns.push(unsubOffer, unsubIce, unsubStop);
}

export function stopWebRTCStream() {
  sendCommandViaSocket('webrtc:stop', {});
  cleanupWebRTC();
}

export function getPeerConnection(): RTCPeerConnection | null {
  return peerConnection;
}
