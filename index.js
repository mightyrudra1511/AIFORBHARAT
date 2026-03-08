const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "ap-south-1" });
const dynamo = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : event;

    const transcript = (body.transcript || "").toLowerCase();
    const phoneNumber = body.phone_number || "unknown";
    const timestamp = Date.now().toString();

    let score = 0;
    let indicators = [];

    if (transcript.includes("otp")) {
      score += 30;
      indicators.push("otp_request");
    }

    if (
      transcript.includes("bank") ||
      transcript.includes("sbi") ||
      transcript.includes("account")
    ) {
      score += 25;
      indicators.push("bank_impersonation");
    }

    if (
      transcript.includes("urgent") ||
      transcript.includes("immediately") ||
      transcript.includes("right now")
    ) {
      score += 20;
      indicators.push("urgency");
    }

    if (
      transcript.includes("transfer") ||
      transcript.includes("upi") ||
      transcript.includes("payment") ||
      transcript.includes("share")
    ) {
      score += 25;
      indicators.push("money_request");
    }

    if (
      transcript.includes("blocked") ||
      transcript.includes("penalty") ||
      transcript.includes("arrest")
    ) {
      score += 15;
      indicators.push("threat_language");
    }

    let riskLevel = "LOW";
    if (score >= 60) riskLevel = "HIGH";
    else if (score >= 30) riskLevel = "MEDIUM";

    // 1. Store individual call in fraud_logs
    await dynamo.send(
      new PutCommand({
        TableName: "fraud_logs",
        Item: {
          call_id: timestamp,
          phone_number: phoneNumber,
          transcript,
          fraud_score: score,
          risk_level: riskLevel,
          indicators_detected: indicators,
          timestamp: Number(timestamp)
        }
      })
    );

    // 2. Read existing phone reputation
    const existing = await dynamo.send(
      new GetCommand({
        TableName: "phone_reputation",
        Key: {
          phone_number: phoneNumber
        }
      })
    );

    let numberOfReports = 1;
    let avgFraudScore = score;

    if (existing.Item) {
      const oldReports = existing.Item.number_of_reports || 0;
      const oldAvg = existing.Item.fraud_score || 0;

      numberOfReports = oldReports + 1;
      avgFraudScore = Math.round(
        ((oldAvg * oldReports) + score) / numberOfReports
      );
    }

    let reputationRisk = "LOW";
    if (avgFraudScore >= 60) reputationRisk = "HIGH";
    else if (avgFraudScore >= 30) reputationRisk = "MEDIUM";

    // 3. Write/update phone_reputation
    await dynamo.send(
      new PutCommand({
        TableName: "phone_reputation",
        Item: {
          phone_number: phoneNumber,
          fraud_score: avgFraudScore,
          number_of_reports: numberOfReports,
          risk_level: reputationRisk,
          last_seen: Number(timestamp)
        }
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        fraud_score: score,
        risk_level: riskLevel,
        indicators_detected: indicators,
        number_reputation: {
          fraud_score: avgFraudScore,
          number_of_reports: numberOfReports,
          risk_level: reputationRisk
        }
      })
    };
  } catch (error) {
    console.error("Error:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        error: "Internal server error",
        details: error.message
      })
    };
  }
};