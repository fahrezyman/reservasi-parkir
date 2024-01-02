const dbConnection = require("./dbConnection");

// Function to reserve a parking space
function reserveParkingSpace(socket, spaceNumber) {
  // Check if the space is available in the database
  const checkQuery = `SELECT * FROM reservations WHERE space_number = ${spaceNumber} AND status = 'released'`;

  dbConnection.query(checkQuery, (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking reservation in the database:", checkErr);
      handleDatabaseError(socket);
      return;
    }

    if (checkResult.length > 0) {
      // Update reservation status in the database to 'reserved'
      const updateQuery = `UPDATE reservations SET status = 'reserved' WHERE space_number = ${spaceNumber}`;

      dbConnection.query(updateQuery, (updateErr, updateResult) => {
        if (updateErr) {
          console.error(
            "Error updating reservation status in the database:",
            updateErr
          );
          handleDatabaseError(socket);
          return;
        }

        // Send reservation confirmation to the client
        socket.send(
          JSON.stringify({ type: "reservationConfirmed", spaceNumber })
        );

        // Notify clients about the updated ticket data
        getAllTickets(socket);
      });
    } else {
      // Parking space is already reserved, send failure message
      socket.send(
        JSON.stringify({
          type: "reservationFailed",
          spaceNumber,
          message: "Parking space is already reserved.",
        })
      );

      // Notify clients about the updated ticket data
      getAllTickets(socket);
    }
  });
}

// Function to release a parking space
function releaseParkingSpace(socket, spaceNumber) {
  // Check if the space number is reserved in the database
  const checkQuery = `SELECT * FROM reservations WHERE space_number = ${spaceNumber} AND status = 'reserved'`;

  dbConnection.query(checkQuery, (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking reservation in the database:", checkErr);
      return;
    }

    if (checkResult.length > 0) {
      // Update reservation status in the database to 'released'
      const updateQuery = `UPDATE reservations SET status = 'released' WHERE space_number = ${spaceNumber}`;

      dbConnection.query(updateQuery, (updateErr, updateResult) => {
        if (updateErr) {
          console.error(
            "Error releasing reservation from database:",
            updateErr
          );
          return;
        }

        // Send confirmation of releasing reservation to the client
        socket.send(
          JSON.stringify({
            type: "releaseConfirmed",
            spaceNumber: spaceNumber,
          })
        );

        // Notify clients about the updated ticket data
        getAllTickets(socket);
      });
    } else {
      // Send a message to the client indicating that the parking space was not found or is not reserved
      socket.send(
        JSON.stringify({
          type: "releaseFailed",
          spaceNumber: spaceNumber,
          message: "Parking space not found or is not reserved.",
        })
      );
    }
  });
}

// Function to get all ticket data from the database
function getAllTickets(socket) {
  const selectQuery = "SELECT * FROM reservations";
  dbConnection.query(selectQuery, (err, results) => {
    if (err) {
      console.error("Error retrieving ticket data from database:", err);
      return;
    }

    const tickets = results.map((row) => ({
      spaceNumber: row.space_number,
      status: row.status,
    }));

    socket.send(
      JSON.stringify({
        type: "allTickets",
        tickets: tickets,
      })
    );
  });
}

// Function to handle database errors
function handleDatabaseError(socket) {
  socket.send(
    JSON.stringify({
      type: "reservationFailed",
      message:
        "An error occurred while processing the reservation. Please try again.",
    })
  );
  getAllTickets(socket);
}

module.exports = {
  reserveParkingSpace,
  releaseParkingSpace,
  getAllTickets,
};
