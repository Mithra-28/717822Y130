const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;

let numberWindow = []; // Stores the last 'WINDOW_SIZE' numbers

// Map number ID to third-party API endpoints
const apiMap = {
    "p": "primes",
    "f": "fibo",
    "r": "rand"
};

// Function to fetch numbers from third-party API
const fetchNumbers = async (type) => {
    const urls = {
        "p": "http://20.244.56.144/numbers/primes",
        "f": "http://20.244.56.144/numbers/fibo",
        "r": "http://20.244.56.144/numbers/rand"
    };

    if (!urls[type]) return [];

    console.log(`Fetching numbers from: ${urls[type]}`);

    try {
        const response = await axios.get(urls[type], { timeout: 500 });
        return response.data.numbers || [];
    } catch (error) {
        console.error(`Error fetching numbers (${type}): ${error.message}`);
        
        // Mock Data when API fails
        const fallbackNumbers = {
            "p": [2, 3, 5, 7, 11, 13, 17, 19, 23, 29],
            "f": [1, 1, 2, 3, 5, 8, 13, 21, 34, 55],
            "r": [4, 12, 25, 33, 47, 52, 63, 79, 88, 91]
        };
        
        console.log(`Using fallback data for: ${type}`);
        return fallbackNumbers[type] || [];
    }
};


// API Route: Fetch and store numbers based on type
app.get("/numbers/:numberid", async (req, res) => {
    const type = req.params.numberid;

    if (!["p", "f", "r", "e"].includes(type)) {
        return res.status(400).json({ error: "Invalid number ID. Use 'p', 'f', 'e', or 'r'." });
    }

    console.log(`Received request for: ${type}`);

    const prevState = [...numberWindow]; // Store previous state
    const fetchedNumbers = await fetchNumbers(type);

    // Add only unique numbers to the window
    fetchedNumbers.forEach(num => {
        if (!numberWindow.includes(num)) {
            numberWindow.push(num);
        }
    });

    // Keep only the latest WINDOW_SIZE numbers
    while (numberWindow.length > WINDOW_SIZE) {
        numberWindow.shift();
    }

    // Calculate the average of stored numbers
    const avg = numberWindow.length ? (numberWindow.reduce((a, b) => a + b, 0) / numberWindow.length).toFixed(2) : 0;

    res.json({
        windowPrevState: prevState,
        windowCurrState: numberWindow,
        numbers: fetchedNumbers,
        avg: parseFloat(avg)
    });
});

// Default Route
app.get("/", (req, res) => {
    res.send("Welcome to the Average Calculator API! Use /numbers/{numberid} to fetch data.");
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
