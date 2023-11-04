// Debugging.js
import React from 'react';
import Button from 'react-bootstrap/Button';

// This function is now a named export
export const prettyPrintState = (stateData) => {
    console.log(JSON.stringify(stateData, null, 2));
};

