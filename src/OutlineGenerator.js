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
        return (
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Exercise</th>
                        <th>Training Max</th>
                        <th>Week Details</th>
                    </tr>
                </thead>
                <tbody>
                    {exercises.map((exercise, index) => (
                        <tr key={index}>
                            <td>{exercise.name || 'Unnamed'}</td>
                            <td>{exercise.trainingMax}</td>
                            <td>
                                {exercise.weekDetails.map((detail, weekIndex) => (
                                    <div key={weekIndex}>
                                        <strong>Week {weekIndex + 1}:</strong><br />
                                        Sets: {detail.sets},<br />
                                        Reps: {detail.reps},<br />
                                        Percentage: {detail.pct}%<br />
                                    </div>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        );
    };

    return (
        <>
            {/* <Button variant="primary" onClick={handleGenerateClick}>Generate</Button> */}
            <Button variant="outline-success" className="fw-bold" onClick={handleExportClick} className="ml-2">Export to Excel</Button>
            <div className="mt-3">
                {outline}
            </div>
        </>
    );
};

export default OutlineGenerator;
