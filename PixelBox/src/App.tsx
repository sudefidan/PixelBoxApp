import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import { useEffect, useState } from "react";
import { getVersion } from '@tauri-apps/api/app';

function Home() {
  return (
    <main className="container">
      <h1>PixelBox</h1>
      <Link to="/my-cameras">
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
        <p>
          <strong>Your camera is missing in action! </strong>
          <br></br><br></br>
          Connect now to start shooting.</p>
      </div>
      <div className="button-container">
      <h2><Link to="/" className="button">Connect</Link></h2>
      </div >
      <Link to="/" className="back-to-home">Home</Link>
    </div>
  );
}

function Lab() {
  return (
    <div className="container">
      <h1>Lab</h1>
      <div className="white-box">
        <p>
          <strong>Your Lab looks a little quiet…</strong>
          <br></br><br></br>
          Snap some photos, let them develop, and return to see the results.</p>
      </div>
      <Link to="/" className="back-to-home">Home</Link>
    </div>
  );
}

function Info() {
  const [version, setVersion] = useState("");

  useEffect(() => {
    const fetchVersion = async () => {
      const version = await getVersion();
      setVersion(version);
    };

    fetchVersion();
  }, []);

  return (
    <div className="container">
      <h1>Info</h1>
      <div className="white-box">
        <p></p>
      </div>
      <h3>App Version: {version}</h3>
      <Link to="/" className="back-to-home">Home</Link>
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