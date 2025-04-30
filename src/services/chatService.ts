import { v4 as uuidv4 } from 'uuid';
import aviationService, { FlightSearch, Flight } from './aviationService';

// Types
export interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  flightData?: any;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  context: {
    departure?: string;
    arrival?: string;
    date?: string;
    passengers?: number;
    searchStage?: string;
  };
}

// Initial welcome messages
export const getInitialMessages = (): Message[] => [
  {
    id: uuidv4(),
    text: "Hello! I'm SkyChat, your personal flight booking assistant. How can I help you today?",
    isBot: true,
    timestamp: new Date()
  }
];

// Process user message and generate response
export const processMessage = async (
  message: string, 
  currentState: ChatState
): Promise<{newMessages: Message[], updatedContext: any}> => {
  const userMessage: Message = {
    id: uuidv4(),
    text: message,
    isBot: false,
    timestamp: new Date()
  };
  
  const newMessages: Message[] = [userMessage];
  let updatedContext = { ...currentState.context };
  
  // Check for flight search intent
  if (
    message.toLowerCase().includes('flight') || 
    message.toLowerCase().includes('fly') ||
    message.toLowerCase().includes('travel') ||
    message.toLowerCase().includes('ticket')
  ) {
    // Ask for departure if not provided
    if (!updatedContext.departure) {
      updatedContext.searchStage = 'departure';
      newMessages.push({
        id: uuidv4(),
        text: "Great! I can help you find flights. Where would you like to depart from? (airport or city name)",
        isBot: true,
        timestamp: new Date(Date.now() + 500)
      });
    }
    // If we have departure but no arrival, ask for arrival
    else if (!updatedContext.arrival) {
      updatedContext.searchStage = 'arrival';
      newMessages.push({
        id: uuidv4(),
        text: `Got it, departing from ${updatedContext.departure}. Where would you like to fly to?`,
        isBot: true,
        timestamp: new Date(Date.now() + 500)
      });
    }
    // If we have both but no date, ask for date
    else if (!updatedContext.date) {
      updatedContext.searchStage = 'date';
      newMessages.push({
        id: uuidv4(),
        text: `Flying from ${updatedContext.departure} to ${updatedContext.arrival}. When would you like to travel?`,
        isBot: true,
        timestamp: new Date(Date.now() + 500)
      });
    }
  } 
  // Check if we're in the middle of a search flow
  else if (updatedContext.searchStage === 'departure') {
    updatedContext.departure = message;
    updatedContext.searchStage = 'arrival';
    newMessages.push({
      id: uuidv4(),
      text: `Thanks! Where would you like to fly to from ${message}?`,
      isBot: true,
      timestamp: new Date(Date.now() + 500)
    });
  }
  else if (updatedContext.searchStage === 'arrival') {
    updatedContext.arrival = message;
    updatedContext.searchStage = 'date';
    newMessages.push({
      id: uuidv4(),
      text: `Great! When would you like to travel from ${updatedContext.departure} to ${message}?`,
      isBot: true,
      timestamp: new Date(Date.now() + 500)
    });
  }
  else if (updatedContext.searchStage === 'date') {
    updatedContext.date = message;
    updatedContext.searchStage = 'searching';
    
    // Add a "searching" message
    newMessages.push({
      id: uuidv4(),
      text: `Thanks! Let me search for flights from ${updatedContext.departure} to ${updatedContext.arrival} on ${message}...`,
      isBot: true,
      timestamp: new Date(Date.now() + 500)
    });
    
    // Perform the actual search
    try {
      const search: FlightSearch = {
        departure: updatedContext.departure || "Unknown Departure",
        arrival: updatedContext.arrival || "Unknown Arrival",
        date: updatedContext.date
      };
      
      const flights = await aviationService.searchFlights(search);
      
      if (flights && flights.length > 0) {
        // First display a summary message
        newMessages.push({
          id: uuidv4(),
          text: `I found ${flights.length} flights for your trip. Here's the best option:`,
          isBot: true,
          timestamp: new Date(Date.now() + 2000),
          flightData: flights[0]
        });
        
        // Then ask if they want to see more or book this one
        newMessages.push({
          id: uuidv4(),
          text: `Would you like to see more options or book this flight?`,
          isBot: true,
          timestamp: new Date(Date.now() + 2500)
        });
        
        // Reset the search stage
        updatedContext.searchStage = 'options';
      } else {
        newMessages.push({
          id: uuidv4(),
          text: `I'm sorry, I couldn't find any flights matching your criteria. Would you like to try different dates or destinations?`,
          isBot: true,
          timestamp: new Date(Date.now() + 2000)
        });
        updatedContext.searchStage = undefined;
      }
    } catch (error) {
      newMessages.push({
        id: uuidv4(),
        text: `I'm sorry, I encountered an error while searching for flights. Please try again later.`,
        isBot: true,
        timestamp: new Date(Date.now() + 2000)
      });
      updatedContext.searchStage = undefined;
    }
  }
  // Handle booking confirmation
  else if (
    updatedContext.searchStage === 'options' && 
    (message.toLowerCase().includes('book') || message.toLowerCase().includes('this one'))
  ) {
    newMessages.push({
      id: uuidv4(),
      text: `Great choice! To proceed with booking, I'll need your passenger details. What's your full name?`,
      isBot: true,
      timestamp: new Date(Date.now() + 500)
    });
    updatedContext.searchStage = 'name';
  }
  // Handle showing more options
  else if (
    updatedContext.searchStage === 'options' && 
    message.toLowerCase().includes('more')
  ) {
    // In a real app, we would show more flight options
    // For now, we'll just show a mock response
    const mockFlight = {
      airline: "United Airlines",
      flight_number: "UA9012",
      departure_time: "02:30 PM",
      arrival_time: "05:20 PM",
      departure_airport: updatedContext.departure,
      arrival_airport: updatedContext.arrival,
      price: 389.99
    };
    
    newMessages.push({
      id: uuidv4(),
      text: `Here's another option that might work for you:`,
      isBot: true,
      timestamp: new Date(Date.now() + 500),
      flightData: mockFlight
    });
    
    newMessages.push({
      id: uuidv4(),
      text: `Would you like to book this flight or see more options?`,
      isBot: true,
      timestamp: new Date(Date.now() + 1000)
    });
  }
  // Default response for other user inputs
  else {
    newMessages.push({
      id: uuidv4(),
      text: "I'm here to help you book flights. Would you like to search for flights today?",
      isBot: true,
      timestamp: new Date(Date.now() + 500)
    });
  }
  
  return { newMessages, updatedContext };
};