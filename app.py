from flask import Flask, render_template, request, jsonify
import ollama
import logging

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/')
def home():
    return render_template('index.html')

def get_llama_response(prompt):
    """Get response from Llama3 with error handling"""
    try:
        if not prompt or len(prompt.strip()) == 0:
            return "Please provide a valid input"
        response = ollama.chat(
            model='llama3',
            messages=[{'role': 'user', 'content': prompt}],
            options={'temperature': 0.7}
        )
        return response['message']['content']
    except Exception as e:
        logger.error(f"Llama3 Error: {str(e)}")
        return "I'm having trouble processing your request. Please try again."

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        if not user_message:
            return jsonify({"response": "Please provide a valid message"}), 400
        if len(user_message) > 1000:
            return jsonify({"response": "Message too long (1000 characters max)"}), 400
        response = get_llama_response(user_message)
        return jsonify({"response": response})
    except Exception as e:
        logger.error(f"Chat Error: {str(e)}")
        return jsonify({"response": "An internal error occurred"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
