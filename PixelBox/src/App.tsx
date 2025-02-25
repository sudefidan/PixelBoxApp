import { Routes, Route, Link } from "react-router-dom";
import "./App.css";

function Home() {
  return (
    <main className="container">
        <Link to="/my-cameras" style={{backgroundColor:"red"}}>
        <h1>PixelBox</h1>
        <h2>MY CAM</h2>
        <div className="white-box">
            <p></p>
        </div>
        </Link>
        <Link to="/lab">
        <h2>LAB</h2>
        <div className="white-box">
          <p></p>
        </div>
        </Link>
        <Link to="/info">
          <h2>INFO</h2>
          <div className="white-box">
            <p></p>
          </div>
        </Link>

    </main>
  );
}

function MyCamera() {
  return (
    <div className="container">
      <h1>My Cam</h1>
      <div className="white-box">
        <p>This is a white box. Click here to go to MY CAMERAS page.</p>
      </div>
      <h2><Link to="/" className="h2">Home</Link></h2>
    </div>
  );
}

function Lab() {
  return (
    <div className="container">
      <h1>Lab</h1>
      <div className="white-box">
        <p>This is a white box. Click here to go to MY CAMERAS page.</p>
      </div>
      <h2><Link to="/" className="h2">Home</Link></h2>
    </div>
  );
}

function Info() {
  return (
    <div className="container">
      <h1>Info</h1>
      <div className="white-box">
        <p>This is a white box. Click here to go to MY CAMERAS page.</p>
      </div>
      <h2><Link to="/" className="h2">Home</Link></h2>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/my-cameras" element={<MyCamera />} />
      <Route path="/lab" element={<Lab />} />
      <Route path="/info" element={<Info />} />
    </Routes>
  );
}

export default App;