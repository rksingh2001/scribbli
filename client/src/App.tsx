import './App.css';
import Canvas from './components/Canvas/Canvas';

const App = () => {
  return (
    <div className="App" style={{ height:"100vh", display: "flex", justifyContent: "center", alignItems: "center"}}>
      <Canvas width={1000} height={600} />
    </div>
  );
}

export default App;
