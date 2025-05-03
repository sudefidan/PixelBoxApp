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
  const [_devices, setDevices] = useState<BleDevice[]>([]); // State to store the list of devices
  const [_deviceName, setDeviceName] = useState(localStorage.getItem('deviceName') || ''); // State to store the device name
  const [connected, setConnected] = useState(false); // State to track connection status
  const [sendData, setSendData] = useState(''); // State to store data to send
  const [messages, setMessages] = useState<string[]>([]); // Store message history
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true); // Add a loading state
  const [currentFilter, setCurrentFilter] = useState(0); // Track the selected filter
  const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
  // Define filter options
  const filterOptions = [
    { value: 0, label: "Normal" },
    { value: 1, label: "Grayscale" },
    { value: 2, label: "Sepia" },
    { value: 3, label: "Negative" },
    { value: 4, label: "Warm" },
    { value: 5, label: "Cool" },
    { value: 6, label: "LUT" },
  ];

  useEffect(() => {
    let cleanup: (() => void) | null = null;
    // Use a reference to track the last message
    const messageRef = { last: '' };

    const subscription = getConnectionUpdates((state) => {
      setConnected(state);
      setLoading(false);

      // Create a new subscription only if we're connected and don't have one yet
      if (state && !cleanup) {
        subscribeString(CHARACTERISTIC_UUID, (data) => {

          // Only process if data is new and non-empty
          if (data && data !== messageRef.last) {

            if (data && data.startsWith('filter:')) {
              // Extract the filter name from the message (e.g., "filter:Normal" -> "Normal")
              const filterNumber = data.split(':')[1].trim();

              setCurrentFilter(parseInt(filterNumber)); // Update the current filter state
            } else {

              messageRef.last = data; // Update the reference

              // Add to message history (limit to last 5 messages)
              setMessages(prevMessages => {
                // Check if the new message is already the last one in the array
                if (prevMessages.length > 0 && prevMessages[prevMessages.length - 1] === data) {
                  return prevMessages; // Don't add duplicate consecutive messages
                }
                const newMessages = [...prevMessages, data];
                return newMessages.slice(-8);
              });
            }
          }
        })
          .then((unsubFn) => {
            // Store the cleanup function
            cleanup = typeof unsubFn === 'function' ? unsubFn : null;
          })
          .catch(error => {
            setErrorMessage('Error subscribing to notifications: ' + error);
          });
      }
    });

    const storedDeviceName = localStorage.getItem('deviceName');
    if (storedDeviceName) {
      setDeviceName(storedDeviceName);
    }

    // Clean up subscription when component unmounts
    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };

  }, []);

  const connectToDevice = async () => {
    try {
      await startScan((devs) => {
        setDevices(devs);
        const device = devs.find((device) => device.name === 'PixelBox');
        if (device) {
          setErrorMessage(''); // Clear any previous error message
          setDeviceName(device.name); // Set the device name
          localStorage.setItem('deviceName', device.name); // Store the device name
          connect(device.address, () => console.log('disconnected'))
            .then(async () => {
              // First send a confirmation message
              await sendString(CHARACTERISTIC_UUID, 'Connected to PixelBox!', 'withResponse');

              // Now read the initial data from the device
              try {
                const initialData = await readString(CHARACTERISTIC_UUID);
                if (initialData && initialData.startsWith('filter:')) {
                  // Extract the filter name from the message (e.g., "filter:Normal" -> "Normal")
                  const filterName = initialData.split(':')[1].trim();

                  // Find the filter option that matches this name
                  const matchingFilter = filterOptions.find(f => f.label === filterName);
                  if (matchingFilter) {
                    // Update the current filter state to match the found filter
                    setCurrentFilter(matchingFilter.value);
                  } else {
                    // If no matching filter found, just add the raw message
                    setMessages(prevMessages => {
                      const newMessages = [...prevMessages, initialData];
                      return newMessages.slice(-8);
                    });
                  }
                }
              } catch (readError) {
                console.error('Error reading initial data:', readError);
              }
            })
            .catch((error) => {
              setErrorMessage('Error sending data: ' + error);
            });
        }
      }, 10000);

    } catch (error) {
      setErrorMessage('Error scanning for devices: ' + error);
    }
  }

  const handleSendData = async () => {
    try {
      await sendString(CHARACTERISTIC_UUID, 'takephoto');
    } catch (error) {
      setErrorMessage('Error requesting image capture: ' + error);
    }
  };

  const handleFilterChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const filterValue = parseInt(e.target.value);
    setCurrentFilter(filterValue);

    try {
      await sendString(CHARACTERISTIC_UUID, `filter:${filterValue}`);
    } catch (error) {
      setErrorMessage('Error changing filter: ' + error);
    }
  };

  const handleCloseModal = () => {
    setErrorMessage('');
    stopScan();
  };

  useEffect(() => {
    // Scroll to the bottom of the message feed when messages change
    const messageFeed = document.querySelector('.message-feed');
    if (messageFeed) {
      messageFeed.scrollTop = messageFeed.scrollHeight;
    }
  }, [messages]); // This will run whenever messages state changes

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
          <div className="center button-rounded">
            <button className="button" onClick={handleSendData}> <img src={cameraImage} className="camera-icon" /></button>
          </div>
          <div className="row filter-row">
            <div className="filter-selector">
              <select
                id="filter-select"
                className="filter-dropdown"
                value={currentFilter}
                onChange={handleFilterChange}
              >
                {filterOptions.map(filter => (
                  <option key={filter.value} value={filter.value} className="filter-option">
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Message feed display */}
          <div className="message-feed">
            {messages.length > 0 ? (
              messages.map((message, index) => (
                <div key={index} className="message-item">
                  {message}
                </div>
              ))
            ) : (
              <div className="empty-message">

              </div>
            )}
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