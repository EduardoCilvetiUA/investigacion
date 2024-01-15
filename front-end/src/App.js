import './App.css';
import React, { useState, useRef } from 'react';
import CanvasDraw from 'react-canvas-draw';
import Button from 'react-bootstrap/Button';

function App() {
  const [brushRadius, setBrushRadius] = useState(3);
  const [brushColor, setBrushColor] = useState('black');
  const [selectedColor, setSelectedColor] = useState('black');
  const canvasRef = useRef();
  // Asumiendo que tienes un estado para la URL de datos de la imagen
  const [imageDataUrl, setImageDataUrl] = useState(null);

  // Función para obtener la URL de datos de la imagen del canvas
  const getCanvasImage = () => {
    const dataUrl = canvasRef.current.getDataURL();
    setImageDataUrl(dataUrl);
  };

  const handleSave = () => {
    getCanvasImage();
    if (canvasRef.current) {
      const data = canvasRef.current.getSaveData();
      console.log(data);

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
      <h1>Herramienta dibujo en react</h1>
      <div className ="elementos-dibujos">
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
    </div>
  );
}

export default App;
