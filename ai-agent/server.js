const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Mock AI Logic (Replace with actual OpenAI call for production)
// System Prompt: "You are a security sentinel. Classify input as 'ENCRYPT' or 'LOCKDOWN'."

app.post('/analyze-intent', async (req, res) => {
    const { command } = req.body;
    
    console.log(`Analyzing command: ${command}`);

    let intent = "UNKNOWN";
    let riskLevel = "LOW";

    const lowerCmd = command.toLowerCase();

    // Simple keyword mapping for the prototype
    if (lowerCmd.includes("hack") || lowerCmd.includes("drain") || lowerCmd.includes("stolen")) {
        intent = "LOCKDOWN"; // Triggers Panic Protocol
        riskLevel = "CRITICAL";
    } else if (lowerCmd.includes("hide") || lowerCmd.includes("encrypt") || lowerCmd.includes("private")) {
        intent = "ENCRYPT"; // Triggers Stealth Protocol (FHE)
        riskLevel = "MEDIUM";
    }

    // Return the decision to the dashboard
    res.json({
        intent: intent,
        risk_level: riskLevel,
        suggested_action: intent === "LOCKDOWN" ? "EXECUTE_RESCUE_TX" : "SWITCH_TO_INCO"
    });
});

app.listen(3001, () => {
    console.log('AI Sentinel Agent running on port 3001');
});