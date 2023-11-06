import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { v4 as uuidv4 } from 'uuid';
import WorkoutTable from './WorkoutTable';
import OutlineGenerator from './OutlineGenerator';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button, Offcanvas, Accordion, Modal } from 'react-bootstrap';

// Needed only for logging, but leave them here!:
import Dropdown from 'react-bootstrap/Dropdown';
import { prettyPrintState } from './Debugging'

const CURRENT_VERSION = '1.0'; // Increment this when you change data structure

function App() {

  const getInitialState = () => [{
    id: uuidv4(),
    name: '',
    trainingMax: '',
    weekDetails: [
      { pct: '', sets: '', reps: '' },
      { pct: '', sets: '', reps: '' },
      { pct: '', sets: '', reps: '' }
    ],
  }];

  const initializeExercises = () => {
    const savedData = localStorage.getItem('exercisesData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      // Check if the saved data version matches the current version
      if (parsedData.version === CURRENT_VERSION) {
        return parsedData.exercises;
      }
    }
    // Return initial state if nothing is saved or versions don't match
    return getInitialState();
  };

  const [exercises, setExercises] = useState(initializeExercises);

  useEffect(() => {
    // Save to localStorage with versioning
    const exercisesData = {
      version: CURRENT_VERSION,
      exercises: exercises
    };
    localStorage.setItem('exercisesData', JSON.stringify(exercisesData));
  }, [exercises]);

  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  const handleCancelReset = () => {
    setShowResetConfirmation(false);
  };

  const handleResetExercises = () => {
    setExercises(getInitialState());
    setShowResetConfirmation(false);
  };

  const handleDeleteConfirmation = () => {
    setShowResetConfirmation(true);
  };

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <header className="App-header">
          <img src="/logo512.png" alt="Workout Plan Generator Logo" className="App-logo" />
          <h1>Workout Plan Generator</h1>
          {/* <div>
            <Dropdown>
              <Dropdown.Toggle

                size="sm"
                id="debugging">
                Debugging
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => prettyPrintState(exercises)}>
                  Console Log State
                </Dropdown.Item>
                <Dropdown.Item >
                  UNK
                </Dropdown.Item>
                <Dropdown.Item >
                  UNK
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div> */}
          <Button variant="primary" onClick={handleShow}>
            Read Me!
          </Button>
        </header>
        <main className="App-content">
          <Offcanvas show={show} onHide={handleClose}>
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Usage Notes</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Accordion defaultActiveKey="5" flush>
                <Accordion.Item eventKey="0">

                  <Accordion.Header><bold>Tips</bold></Accordion.Header>
                  <Accordion.Body>
                    <p>
                      The <strong>Week #</strong> buttons in the header are drop down lists that include some handy features like Fill, Duplicate, and Delete.
                    </p>
                    <p>
                      <strong>Fill Down</strong> takes whatever value is in the topmost exercise and copies it down to all exercises for that week.
                      If your weeks use consistent percentages, sets, and reps across each exercise, this will save you time when building out your programs.
                    </p>
                    <p>
                      The <strong>☰</strong> button on the right of the exercise rows is a handle to drag and drop exercises to reorder them.
                      <i>This function is disabled on mobile.</i>
                    </p>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                  <Accordion.Header>Generate Programs</Accordion.Header>
                  <Accordion.Body>
                    <p>
                      <strong>Generate Outline</strong> creates a printable table that tells you what weights you'll use for each week.
                      It also includes a plate calculator. (Available plate selection to be added later.)
                    </p>
                    <hr></hr>
                    <p>
                      <strong>Generate Excel</strong> exports an XLSX file with two sheets:
                    </p>
                    <p>
                      <strong>Details:</strong> Each exercise is listed with all the Training Max, % of TM, Set, & Rep values that you entered here.
                    </p>
                    <p>
                      <strong>Plan:</strong> This takes the values from the details sheet and calculates the actual weights you'll use for each exercise each week.
                      These numbers are dynamic, so you can make changes to the "Details" sheet and the plan will update.
                    </p>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="5">
                  <Accordion.Header>Hi! 👋🏽</Accordion.Header>
                  <Accordion.Body>
                    <div>
                      I'm Cory!
                    </div>
                    <div>
                      I developed this app for fun and to learn some new things. Please send me feedback or feature requests and I'll see what I can do.
                    </div>
                    <div>
                      <a href="mailto:corybschneider@gmail.com?subject = Workout Program Generator Feedback" target="_blank">
                        Send Feedback
                      </a>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Offcanvas.Body>
          </Offcanvas>
          <div className="WorkoutTableWrapper">
            <WorkoutTable exercises={exercises} setExercises={setExercises} />
            <OutlineGenerator exercises={exercises} />
            <Button variant="outline-danger" className="fw-bold" onClick={handleDeleteConfirmation}>Reset Exercises</Button>
          </div>
        </main>
      </div>
      {/* Delete confirmation modal */}
      {showResetConfirmation && (
        <Modal show={showResetConfirmation} onHide={handleCancelReset}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Reset</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to reset everything? There's no turning back!
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCancelReset}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleResetExercises}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </DndProvider>
  );
}


export default App;
