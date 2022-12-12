import './App.css';
import Canvas from './components/Canvas/Canvas';

const draw = (context: CanvasRenderingContext2D) => {
  //
}

const App = () => {
  return (
    <div className="App" style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
      <Canvas draw={draw} width={200} height={200} />
    </div>
  );
}

export default App;
