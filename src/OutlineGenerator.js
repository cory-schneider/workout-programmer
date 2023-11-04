import React, { useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import * as XLSX from 'xlsx';

const OutlineGenerator = ({ exercises }) => {
    const [outline, setOutline] = useState('');

    const handleGenerateClick = () => {
        const outlineContent = generateOutline(exercises);
        setOutline(outlineContent);
    };

    const handleExportClick = () => {
        // Create a new workbook
        const wb = XLSX.utils.book_new();

        // Details Sheet
        const detailsHeader = ['Exercise', 'Training Max'];
        // Create headers for week details
        for (let i = 0; i < exercises[0].weekDetails.length; i++) {
            detailsHeader.push(`Week ${i + 1} %`, `Week ${i + 1} Sets`, `Week ${i + 1} Reps`);
        }
        const detailsData = exercises.map(exercise => {
            const row = [exercise.name || 'Unnamed', exercise.trainingMax];
            exercise.weekDetails.forEach(detail => {
                row.push(detail.pct, detail.sets, detail.reps);
            });
            return row;
        });
        detailsData.unshift(detailsHeader); // Add header to the data
        const wsDetails = XLSX.utils.aoa_to_sheet(detailsData);
        XLSX.utils.book_append_sheet(wb, wsDetails, 'Details');

        // Plan Sheet
        const planHeader = ['Exercise'];
        const planData = exercises.map((exercise, exerciseIndex) => {
            const row = [{ t: 's', v: exercise.name || 'Unnamed' }]; // Set up the cell as a string type
            exercise.weekDetails.forEach((detail, weekIndex) => {
                // Calculate cell references
                const trainingMaxCellRef = XLSX.utils.encode_cell({ c: 1, r: exerciseIndex + 1 });
                const percentageCellRef = XLSX.utils.encode_cell({ c: 2 + weekIndex * 3, r: exerciseIndex + 1 });

                // Create a cell object with a formula
                const formulaCell = {
                    t: 'n',
                    f: `MROUND(Details!${trainingMaxCellRef}*Details!${percentageCellRef}/100, 5)`
                };

                row.push(formulaCell);
            });
            return row;
        });
        planHeader.push(...exercises[0].weekDetails.map((_, i) => `Week ${i + 1}`));
        planData.unshift(planHeader); // Add header to the data
        const wsPlan = XLSX.utils.aoa_to_sheet(planData, { cellDates: true, cellNF: false, cellText: false });
        XLSX.utils.book_append_sheet(wb, wsPlan, 'Plan');

        // Write the file
        XLSX.writeFile(wb, 'workout_plan.xlsx');
    };


    const generateOutline = (exercises) => {
        const calculatePlates = (weight) => {
            // Assuming the bar itself weighs 45 pounds and is included in the "weight" variable
            let remainingWeight = weight - 45; // Subtract the bar weight
            const plates = [45, 25, 10, 5, 2.5];
            const platesNeeded = [];

            // Divide by 2 because we will put plates on both sides of the bar
            remainingWeight /= 2;

            for (let plate of plates) {
                while (remainingWeight >= plate) {
                    platesNeeded.push(plate);
                    remainingWeight -= plate;
                }
            }

            // If there's a remainder less than the smallest plate, we can't achieve the exact weight
            if (remainingWeight > 0) {
                console.warn('Cannot achieve the exact weight with the given plates.');
            }

            return platesNeeded;
        };

        return (
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Exercise</th>
                        <th width="100px">Training Max</th>
                        {/* Check if exercises array is not empty and then create a header for each week */}
                        {exercises.length > 0 && exercises[0].weekDetails.map((_, weekIndex) => (
                            <th key={weekIndex}>Week {weekIndex + 1}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {exercises.map((exercise, index) => (
                        <tr key={exercise.id}> {/* It's better to use unique `id` instead of index when available */}
                            <td>{exercise.name || 'Unnamed'}</td>
                            <td>{exercise.trainingMax}</td>
                            {/* Render a cell for each week */}
                            {exercise.weekDetails.map((detail, weekIndex) => {
                                const weight = Math.round((detail.pct * exercise.trainingMax / 100) / 5) * 5;
                                const plates = calculatePlates(weight); // Calculate the plates needed for this weight

                                return (
                                    <td key={weekIndex}>
                                        <div>{detail.pct}%</div>
                                        <div>Weight: {weight}</div>
                                        <div>Sets: {detail.sets}</div>
                                        <div>Reps: {detail.reps}</div>
                                        <div>Plates: {plates.join(', ')}</div> {/* Display the plates */}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </Table>

        );
    };

    return (
        <>
            <Button variant="outline-dark" onClick={handleGenerateClick}>Generate in Browser</Button>
            <Button variant="outline-success" className="fw-bold" onClick={handleExportClick} className="ml-2">Export to Excel</Button>
            <div className="mt-3">
                {outline}
            </div>
        </>
    );
};

export default OutlineGenerator;
