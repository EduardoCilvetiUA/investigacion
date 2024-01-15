from flask import Flask, jsonify, send_file
import os
import random


app = Flask(__name__)
@app.route('/random_image', methods=['GET'])
def random_image():
    dataset_path = 'Datasets/IKEA/train'
    image_files = [f for f in os.listdir(dataset_path) if f.endswith('.jpg') or f.endswith('.png')]
    
    # Selecciona una imagen aleatoria
    random_image = random.choice(image_files)
    
    # Devuelve el nombre de la imagen en el JSON de la respuesta
    response_data = {
        'image_name': random_image
    }

    print

    # Devuelve la imagen como un archivo adjunto en la respuesta
    return send_file(os.path.join(dataset_path, random_image), mimetype='image/jpeg', as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)