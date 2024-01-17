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
  const [imageData, setImageData] = useState(null)
  const [isLoading, setIsLoading] = useState(true);

  const handleStartSketch = () => {
    setSketchStarted(true);
  };

  const newImage = () => {
    setSketchStarted(false);
    // Limpiar los estados relacionados con la imagen actual
    setImageData(null);
    setIsLoading(true);

    const fetchData = async () => {
      try {
        const response = await axios.get('/get_image');
        setImageData(response.data);
        setIsLoading(false);
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
        setIsLoading(false);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };
    fetchData();
  }, []);


  const UploadToFlask = async (dataUrl) => {
    try {
      const blob = await fetch(dataUrl).then(r => r.blob());

      const formData = new FormData();
      formData.append('id', imageData.datos.id);
      formData.append('title', imageData.datos.title);
      formData.append('company', imageData.datos.company);
      formData.append('image', blob, imageData.datos.company + '_' + imageData.datos.title + '_' + imageData.datos.id + '.jpeg');

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

  const downloadImageWithWhiteBackground = (dataUrl) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const image = new Image();
    image.src = dataUrl;
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context.fillStyle = '#fff'; // color de fondo
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);

      const whiteBackgroundImageUrl = canvas.toDataURL('image/jpeg');
      // Actualizar el estado con la imagen en fondo blanco
      UploadToFlask(whiteBackgroundImageUrl);
    };
  };


  // Función para obtener la URL de datos de la imagen del canvas
  const getCanvasImage = () => {
    const dataUrl = canvasRef.current.getDataURL();
    downloadImageWithWhiteBackground(dataUrl);
  };

  const handleSave = () => {
    getCanvasImage();
  };

  //Canvas
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

  const DrawingControls = () => (
    <div className="drawing-controls">
      <Button variant="primary" onClick={handleClearCanvas} >
        <i className="bi bi-eraser-fill"></i>
      </Button>
      <Button variant="primary" onClick={undo}>
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
      <br />
    </div>
  );



  return (
    <div className="App">
      {!sketchStarted && (
        <>
          <h1>Herramienta de dibujo en React</h1>
          <div className="imagen-boton">
            {isLoading && !imageData &&
              <div className="loader-container">
                <div className="loader-1 center"><span></span></div>
              </div>
            }
            {imageData && (
              <>
                <h2>Nombre de la imagen: {imageData.datos.title}</h2>
                <div className="image-container">
                  <img src={`data:image/jpeg;base64,${imageData.imagen}`} alt="Imagen" className="responsive-image" />
                </div>
                <Button variant="primary" onClick={handleStartSketch} style={{ marginTop: '10px' }}>
                  Empezar a hacer el sketch
                </Button>
              </>
            )}

          </div>
        </>
      )}
      {sketchStarted && (
        <>
          <h1>Herramienta dibujo en react</h1>
          <h2>Nombre de la imagen: {imageData.datos.title}</h2>
          <div className="elementos-dibujos">
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
            <DrawingControls />
          </div>
          <Button variant='primary' onClick={handleSave} style={{ marginTop: '10px' }}>Subir datos a Flask</Button>
        </>
      )}
    </div>
  );
}

export default App;
