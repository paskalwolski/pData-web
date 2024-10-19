import { useState } from "react";

const EventSelector = ({
    setEvent,
    existingEventData,
    setSelectingSecondary,
}) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [parsedFileData, setParsedFileData] = useState(null);
    const [error, setError] = useState(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        setSelectedFile(e.target.files[0]);
        const fr = new FileReader();
        fr.onload = (e) => {
            try {
                const incomingEventData = JSON.parse(e.target.result); // Parse the JSON content

                if (existingEventData) {
                    // Ensure the car and track match
                    if (incomingEventData.track !== existingEventData.track) {
                        throw "Please choose an event that matches the selected track";
                    }
                }

                setParsedFileData(incomingEventData); // Update state with parsed JSON data
                setError(null); // Clear any previous errors
            } catch (err) {
                setError("Failed to parse JSON file"); // Handle parsing error
                setParsedFileData(null);
            }
        };
        fr.onerror = () => {
            setError("Error reading the file");
        };
        fr.readAsText(file);
    };

    return (
        <div
            className="card"
            style={{
                display: "flex",
                flexDirection: "column",
            }}
        >
            {parsedFileData && (
                <b>
                    {parsedFileData.car} on {parsedFileData.track}
                </b>
            )}
            <label
                htmlFor={"fileupload"}
                style={{
                    border: "2px solid lightgray",
                    padding: "0.4em",
                    borderRadius: "5px",
                }}
            >
                {selectedFile ? "Change Selected Event" : "Select Event +"}
            </label>
            {setSelectingSecondary && (
                <button
                    onClick={() => {
                        setEvent(existingEventData);
                        if (setSelectingSecondary) {
                            setSelectingSecondary(false);
                        }
                    }}
                >
                    Use Primary Event
                </button>
            )}
            {selectedFile && (
                <button
                    onClick={() => {
                        setEvent(parsedFileData);
                        if (setSelectingSecondary) {
                            setSelectingSecondary(false);
                        }
                    }}
                    style={{
                        border: "2px solid darkgreen",
                        backgroundColor: "green",
                        margin: "2px",
                        borderRadius: "5px",
                    }}
                >
                    Confirm {setSelectingSecondary ? "Secondary" : "Primary"}{" "}
                    Event
                </button>
            )}
            {error && (
                <div className="card" style={{ color: "red" }}>
                    {error}
                </div>
            )}
            <input
                id={`fileupload`}
                type="file"
                accept=".json"
                style={{ display: "none" }}
                onChange={handleFileSelect}
            />
        </div>
    );
};

export default EventSelector;
