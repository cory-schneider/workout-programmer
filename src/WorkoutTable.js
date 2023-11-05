import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button, Table, Dropdown, Modal } from 'react-bootstrap';
import ExerciseRow from './ExerciseRow';
import { exerciseOptions as importedExerciseOptions } from './ExerciseList';

// WorkoutTable component
const WorkoutTable = ({ exercises, setExercises }) => {

    const [weeks, setWeeks] = useState(3);

    const [exerciseOptions, setExerciseOptions] = useState(importedExerciseOptions);

    // State for the delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [deleteType, setDeleteType] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);


    const handleExerciseChange = (updatedExercise, index) => {
        const newExercises = [...exercises];
        newExercises[index] = updatedExercise;
        setExercises(newExercises);
    };

    const handleAddExercise = () => {
        const newExercise = {
            id: uuidv4(),
            name: '',
            trainingMax: '',
            weekDetails: Array.from({ length: weeks }, () => ({ pct: '', sets: '', reps: '' })),
        };
        setExercises([...exercises, newExercise]);
    };

    // Function to show the delete confirmation modal
    const handleDeleteConfirmation = (type, index) => {
        setDeleteType(type);
        setDeleteIndex(index);
        setShowConfirmation(true);
    };

    // Function to delete the exercise after confirmation
    const handleConfirmedDelete = () => {
        if (deleteType === 'exercise') {
            const newExercises = exercises.filter((_, i) => i !== deleteIndex);
            setExercises(newExercises);
        } else if (deleteType === 'week') {
            const updatedExercises = exercises.map(exercise => {
                const updatedWeekDetails = exercise.weekDetails.filter((_, index) => index !== deleteIndex);
                return { ...exercise, weekDetails: updatedWeekDetails };
            });
            setExercises(updatedExercises);
            setWeeks(prevWeeks => prevWeeks - 1);
        }
        setShowConfirmation(false);
    };

    const handleCancelDelete = () => {
        setShowConfirmation(false);
    };

    const handleCreateExerciseOption = (newExerciseName, exerciseIndex) => {
        const newOption = { label: newExerciseName, value: newExerciseName };
        // Update the exercise options state with the new option
        setExerciseOptions(currentOptions => [...currentOptions, newOption]);

        // Update the exercise's name in the exercises state array
        const updatedExercises = [...exercises];
        updatedExercises[exerciseIndex] = {
            ...updatedExercises[exerciseIndex],
            name: newExerciseName
        };
        setExercises(updatedExercises);
    };

    const handleAddWeek = () => {
        const newWeekDetail = { pct: '', sets: '', reps: '' };
        const updatedExercises = exercises.map(exercise => ({
            ...exercise,
            weekDetails: [...exercise.weekDetails, newWeekDetail]
        }));
        setExercises(updatedExercises);
        setWeeks(weeks + 1);
    };

    // Function to delete a week at a specific index
    const deleteWeek = (weekIndex) => {
        const updatedExercises = exercises.map(exercise => {
            // Filter out the week detail at the specific index for each exercise
            const updatedWeekDetails = exercise.weekDetails.filter((_, index) => index !== weekIndex);
            return { ...exercise, weekDetails: updatedWeekDetails };
        });
        // Update the state with the new exercises array
        setExercises(updatedExercises);
        // Also update the weeks state
        setWeeks(prevWeeks => prevWeeks - 1);
    };

    const handleFillDown = (weekIndex, attribute) => {
        if (exercises.length === 0 || exercises[0].weekDetails.length <= weekIndex) {
            return; // No exercises or weekIndex is out of bounds.
        }

        // Get the topmost value of the specified attribute.
        const topmostValue = exercises[0].weekDetails[weekIndex][attribute];

        // Only proceed if the topmost value is not empty.
        if (topmostValue !== '') {
            const updatedExercises = exercises.map(exercise => {
                // Create a new object for weekDetails to avoid direct state mutation.
                const newWeekDetails = [...exercise.weekDetails];
                // Update the specified attribute for the given week index.
                newWeekDetails[weekIndex] = { ...newWeekDetails[weekIndex], [attribute]: topmostValue };
                return { ...exercise, weekDetails: newWeekDetails };
            });

            setExercises(updatedExercises); // Update the exercises state with the new values.
        }
    };


    const duplicateWeek = (weekIndex) => {
        if (weekIndex < 0 || weekIndex >= weeks) {
            console.error('Week index is out of bounds.');
            return;
        }

        const updatedExercises = exercises.map(exercise => {
            // Split the weekDetails at the specified index.
            const weekDetailsBefore = exercise.weekDetails.slice(0, weekIndex + 1);
            const weekDetailsAfter = exercise.weekDetails.slice(weekIndex + 1);

            // Duplicate the week detail at the index.
            const duplicatedWeekDetail = { ...exercise.weekDetails[weekIndex] };

            // Insert the duplicated week detail into the weekDetails array.
            const updatedWeekDetails = [
                ...weekDetailsBefore,
                duplicatedWeekDetail,
                ...weekDetailsAfter
            ];

            return { ...exercise, weekDetails: updatedWeekDetails };
        });

        // Update exercises with the new weekDetails containing the duplicated week.
        setExercises(updatedExercises);

        // Increment the weeks count since we've added a new week.
        setWeeks(weeks + 1);
    };

    // Function to move rows for drag-and-drop functionality
    const moveRow = useCallback(
        (dragIndex, hoverIndex) => {
            const dragRow = exercises[dragIndex];
            const updatedExercises = [...exercises];
            updatedExercises.splice(dragIndex, 1); // Remove the item from its original position
            updatedExercises.splice(hoverIndex, 0, dragRow); // Insert the item at the new position
            setExercises(updatedExercises);
        },
        [exercises],
    );

    // Prepare the dropdowns for the table header
    const weekHeaderDropdowns = Array.from({ length: weeks }, (_, index) => (
        <Dropdown key={index}>
            <Dropdown.Toggle
                variant="outline-dark"
                size="sm"
                className="fw-bold"
                id={`dropdown-week-${index + 1}`}>
                Week {index + 1}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                <Dropdown.Item onClick={() => duplicateWeek(index)}>
                    Duplicate Week
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleFillDown(index, 'pct')}>
                    Fill Down %
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleFillDown(index, 'sets')}>
                    Fill Down Sets
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleFillDown(index, 'reps')}>
                    Fill Down Reps
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleDeleteConfirmation('week', index)}>
                    Delete Week
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    ));

    // Render the WorkoutTable component
    return (
        <DndProvider backend={HTML5Backend}>
            <Table bordered hover responsive="sm">
                <thead>
                    <tr>
                        <th>
                            {/* <span
                                onClick={handleAddExercise}> ➕
                            </span> */}
                            <Button
                                variant="outline-dark"
                                size="sm"
                                className="fw-bold"
                                onClick={handleAddExercise}>
                                Exercise ➕
                            </Button>
                        </th>
                        <th>Training Max</th>
                        {weekHeaderDropdowns.map((dropdown, index) => (
                            <th key={index}>{dropdown}</th>
                        ))}
                        <th className="text-start">
                            <Button
                                variant="outline-dark"
                                size="sm"
                                className="fw-bold"
                                onClick={handleAddWeek}>
                                Week ➕
                            </Button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {exercises.map((exercise, index) => (
                        <ExerciseRow
                            key={exercise.id}
                            exercise={exercise}
                            index={index}
                            onExerciseChange={(updatedExercise) => handleExerciseChange(updatedExercise, index)}
                            onDeleteExercise={() => handleDeleteConfirmation('exercise', index)}
                            exerciseOptions={exerciseOptions}
                            onCreateExerciseOption={(newExerciseName, exerciseIndex) => handleCreateExerciseOption(newExerciseName, exerciseIndex)}
                            moveRow={moveRow}
                        />
                    ))}
                </tbody>

            </Table>
            {/* Delete confirmation modal */}
            {showConfirmation && (
                <Modal show={showConfirmation} onHide={handleCancelDelete}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Deletion</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to delete this {deleteType === 'exercise' ? 'exercise' : 'week'}?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCancelDelete}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleConfirmedDelete}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </DndProvider>
    );

};

// Export the WorkoutTable component
export default WorkoutTable;
