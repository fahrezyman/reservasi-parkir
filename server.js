const WebSocket = require("ws");
const controller = require("./controllerRevised.js");

// Initialize WebSocket server on port 3000
const server = new WebSocket.Server({ port: 3000 });

// Start the server
server.on("listening", () => {
  console.log("WebSocket server started on port 3000");
});

// Event listener when a connection is opened
server.on("connection", (socket) => {
  // Log when a client connects
  console.log("Client connected");

  // Event listener when a message is received from the client
  socket.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      // Process messages from the client
      if (data.type === "reserve") {
        controller.reserveParkingSpace(socket, data.spaceNumber);
      } else if (data.type === "release") {
        controller.releaseParkingSpace(socket, data.spaceNumber);
      } else if (data.type === "getAllTickets") {
        controller.getAllTickets(socket);
      }
    } catch (error) {
      console.error("Error parsing JSON message:", error);
    }
  });

  // Event listener when a connection is closed
  socket.on("close", () => {
    console.log("Client disconnected");
  });
});
