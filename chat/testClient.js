// Install socket.io-client via npm if you haven't already
// npm install socket.io-client

const io = require("socket.io-client");
const readline = require("readline");

// Create an interface for input and output in the console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Connect to the server
const socket = io("http://localhost:3000", { path: "/bot" });

let currentRoomId = null;

function logMessage(message) {
  console.log(message);
}

// Function to prompt user for input
function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

// Main function to handle room creation and joining, and messaging
async function main() {
  const roomTitle = await askQuestion("Enter room title: ");
  if (!roomTitle) {
    logMessage("⚠️ Please enter a room title.");
    process.exit();
  }

  console.log("Creating a new room...");
  socket.emit("create room", { title: roomTitle });

  // Listen for room creation
  socket.on("room created", (data) => {
    currentRoomId = data.cr_id;
    console.log(`Room created with ID: ${currentRoomId} and title: ${data.title}`);

    // Join the created room
    socket.emit("join room", { cr_id: currentRoomId });
  });

  // Listen for successful room join
  socket.on("room joined", (data) => {
    console.log(`✅ Successfully joined room: ${data.cr_id} - ${data.title}`);
    logMessage(`You joined the room "${data.title}"`);

    // Start message loop
    messageLoop();
  });

  // Listen for messages from the server
  socket.on("chat message", (data) => {
    logMessage(`🤖 AI Bot: ${data.answer}`);
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error("Socket error:", error);
    logMessage(`❌ Error: ${error.message || error}`);
  });
}

// Function to handle message sending in a loop
async function messageLoop() {
  while (true) {
    const msg = await askQuestion("Type your message: ");
    if (msg && currentRoomId) {
      console.log(`Sending message: ${msg}`);
      socket.emit("chat message", { roomId: currentRoomId, msg });
      logMessage(`🧑‍💻 You: ${msg}`);
    } else {
      logMessage("⚠️ Please enter a message and ensure you're in a room.");
    }
  }
}

// Start the main function
main();



// 서버 클라이언트 통신
// cors 오류 발생
//     프로토폴이 다를 때 (http https)
//     port, ip 가 다를 때
//     host 가ㅏ 다를 때
// 도메인을 파거나 같은 데 대역에서 실행해야 함
