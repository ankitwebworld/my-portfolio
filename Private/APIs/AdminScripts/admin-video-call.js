document.addEventListener('DOMContentLoaded', () => {
    const socket = io(); // Initialize Socket.IO connection without specifying the URL

    let isJoined = false;
    let peer = null;

    const localVideo = document.getElementById('localVideo');
    const remoteVideo = document.getElementById('remoteVideo');

    socket.on('connect', () => {
        console.log('Connected to WebSocket server');
    });

    // Get user media (video and audio) and display local video
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
            localVideo.srcObject = stream;

            // Initialize SimplePeer for WebRTC connection
            peer = new SimplePeer({
                initiator: true, // Admin is the initiator
                stream: stream,
                trickle: false,
            });

            peer.on('signal', (data) => {
                if (isJoined) {
                    socket.emit('signal', { roomName: 'myRoom', signalData: data });
                }
            });

            socket.emit('joinRoom', 'myRoom');

            socket.on('signal', (signalData) => {
                if (!isJoined) {
                    peer.signal(signalData);
                    isJoined = true;
                }
            });

            peer.on('stream', (remoteStream) => {
                remoteVideo.srcObject = remoteStream;
            });

            peer.on('connect', () => {
                console.log('Peer connected');
                socket.emit('customMessage', 'Hello from admin!');
            });const socket = io('/') // Create our socket
            const videoGrid = document.getElementById('video-grid') // Find the Video-Grid element
            
            const myPeer = new Peer() // Creating a peer element which represents the current user
            const myVideo = document.createElement('video') // Create a new video tag to show our video
            myVideo.muted = true // Mute ourselves on our end so there is no feedback loop
            
            // Access the user's video and audio
            navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            }).then(stream => {
                addVideoStream(myVideo, stream) // Display our video to ourselves
            
                myPeer.on('call', call => { // When we join someone's room we will receive a call from them
                    call.answer(stream) // Stream them our video/audio
                    const video = document.createElement('video') // Create a video tag for them
                    call.on('stream', userVideoStream => { // When we recieve their stream
                        addVideoStream(video, userVideoStream) // Display their video to ourselves
                    })
                })
            
                socket.on('user-connected', userId => { // If a new user connect
                    connectToNewUser(userId, stream) 
                })
            })
            
            myPeer.on('open', id => { // When we first open the app, have us join a room
                socket.emit('join-room', ROOM_ID, id)
            })
            
            function connectToNewUser(userId, stream) { // This runs when someone joins our room
                const call = myPeer.call(userId, stream) // Call the user who just joined
                // Add their video
                const video = document.createElement('video') 
                call.on('stream', userVideoStream => {
                    addVideoStream(video, userVideoStream)
                })
                // If they leave, remove their video
                call.on('close', () => {
                    video.remove()
                })
            }
            
            
            function addVideoStream(video, stream) {
                video.srcObject = stream 
                video.addEventListener('loadedmetadata', () => { // Play the video as it loads
                    video.play()
                })
                videoGrid.append(video) // Append video element to videoGrid
            }

            peer.on('error', (err) => {
                console.error('Peer connection error:', err);
            });

            peer.on('close', () => {
                remoteVideo.srcObject = null;
                console.log('Peer connection closed');
            });
        })
        .catch((error) => {
            console.error('Error accessing media devices:', error);
        });
});
