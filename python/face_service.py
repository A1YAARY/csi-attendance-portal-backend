from flask import Flask, request, jsonify
import face_recognition
import numpy as np
import base64
import cv2

app = Flask(__name__)

def decode_image(base64_string):
    try:
        img_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(img_data, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except:
        return None

@app.route("/")
def home():
    return "Face service running"
    

@app.route("/analyze", methods=["POST"])
def analyze():

    image = request.json.get("image")

    if not image:
        return jsonify({"error": "No image provided"}), 400

    frame = decode_image(image)

    if frame is None:
        return jsonify({"error": "Invalid base64 image"}), 401

    face_locations = face_recognition.face_locations(frame)

    if len(face_locations) == 0:
        return jsonify({"error": "No face detected"}), 402

    encoding = face_recognition.face_encodings(
        frame,
        face_locations
    )[0]

    landmarks = face_recognition.face_landmarks(frame)[0]

    # simple liveness
    left_eye = landmarks["left_eye"]
    right_eye = landmarks["right_eye"]

    eye_distance = abs(left_eye[1][1] - left_eye[5][1])

    liveness = eye_distance > 2

    return jsonify({
        "embedding": encoding.tolist(),
        "landmarks": landmarks,
        "liveness": liveness
    })


app.run(port=5001)
