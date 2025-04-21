// Basic Vercel serverless function handler for diagnosis
export default function handler(request, response) {
  console.log("--- api/auth.js basic handler invoked ---"); 
  console.log("Request URL:", request.url);
  // Send a simple success response
  response.status(200).json({ message: 'Auth endpoint test successful!' }); 
}
