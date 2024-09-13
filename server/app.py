from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
import PyPDF2
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

load_dotenv()

app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

class LLMService:
    def __init__(self):
        load_dotenv()
        self.apiKey = os.getenv('OPENAI_API_KEY')
        self.llm = ChatOpenAI(temperature=0)
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", 
            "You are an expert assistant specialized in analyzing and summarizing resumes. "
            "Your task is to extract detailed personal information, educational background, "
            "professional experience, skills, and any other relevant information from the resume. "
            "Provide comprehensive, well-organized answers for each section of the resume, "
            "highlighting specific details like job titles, achievements, skills, and educational qualifications. "
            "However, do not provide any information that is not explicitly requested. "
            "Your job is to only answer the specific questions asked by the user about the resume. "
            "Always keep your answers precise, focused on the question being asked, and ensure accuracy."),
            ("human", "{text}")
        ])

    def pdf_to_text(self, pdf_path):
        with open(pdf_path, 'rb') as pdf_file:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ''
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += page.extract_text()
        return text

    def analyze_text(self, text):
        response = self.llm.predict(self.prompt.format(text=text))
        return response

llm_service = LLMService()

@app.route('/')
def home():
    return "Welcome to the Flask backend server!"

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    if file and file.filename.endswith('.pdf'):
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)

        # Extract text from PDF
        pdf_text = llm_service.pdf_to_text(file_path)

        # Analyze the text using LLMService
        analysis_result = llm_service.analyze_text(pdf_text)

        return jsonify({'message': 'File uploaded and analyzed successfully', 'analysis_result': analysis_result, 'pdf_text': pdf_text}), 200

    return jsonify({'message': 'Invalid file format'}), 400

@app.route('/analyze', methods=['POST', 'OPTIONS'])
def analyze_message():
    if request.method == 'OPTIONS':
        return '', 204
    
    data = request.get_json()
    user_message = data.get('text')
    analysis_result = data.get('analysis_result')

    # Your existing code to process the message
    response = llm_service.analyze_text(f"{analysis_result}\n{user_message}")

    return jsonify({'message': response})

@app.errorhandler(Exception)
def handle_exception(e):
    app.logger.error(f"Unhandled exception: {str(e)}")
    return jsonify(error=str(e)), 500

if __name__ == '__main__':
    app.run(debug=True)
