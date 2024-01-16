import './App.css';
import React, { useState, useRef, useEffect } from 'react';
import CanvasDraw from 'react-canvas-draw';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

function App() {
  const [sketchStarted, setSketchStarted] = useState(false);

  const [brushRadius, setBrushRadius] = useState(3);
  const [brushColor, setBrushColor] = useState('black');
  const [selectedColor, setSelectedColor] = useState('black');
  const canvasRef = useRef();
  // Asumiendo que tienes un estado para la URL de datos de la imagen
  const [imageDataUrl, setImageDataUrl] = useState(null);

  const [imageData, setImageData] = useState({ datos: {}, imagen: '' })

  const handleStartSketch = () => {
    setSketchStarted(true);
  };

  const newImage = () => {
    setSketchStarted(false);
    // Limpiar los estados relacionados con la imagen actual
    setImageData(null);
    
      const fetchData = async () => {
        try {
          const response = await axios.get('/get_image');
          setImageData(response.data);
        } catch (error) {
          console.error('Error al obtener los datos:', error);
        }
      };
      fetchData();
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/get_image');
        setImageData(response.data);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };
    fetchData();
  }, []);


  const UploadToFlask = async () => {
    try {
      const blob = await fetch(imageDataUrl).then(r => r.blob());

      const formData = new FormData();
      formData.append('id', imageData.datos.id);
      formData.append('title', imageData.datos.title);
      formData.append('company', imageData.datos.company);
      formData.append('image', blob, imageData.datos.company +'_' + imageData.datos.title + '_' + imageData.datos.id + '.jpeg');

      axios.post('/upload_image', formData)
        .then(response => {
          console.log(response);
          console.log(formData)
        })
        .catch(error => {
          console.error('Error uploading image:', error);
        });
      setSketchStarted(false);
      newImage();
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  };

  // Función para obtener la URL de datos de la imagen del canvas
  const getCanvasImage = () => {
    const dataUrl = canvasRef.current.getDataURL();
    setImageDataUrl(dataUrl);
  };

  const handleSave = () => {
    getCanvasImage();
    if (canvasRef.current) {
      const data = canvasRef.current.getSaveData();
    }
  };

  const handleBrushSizeChange = (event) => {
    setBrushRadius(event.target.value);
  };

  const handleColorChange = (event) => {
    const newColor = event.target.value;
    setSelectedColor(newColor);
    setBrushColor(newColor);
  };

  const handleClearCanvas = () => {
    canvasRef.current.clear();
  };

  const undo = () => {
    canvasRef.current.undo();
  }

  const downloadImageWithWhiteBackground = () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const image = new Image();
    image.src = imageDataUrl;
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context.fillStyle = '#fff'; // color de fondo
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);

      const whiteBackgroundImageUrl = canvas.toDataURL('image/jpeg');
      const link = document.createElement('a');
      link.href = whiteBackgroundImageUrl;
      link.download = 'image.jpeg';
      link.click();
    };
  };

  return (
    <div className="App">
      {!sketchStarted && (
        <>
          <h1>Herramienta de dibujo en React</h1>
          {imageData && <h2>Nombre de la imagen: {imageData.datos.title}</h2>}
          {imageData && <img src={`data:image/jpeg;base64,${imageData.imagen}`} alt="Imagen" />}
          <Button variant="primary" onClick={handleStartSketch} style={{ marginTop: '10px' }}>
            Empezar a hacer el sketch
          </Button>
        </>
      )}
      {sketchStarted && (
        <>
          <h1>Herramienta dibujo en react</h1>
          <h2>Nombre de la imagen: {imageData.datos.title}</h2>
          <div className="elementos-dibujos">
            <div className="image-container" style={{ marginRight: '50px', display: 'flex', flexDirection: 'column' }}>
              {imageDataUrl && <img src={imageDataUrl} alt="canvas" />}
              {imageDataUrl &&
                <Button variant='primary' onClick={downloadImageWithWhiteBackground} style={{ marginTop: '10px' }}>Descargar imagen</Button>
              }
            </div>
            <div>
              <CanvasDraw
                ref={canvasRef}
                brushRadius={brushRadius}
                brushColor={brushColor}
                catenaryColor="black"
                hideGrid={true}
                hideInterface={true}
                lazyRadius={0}
                style={{ border: '3px solid #000', borderRadius: '10px' }}
              />
              <br />
            </div>
            <div style={{ marginLeft: '50px', display: 'flex', flexDirection: 'column' }}>
              <Button variant="primary" onClick={handleClearCanvas} style={{ marginTop: '10px', width: '40px', height: '40px' }}>
                <i className="bi bi-eraser-fill"></i>
              </Button>
              <Button variant="primary" onClick={undo} style={{ marginTop: '10px', width: '40px', height: '40px' }}>
                <i className="bi bi-arrow-counterclockwise"></i>
              </Button>
              <label htmlFor="brushSize">
                <i className="bi bi-brush"></i> Brush Size:
              </label>
              <input
                id="brushSize"
                type="range"
                min="1"
                max="5"
                value={brushRadius}
                onChange={handleBrushSizeChange}
                style={{ marginLeft: '5px', marginBottom: '10px' }}
              />
              <label htmlFor="colorPicker">
                <i className="bi bi-eyedropper"></i> Brush Color:
              </label>
              <input
                id="colorPicker"
                type="color"
                value={selectedColor}
                onChange={handleColorChange}
                style={{ marginLeft: '5px', marginBottom: '10px' }}
              />
              <Button variant="primary" onClick={handleSave} style={{ marginTop: '10px' }}>
                Save
              </Button>
              <br />
            </div>

          </div>
          {imageDataUrl && <Button variant='primary' onClick={UploadToFlask} style={{ marginTop: '10px' }}>Subir datos a Flask</Button>}
        </>
      )}
    </div>
  );
}

export default App;
