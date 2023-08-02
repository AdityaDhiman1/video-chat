const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const status = document.getElementById('status');
const usersDiv = document.getElementById('users');

const socket = io();

const peer = new RTCPeerConnection({
    iceServers: [
        {
            urls: "stun:stun.stunprotocol.org"
        }
    ]
});

// Add local video and audio tracks to the peer connection
const addLocalTracks = async () => {
    try {
        const localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        for (const track of localStream.getTracks()) {
            peer.addTrack(track, localStream);
        }

        localVideo.srcObject = localStream;
        localVideo.play();
    } catch (error) {
        console.error("Error accessing local media:", error);
    }
};

// Function to create a call to another user
const createCall = async (to) => {
    const status = document.getElementById('status');
    status.innerText = `Calling ${to}`;

    const localOffer = await peer.createOffer();
    await peer.setLocalDescription(new RTCSessionDescription(localOffer));

    socket.emit('outgoing:call', { fromOffer: localOffer, to });
};

peer.ontrack = (event) => {
    const status = document.getElementById('status');
    status.innerText = 'Incoming Stream';

    const stream = event.streams[0];
    remoteVideo.srcObject = stream;
    remoteVideo.play();
};

socket.on('users:joined', (id) => {
    const btn = document.createElement('button');
    const textNode = document.createTextNode(id);

    btn.id = id;
    btn.textContent = `Call ${id}`;
    btn.addEventListener('click', () => createCall(id));

    usersDiv.appendChild(btn);
});

socket.on('incomming:answere', async data => {
    const status = document.getElementById('status');
    status.innerText = 'incomming:answere';

    const { offer } = data;
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
});

socket.on('user:disconnect', id => {
    const userButton = document.getElementById(id);
    if (userButton) {
        userButton.remove();
    }
});

socket.on('incomming:call', async data => {
    const status = document.getElementById('status');
    status.innerText = 'incomming:call';

    const { from, offer } = data;

    await peer.setRemoteDescription(new RTCSessionDescription(offer));

    const answerOffer = await peer.createAnswer();
    await peer.setLocalDescription(new RTCSessionDescription(answerOffer));

    socket.emit('call:accepted', { answer: answerOffer, to: from });
});

const getAndUpdateUsers = async () => {
    usersDiv.innerHTML = '';

    try {
        const response = await fetch('/users', { method: 'GET' });
        const jsonResponse = await response.json();

        jsonResponse.forEach(user => {
            const btn = document.createElement('button');
            btn.id = user[0];
            btn.textContent = `Call ${user[0]}`;
            btn.addEventListener('click', () => createCall(user[0]));

            usersDiv.appendChild(btn);
        });
    } catch (error) {
        console.error("Error fetching users:", error);
    }
};

socket.on('hello', ({ id }) => document.getElementById('myId').innerText = id);

const init = async () => {
    // Connect to socket.io
    // You need to set up socket.io server on the backend to handle connections
    // You can use the 'socket.io-client' library on the frontend to connect to it.
    // For this example, we assume that the socket connection is established.

    // Get user media (video and audio)
    await addLocalTracks();

    // Get other users from the server and display them
    getAndUpdateUsers();
};

// Call the init function when the window is loaded
window.addEventListener('load', init);
