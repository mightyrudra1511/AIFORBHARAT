# AIFORBHARAT
# AI Powered Phone Fraud Detection System

Prototype built for the AI for Bharat Hackathon.

This system detects potential phone scams by analyzing call transcripts and generating a fraud risk score. It also tracks repeat scam callers and builds a phone-number reputation database.

## Problem

India is experiencing a rapid increase in phone-based frauds such as:

- OTP scams
- Bank impersonation
- Digital arrest scams
- UPI payment fraud

Victims often receive urgent calls asking for sensitive information or money transfers.

Our system detects these scams automatically.

## Solution

The prototype analyzes phone call transcripts and calculates a fraud score using rule-based fraud indicators.

It also maintains a reputation score for each phone number to detect repeat scammers.

## Key Features

- Fraud risk scoring
- Scam keyword detection
- Repeat scam caller tracking
- Phone number reputation system
- API-based detection engine
- Cloud-native architecture

## System Architecture

Client / App  
↓  
API Gateway  
↓  
AWS Lambda (Fraud Analyzer)  
↓  
Fraud Scoring Algorithm  
↓  
DynamoDB Fraud Database

## Technology Stack

- AWS Lambda
- Amazon API Gateway
- Amazon DynamoDB
- Node.js
- REST API

## Fraud Detection Indicators

The system analyzes transcripts for:

- OTP requests
- Bank impersonation
- Urgent language
- Money transfer requests
- Threat language (account block, penalty, arrest)

Each indicator increases the fraud score.

## Risk Classification

0–29  → LOW  
30–59 → MEDIUM  
60–100 → HIGH

## API Endpoint

POST /analyze-call

Example request:

{
 "phone_number": "9876543210",
 "transcript": "Hello this is from SBI bank. Your account will be blocked today. Please share OTP immediately."
}

Example response:

{
 "phone_number": "9876543210",
 "fraud_score": 90,
 "risk_level": "HIGH",
 "indicators_detected": [
  "otp_request",
  "bank_impersonation",
  "urgency",
  "money_request",
  "threat_language"
 ],
 "number_reputation": {
  "fraud_score": 90,
  "number_of_reports": 1,
  "risk_level": "HIGH"
 }
}

## Database Design

### fraud_logs

Stores each analyzed call.

Fields:
- call_id
- phone_number
- transcript
- fraud_score
- risk_level
- indicators_detected
- timestamp

### phone_reputation

Stores scam reputation for phone numbers.

Fields:
- phone_number
- fraud_score
- number_of_reports
- risk_level
- last_seen

## Future Improvements

- AI based NLP detection
- Real-time call analysis
- Scam network detection
- Graph based fraud detection
- Mobile application integration

## Demo

Use Postman to send requests to the API.

POST request:

{
 "phone_number": "9876543210",
 "transcript": "Hello this is from SBI bank. Your account will be blocked today. Please share OTP immediately."
}

## Author

Built for the AI for Bharat Hackathon.
