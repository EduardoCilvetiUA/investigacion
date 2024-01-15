from flask import Flask, jsonify, send_file, request
import os
import random
from werkzeug.utils import secure_filename
import csv

app = Flask(__name__)
@app.route('/hello', methods=['GET'])
def hello():
    return jsonify({'message': 'Hello World!'})

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

    # Devuelve la imagen como un archivo adjunto en la respuesta
    return send_file(os.path.join(dataset_path, random_image), mimetype='image/jpeg', as_attachment=True)

@app.route('/upload_image', methods=['POST'])
def upload_image():
    print(request.form)
    if 'id' not in request.form or 'image_name' not in request.form or 'file' not in request.files:
        return jsonify({'error': 'Missing parameters'}), 400

    id = request.form['id']
    image_name = request.form['image_name']
    file = request.files['file']

    

    # Asegúrate de que la carpeta para cargar imágenes exista
    upload_folder = 'Sketches'
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    # Guarda la imagen con un nombre seguro
    filename = secure_filename(file.filename)
    file.save(os.path.join(upload_folder, filename))

    print(image_name)
    upload_to_csv(id, image_name)

    # Aquí puedes realizar acciones adicionales según tus necesidades
    # (por ejemplo, guardar información en una base de datos)
    return jsonify({'id': id, 'image_name': image_name, 'message': 'Image uploaded successfully'})


def upload_to_csv(id, draw_name):
    data = []
    with open('Datasets/IKEA/train.csv', 'r', encoding= 'utf-8', newline='') as f:
        # Specify the delimiter as semicolon
        reader = csv.DictReader(f, delimiter=';')
        print(str(id))
        for row in reader:
            if 'ProductId' in row and str(row['ProductId']) == str(id):
                row['Sketch_name'] = draw_name
            data.append(row)

    fieldnames = data[0].keys()
    with open('Datasets/IKEA/train.csv', 'w', encoding= 'utf-8', newline='') as f:
        # Specify the delimiter as semicolon
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=';')
        writer.writeheader()
        writer.writerows(data)


if __name__ == '__main__':
    app.run(debug=True)