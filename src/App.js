import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { v4 as uuidv4 } from 'uuid';
import WorkoutTable from './WorkoutTable';
import OutlineGenerator from './OutlineGenerator';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Accordion from 'react-bootstrap/Accordion';

// Needed only for logging, but leave them here!:
import Dropdown from 'react-bootstrap/Dropdown';
import { prettyPrintState } from './Debugging'

function App() {
  const [exercises, setExercises] = useState([
    {
      id: uuidv4(),
      name: '',
      trainingMax: '',
      weekDetails: [
        { pct: '', sets: '', reps: '' },
        { pct: '', sets: '', reps: '' },
        { pct: '', sets: '', reps: '' }
      ],
    }
  ]);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <header className="App-header">
          <h1>Workout Plan Generator</h1>
          <div>
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
          </div>
          <div>
            <Button variant="primary" onClick={handleShow}>
              Read Me!
            </Button>
          </div>
        </header>
        <main className="App-content">
          <Offcanvas show={show} onHide={handleClose}>
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Usage Notes</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Accordion defaultActiveKey="5" flush>
                <Accordion.Item eventKey="0">
                  <Accordion.Header><bold>Don't Hit Refresh!</bold></Accordion.Header>
                  <Accordion.Body>
                    <p>
                      All of your data is held only for as long as you're looking at this page.
                      Refreshing the page will start you with a blank slate.
                    </p>
                    <hr></hr>
                    <p>
                      By exporting your program as an Excel file, you will have a dynamic spreadsheet that can handle adjustments of all the key variables.
                      You can build out a basic program, then use the Excel sheet as a way to "save" your work and make changes as needed.
                    </p>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                  <Accordion.Header><bold>Week # Buttons</bold></Accordion.Header>
                  <Accordion.Body>
                    <p>
                      The Week # buttons in the header are drop down lists that include some handy features
                    </p>
                    <p>
                      Fill Down takes whatever value is in the topmost exercise and copies it down to all exercises for that week.
                    </p>
                    <p>
                      Duplicate/Delete Week are self-explanatory.
                    </p>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                  <Accordion.Header>Export Features</Accordion.Header>
                  <Accordion.Body>
                    Export to Excel.
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
          <WorkoutTable exercises={exercises} setExercises={setExercises} />
          <OutlineGenerator exercises={exercises} />
        </main>
      </div>

    </DndProvider>
  );
}


export default App;
