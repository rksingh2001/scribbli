import Canvas from "../../components/Canvas/Canvas"

const DrawingPage = () => {
  return (
    <div 
        className="drawing-page" 
        style={{ 
          height:"100vh", 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center"
        }}
      >
        <Canvas width={800} height={500} />
    </div>
  )
}

export default DrawingPage