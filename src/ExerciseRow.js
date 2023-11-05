import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ItemTypes } from './ItemTypes'; // You'll define this object to specify draggable types
import CreatableSelect from 'react-select/creatable';
import { exerciseOptions } from './ExerciseList'; // Ensure this is correctly exported
import { Form, Row, InputGroup, Button } from 'react-bootstrap';

// This will be the draggable row component
const ExerciseRow = ({ exercise, index, onExerciseChange, moveRow, onCreateExerciseOption, onDeleteExercise }) => {
    const ref = React.useRef(null);

    const [{ isDragging }, drag, preview] = useDrag({
        type: ItemTypes.EXERCISE_ROW,
        item: { type: ItemTypes.EXERCISE_ROW, id: exercise.id, index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: ItemTypes.EXERCISE_ROW,
        hover(item, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }
            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            // Determine mouse position
            const clientOffset = monitor.getClientOffset();
            // Get pixels to the top
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%

            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }

            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }

            // Move the content
            moveRow(dragIndex, hoverIndex);
            item.index = hoverIndex; // Update the index for dragged item
        },
    });

    // Connect the drag source and the drop target to the row
    drop(ref);
    // Use the preview function to connect the entire row to the drag preview
    preview(drop(ref));

    const opacity = isDragging ? 0 : 1;


    // Function to handle exercise name selection
    const handleSelectChange = (selectedOption) => {
        const updatedExercise = {
            ...exercise,
            name: selectedOption ? selectedOption.value : '' // Ensure the selectedOption exists and use its value, otherwise empty string
        };
        onExerciseChange(updatedExercise); // Call the function passed as prop to update the parent state
    };

    // Function to handle training max change
    const handleTrainingMaxChange = (e) => {
        const updatedTrainingMax = e.target.value; // Get the new training max from the event
        if (e.target.value.length <= 4) {
            const updatedExercise = {
                ...exercise, // Spread the existing exercise to maintain its properties
                trainingMax: updatedTrainingMax // Update the trainingMax property
            };
            onExerciseChange(updatedExercise); // Call the function passed as prop to update the parent state
        }

    };

    // Generalized function to update weekDetails
    const handleWeekDetailChange = (weekIndex, field, value) => {
        if (value.length <= 3) {
            const updatedWeekDetails = exercise.weekDetails.map((detail, detailIndex) => {
                if (detailIndex === weekIndex) {
                    // Update the specific field with the new value
                    return { ...detail, [field]: value };
                }
                return detail;
            });
            // Call the function to update the parent state
            onExerciseChange({ ...exercise, weekDetails: updatedWeekDetails });
        }
    };

    // Render the input boxes for the exercise row
    return (
        <tr className="exercise-row" ref={ref} style={{ opacity }}>
            <td>
                <CreatableSelect
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 1 }) }}
                    isClearable
                    isSearchable
                    onChange={handleSelectChange}
                    onCreateOption={(inputValue) => {
                        // Call the method passed from the parent component to add the new option
                        onCreateExerciseOption(inputValue, index);
                    }}
                    options={exerciseOptions}
                    value={exercise.name ? { label: exercise.name, value: exercise.name } : null}
                />
            </td>
            <td>
                <Form.Control
                    type="number"
                    value={exercise.trainingMax}
                    onChange={handleTrainingMaxChange}

                />
            </td>
            {exercise.weekDetails.map((weekDetail, weekIndex) => (
                <td key={`${exercise.id}-week-${weekIndex}`}>
                    <Row>
                        <InputGroup size="sm">
                            <Form.Control
                                type="number"
                                placeholder=""
                                value={weekDetail.pct}
                                onChange={(e) => handleWeekDetailChange(weekIndex, 'pct', e.target.value)}
                            />
                            <InputGroup.Text>%</InputGroup.Text>
                        </InputGroup>
                    </Row>
                    <Row>
                        <InputGroup size="sm">
                            <Form.Control
                                type="number"
                                placeholder=""
                                value={weekDetail.sets}
                                onChange={(e) => handleWeekDetailChange(weekIndex, 'sets', e.target.value)}
                            />
                            <InputGroup.Text>Sets</InputGroup.Text>
                        </InputGroup>
                    </Row>
                    <Row>
                        <InputGroup size="sm">
                            <Form.Control
                                type="number"
                                placeholder=""
                                value={weekDetail.reps}
                                onChange={(e) => handleWeekDetailChange(weekIndex, 'reps', e.target.value)}
                            />
                            <InputGroup.Text>Reps</InputGroup.Text>
                        </InputGroup>
                    </Row>
                </td>
            ))
            }
            <td>
                {/* <ButtonGroup size="sm"> */}
                <Button
                    variant="outline-dark"
                    className="drag-handle"
                    size="sm"
                    ref={drag} // Only this button is the drag handle
                >
                    ☰
                </Button>
                <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={onDeleteExercise}
                >
                    🗑
                </Button>
                {/* </ButtonGroup> */}
            </td>

        </tr >
    );
};

export default ExerciseRow;