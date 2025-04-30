import React from "react";
import { Flight } from "../services/aviationService";

interface ChatMessageProps {
  isBot: boolean;
  text: string;
  flightData?: Flight;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ isBot, text, flightData }) => {
  return (
    <div
      style={{
        backgroundColor: isBot ? "#e0f7fa" : "#dcedc8",
        padding: "10px",
        borderRadius: "10px",
        margin: "10px 0",
        alignSelf: isBot ? "flex-start" : "flex-end",
        maxWidth: "80%",
        whiteSpace: "pre-line"
      }}
    >
      <p><strong>{isBot ? "SkyChat" : "You"}:</strong> {text}</p>

      {flightData && (
        <div style={{ marginTop: "10px", borderTop: "1px solid #ccc", paddingTop: "8px" }}>
          <p><strong>Airline:</strong> {flightData.airline}</p>
          <p><strong>Flight:</strong> {flightData.flight_number}</p>
          <p><strong>From:</strong> {flightData.departure_airport}</p>
          <p><strong>To:</strong> {flightData.arrival_airport}</p>
          <p><strong>Departs:</strong> {flightData.departure_time}</p>
          <p><strong>Arrives:</strong> {flightData.arrival_time}</p>
          <p><strong>Duration:</strong> {flightData.duration}</p>
          <p><strong>Aircraft:</strong> {flightData.aircraft}</p>
          <p><strong>Seats Left:</strong> {flightData.seat_availability}</p>
          <p><strong>Price:</strong> ₹{flightData.price}</p>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
