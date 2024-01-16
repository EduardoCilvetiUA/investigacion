from flask import Flask, jsonify, send_file, request
import os
import random
from werkzeug.utils import secure_filename
import csv
import base64

app = Flask(__name__)
@app.route('/hello', methods=['GET'])
def hello():
    return jsonify({'message': 'Hello World!'})

@app.route('/random_image', methods=['GET'])

def random_image():
    base_path = 'Datasets'
    dataset_folders = [f.path for f in os.scandir(base_path) if f.is_dir()]
    
    # Selecciona una carpeta aleatoria
    random_folder = random.choice(dataset_folders) + '\\train'
    
    image_files = [f for f in os.listdir(random_folder) if f.endswith('.jpg') or f.endswith('.png')]
    
    # Selecciona una imagen aleatoria
    random_image = random.choice(image_files)
    
    # Devuelve la imagen como un archivo adjunto en la respuesta
    return send_file(os.path.join(random_folder, random_image), mimetype='image/jpeg', as_attachment=True)

@app.route('/upload_image', methods=['POST'])
def upload_image():
    if 'id' not in request.form or 'company' not in request.form or 'title' not in request.form or 'image' not in request.files:
        return jsonify({'error': 'Missing parameters'}), 400

    id = request.form['id']
    image_name = request.form['title']
    file = request.files['image']
    company = request.form['company']

    

    # Asegúrate de que la carpeta para cargar imágenes exista
    upload_folder = 'Sketches'
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    # Guarda la imagen con un nombre seguro
    filename = secure_filename(file.filename)
    file.save(os.path.join(upload_folder, filename))

    upload_to_csv(id, filename, company)

    # Aquí puedes realizar acciones adicionales según tus necesidades
    # (por ejemplo, guardar información en una base de datos)
    return jsonify({'id': id, 'image_name': image_name, 'message': 'Image uploaded successfully'})


def upload_to_csv(id, draw_name, company):
    data = []
    with open('Datasets/'+company+'/train.csv', 'r', encoding= 'utf-8', newline='') as f:
        # Specify the delimiter as semicolon
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            if 'ProductId' in row and str(row['ProductId']) == str(id):
                row['Sketch_name'] = draw_name
                print(draw_name)
                print(company)
            data.append(row)

    fieldnames = data[0].keys()
    with open('Datasets/'+company+'/train.csv', 'w', encoding= 'utf-8', newline='') as f:
        # Specify the delimiter as semicolon
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=';')
        writer.writeheader()
        writer.writerows(data)

def buscar_id_csv(id, carpeta):
    with open('Datasets/'+carpeta+'/train.csv', 'r', encoding= 'utf-8', newline='') as f:
        # Specify the delimiter as semicolon
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            if 'ProductId' in row and str(row['ProductId']) == str(id):
                return row['Title']
    return ''


@app.route('/get_image', methods=['GET'])
def get_image():
    found = False
    while found == False:
        dataset_folders = [f.path for f in os.scandir('Datasets') if f.is_dir()]
        random_folder = random.choice(dataset_folders) + '\\train'
        segundo_folder = random_folder.split('\\')[1]
        
        image_files = [f for f in os.listdir(random_folder) if f.endswith('.jpg') or f.endswith('.png')]

        random_image = random.choice(image_files)

        id = random_image.split('_')[-1][:-4]

        #buscar id en csv
        title = buscar_id_csv(id, segundo_folder)
        if title != '':
            found = True

    with open(random_folder + '\\' + random_image, "rb") as image_file:
        random_image = base64.b64encode(image_file.read()).decode('utf-8')

    datos_json = {
        'id': id,
        'title': title,
        'company': segundo_folder,
    }


    return jsonify({'datos': datos_json, 'imagen': random_image})



if __name__ == '__main__':
    app.run(debug=True)