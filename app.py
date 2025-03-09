from flask import Flask, request, jsonify
from google import genai
import os

app = Flask(__name__)




# Now, we define a route for the chatbot response
@app.route('/chat', methods=['POST'])

def chat():
    data = request.json
    user_input = data.get('message','')

    if not user_input:
        return jsonify({"error": "You need to input a message"})
    
    client = genai.Client(api_key="AIzaSyCWPeEuRQulhLkpVqFC6OLxfZKP1PZ1pRI")
    response = client.models.generate_content(
        model="gemini-2.0-flash",  # Use the appropriate model
        contents=user_input
    )
    return jsonify({"response": response.text})




# A checkpoint to check if the server is working
@app.route("/", methods=['GET'])

def checking():
    return jsonify({"message": "Server is working" })




if __name__ == "__main__":
    app.run(debug=True, use_reloader=True)
