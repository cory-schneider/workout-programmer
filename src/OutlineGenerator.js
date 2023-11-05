import React, { useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import ReactDOMServer from 'react-dom/server';

const OutlineGenerator = ({ exercises }) => {
    const [outline, setOutline] = useState('');

    const handleGenerateClick = () => {
        const outlineContent = generateOutline(exercises);
        const htmlContent = ReactDOMServer.renderToStaticMarkup(outlineContent);

        const printWindow = window.open('', '_blank');
        const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map(style => style.outerHTML).join('');

        printWindow.document.write('<html><head><title>Print Outline</title>');
        // Include the existing stylesheets if they are relevant to the print content
        printWindow.document.write(stylesheets);
        // Add custom styles
        printWindow.document.write(`
        <style>
            body {
                font-family: 'Arial', sans-serif;
            }
            h1, h2, h3, h4, h5, h6 {
                font-weight: bold;
            }
            .exercise-name {
                font-weight: bold;
            }
            th, td {
                text-align: center;
                vertical-align: middle;
            }
        </style>
    `);
        printWindow.document.write('</head><body>');
        printWindow.document.write(htmlContent); // Use the HTML string
        printWindow.document.write('</body></html>');
        printWindow.document.close(); // Necessary for IE >= 10
        printWindow.focus(); // Necessary for IE >= 10

        // You can add a slight delay before calling print to ensure the content is fully loaded
        // setTimeout(() => {
        //     printWindow.print();
        // }, 500);
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
            const plateCounts = {};

            // Divide by 2 because we will put plates on both sides of the bar
            remainingWeight /= 2;

            for (let plate of plates) {
                let count = 0;
                while (remainingWeight >= plate) {
                    remainingWeight -= plate;
                    count++;
                }
                if (count > 0) {
                    plateCounts[plate] = count;
                }
            }

            // If there's a remainder less than the smallest plate, we can't achieve the exact weight
            if (remainingWeight > 0) {
                console.warn('Cannot achieve the exact weight with the given plates.');
            }

            // Create an array from the plate counts
            const platesNeeded = Object.keys(plateCounts).map(plate => ({
                weight: plate,
                count: plateCounts[plate]
            }));

            // Sort the array from highest weight to lowest
            platesNeeded.sort((a, b) => b.weight - a.weight);

            // Format the plate counts into a string
            const formattedPlates = platesNeeded.map(plate => {
                return `${plate.count} x ${plate.weight}`;
            });

            return formattedPlates.join(', ');
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
                            <td className="exercise-name">{exercise.name || 'Unnamed'}</td>
                            <td>{exercise.trainingMax}</td>
                            {/* Render a cell for each week */}
                            {exercise.weekDetails.map((detail, weekIndex) => {
                                const weight = Math.round((detail.pct * exercise.trainingMax / 100) / 5) * 5;
                                const plates = calculatePlates(weight); // Calculate the plates needed for this weight

                                return (
                                    <td key={weekIndex}>
                                        <p>{detail.pct}%: {weight}</p>
                                        <p>{detail.sets} sets of {detail.reps} reps</p>
                                        <div>ⵙ {plates}</div> {/* Display the plates */}
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
            <div align="left">
                <Button variant="outline-dark" className="fw-bold" onClick={handleGenerateClick}>Generate Outline</Button>
                <Button variant="outline-success" className="fw-bold" onClick={handleExportClick}>Generate Excel</Button>
            </div>
            <div className="mt-3">
                {outline}
            </div>
        </>
    );
};

export default OutlineGenerator;
