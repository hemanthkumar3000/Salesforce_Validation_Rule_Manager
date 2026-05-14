const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors());

let accessToken = "";
let instanceUrl = "";


app.get("/", (req, res) => {
  res.send("Salesforce Backend Running");
});


app.get("/login", (req, res) => {

  const authUrl =
    `https://login.salesforce.com/services/oauth2/authorize` +
    `?response_type=code` +
    `&client_id=${process.env.CLIENT_ID}` +
    `&redirect_uri=${process.env.REDIRECT_URI}`;

  res.redirect(authUrl);
});


app.get("/callback", async (req, res) => {

  const code = req.query.code;

  try {

    const tokenResponse = await axios.post(
      "https://login.salesforce.com/services/oauth2/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          redirect_uri: process.env.REDIRECT_URI,
          code: code,
        },
      }
    );

    accessToken = tokenResponse.data.access_token;
    instanceUrl = tokenResponse.data.instance_url;

    console.log("FULL TOKEN RESPONSE:");
    console.log(tokenResponse.data);

    console.log("Access Token:", accessToken);
    console.log("Instance URL:", instanceUrl);

    res.send("Salesforce Login Successful");

  } catch (error) {

    console.log(error.response?.data || error.message);

    res.send("Login Failed");
  }
});


app.get("/validation-rules", async (req, res) => {

  try {

    const query = `
      SELECT Id,
             ValidationName,
             Active,
             EntityDefinition.QualifiedApiName
      FROM ValidationRule
      WHERE EntityDefinition.QualifiedApiName = 'Account'
    `;

    const response = await axios.get(
      `${instanceUrl}/services/data/v59.0/tooling/query`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          q: query,
        },
      }
    );

    res.json(response.data.records);

  } catch (error) {

    console.log(error.response?.data || error.message);

    res.status(500).send("Failed to fetch validation rules");
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.get("/toggle-rule/:id/:status", async (req, res) => {

  try {

    const ruleId = req.params.id;
    const currentStatus = req.params.status === "true";

    const updatedStatus = !currentStatus;

    

    const ruleResponse = await axios.get(
      `${instanceUrl}/services/data/v59.0/tooling/sobjects/ValidationRule/${ruleId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const existingRule = ruleResponse.data;

    

    await axios.patch(
      `${instanceUrl}/services/data/v59.0/tooling/sobjects/ValidationRule/${ruleId}`,
      {
        Metadata: {
          active: updatedStatus,
          description: existingRule.Metadata.description,
          errorConditionFormula:
            existingRule.Metadata.errorConditionFormula,
          errorDisplayField:
            existingRule.Metadata.errorDisplayField,
          errorMessage:
            existingRule.Metadata.errorMessage,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.send("Validation Rule Updated");

  } catch (error) {

    console.log(error.response?.data || error.message);

    res.status(500).send("Failed to update validation rule");
  }
});