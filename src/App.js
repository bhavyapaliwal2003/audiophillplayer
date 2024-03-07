import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import { StrictModeDroppable } from './StrictModeDroppable';

function App() {
 const [audioFiles, setAudioFiles] = useState([]);
 const [isPlaying, setIsPlaying] = useState(false);
 const [volume, setVolume] = useState(1); // Global volume level
 const audioCtx = useRef(new AudioContext());
 const gainNodeRef = useRef(); // Reference to the gain node

 const handleUpload = (event) => {
    const files = Array.from(event.target.files);
    setAudioFiles(prevFiles => [...prevFiles, ...files]);
 };

 const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(audioFiles);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setAudioFiles(items);
 };

 useEffect(() => {
    if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = volume;
    }
 }, [volume]);

 const playAudioFilesInSequence = async (audioBuffers) => {
    let startTime = audioCtx.current.currentTime;
    const gainNode = audioCtx.current.createGain(); // Create a gain node for volume control
    gainNode.gain.value = volume; // Set the initial volume level
    gainNodeRef.current = gainNode; // Store the gain node reference

    audioBuffers.forEach(buffer => {
      const source = audioCtx.current.createBufferSource();
      source.buffer = buffer;
      source.connect(gainNode); // Connect the source to the gain node
      gainNode.connect(audioCtx.current.destination); // Connect the gain node to the destination
      source.start(startTime);
      startTime += buffer.duration;
    });
 };

 const handlePlay = async () => {
    setIsPlaying(true);
    try {
      if (audioCtx.current.state === 'suspended') {
        await audioCtx.current.resume();
      }
      const audioBuffers = await loadAudioFiles(audioFiles);
      playAudioFilesInSequence(audioBuffers);
    } catch (error) {
      console.error('Error concatenating and playing audio files:', error);
      setIsPlaying(false);
    }
 };

 const handlePause = () => {
    audioCtx.current.suspend();
    setIsPlaying(false);
 };

 const loadAudioFiles = async (files) => {
    const audioBuffers = await Promise.all(files.map(file => {
      return fetch(URL.createObjectURL(file))
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioCtx.current.decodeAudioData(arrayBuffer));
    }));
    return audioBuffers;
 };

 return (
    <div className="App">
      <input type="file" accept="audio/*" onChange={handleUpload} multiple />
      <div className="track-list">
        <DragDropContext onDragEnd={onDragEnd}>
          <StrictModeDroppable droppableId="droppable">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {audioFiles.map((file, index) => (
                 <Draggable key={index} draggableId={String(index)} index={index}>
                    {(provided) => (
                      <div
                        className={`track-item ${index === 0 ? 'active-track' : ''}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {file.name}
                      </div>
                    )}
                 </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </StrictModeDroppable>
        </DragDropContext>
      </div>
      <div className="controls">
        <button onClick={handlePlay} disabled={isPlaying}>
          <FontAwesomeIcon icon={faPlay} /> Play
        </button>
        <button onClick={handlePause} disabled={!isPlaying}>
          <FontAwesomeIcon icon={faPause} /> Pause
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(e.target.value)}
        />
      </div>
    </div>
 );
}

export default App;
