import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import { useEffect, useState } from "react";
import { getVersion } from '@tauri-apps/api/app';
import { BleDevice, getConnectionUpdates, startScan, sendString, readString, stopScan, connect, subscribeString } from '@mnlphlp/plugin-blec';
import BackHomeLink from "./components/BackHomeLink";
import ErrorModal from "./components/ErrorModal"; // Import the ErrorModal component
import cameraImage from "../images/photo-camera.png";
import rollGreenImage from "../images/roll-green.png";
import rollPinkImage from "../images/roll-pink.png";
import rollGreyImage from "../images/roll-grey.png";
import rollBlueImage from "../images/roll-blue.png";
import infoImage from "../images/info.png";

function Home() {
  return (
    <main className="container">
      <h1>PixelBox</h1>
      <Link to="/my-cameras" className="box">
        <h2>MY CAM</h2>
        <img src={cameraImage} className="camera-icon" />
      </Link>
      <Link to="/lab" className="box">
        <h2>LAB</h2>
        <img src={rollGreyImage} className="roll-icon" />

      </Link>
      <Link to="/info" className="box">
        <h2>INFO</h2>
        <img src={infoImage} className="info-icon" />
      </Link>

    </main>
  );
}

function MyCamera() {
  const [_devices, setDevices] = useState<BleDevice[]>([]);
  const [_deviceName, setDeviceName] = useState(localStorage.getItem('deviceName') || '');
  const [connected, setConnected] = useState(false);
  const [sendData, setSendData] = useState('');
  const [recvData, setRecvData] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true); // Add a loading state
  const [imageData, setImageData] = useState<Uint8Array | null>(null);
  const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

  useEffect(() => {
    getConnectionUpdates((state) => {
      setConnected(state);
      setLoading(false); // Set loading to false once the connection status is determined
    });
    const storedDeviceName = localStorage.getItem('deviceName');
    if (storedDeviceName) {
      setDeviceName(storedDeviceName);
    }
  }, []);

  const connectToDevice = async () => {
    try {
      await startScan((devs) => {
        setDevices(devs);
        setErrorMessage('Devices set!');
        const device = devs.find((device) => device.name === 'PixelBox');
        if (device) {
          setDeviceName(device.name); // Set the device name
          localStorage.setItem('deviceName', device.name); // Store the device name
          connect(device.address, () => console.log('disconnected'))
            .then(() => sendString(CHARACTERISTIC_UUID, 'Test', 'withResponse'))
            .catch((error) => {
              setErrorMessage('Error sending data: ' + error);
            });
        } else {
          setErrorMessage('PixelBox not found! Please try again later ...');
        }
      }, 10000);
    } catch (error) {
      setErrorMessage('Error scanning for devices: ' + error);
    }
  };

  const handleSendData = async () => {
    try {
      await sendString(CHARACTERISTIC_UUID, sendData);
    } catch (error) {
      setErrorMessage('Error sending data: ' + error);
    }
  };

  const handleReadData = async () => {
    try {
      const data = await readString(CHARACTERISTIC_UUID);
      if (!data) {
        setErrorMessage('No data received from the device.');
      } else {
        setRecvData(data);
      }
    } catch (error) {
      setErrorMessage('Error reading data: ' + error);
    }
  };

  const handleCloseModal = () => {
    setErrorMessage('');
    stopScan();
  };

  return (
    <div className="container">
      <h1>My Cam</h1>
      {loading ? ( // Show a loading indicator while determining connection status
        <div className="page-view">
        </div>
      ) : !connected ? (
        <div className="page-view">
          <p>
            <strong>Your camera is missing in action! </strong>
            <br /><br />
            Connect now to start shooting.
          </p>
          <div className="button-container ">
            <button className="button" onClick={connectToDevice}>Connect</button>
          </div>
        </div>
      ) : (
        <div className="page-view">
          <div className="center">
            <img src={cameraImage} className="roll-icon" />
          </div>
          <div className="row">
            <input value={sendData} onChange={(e) => setSendData(e.target.value)} placeholder="Send data" />
            <button onClick={handleSendData}>Send</button>
          </div>
          <div className="row">
            <input value={recvData} readOnly />
            <button onClick={handleReadData}>Read</button>
          </div>
        </div>
      )}
      {errorMessage && (
        <ErrorModal
          message={errorMessage}
          onClose={handleCloseModal}
        />
      )}
      <BackHomeLink />
    </div>
  );
}

function Lab() {
  return (
    <div className="container">
      <h1>Lab</h1>
      <div className="page-view">
        <div className="lab-rolls">
          <img src={rollBlueImage} className="roll-icon" />
          <img src={rollGreenImage} className="roll-icon" />
          <img src={rollPinkImage} className="roll-icon" />
          <img src={rollGreyImage} className="roll-icon" />
          <img src={rollBlueImage} className="roll-icon" />
          <img src={rollGreenImage} className="roll-icon" />
          <img src={rollPinkImage} className="roll-icon" />
          <img src={rollGreyImage} className="roll-icon" />

          <img src={rollGreenImage} className="roll-icon" />
          <img src={rollPinkImage} className="roll-icon" />
          <img src={rollGreyImage} className="roll-icon" />

          <img src={rollBlueImage} className="roll-icon" />
          <img src={rollGreenImage} className="roll-icon" />
          <img src={rollPinkImage} className="roll-icon" />
          <img src={rollGreyImage} className="roll-icon" />

        </div>

      </div>
      <BackHomeLink />
    </div>
  );
}
/*
 <p>
          <strong>Your Lab looks a little quiet…</strong>
          <br></br><br></br>
          Snap some photos, let them develop, and return to see the results.</p>
*/


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
      <div className="page-view">
        <h3>App Version: {version}</h3>
      </div>
      <BackHomeLink />
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