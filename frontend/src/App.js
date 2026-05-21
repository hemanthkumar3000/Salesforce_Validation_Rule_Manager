import React, { useState } from "react";
import axios from "axios";

function App() {

  const [rules, setRules] = useState([]);

  const loginToSalesforce = () => {
    window.location.href = "https://salesforce-validation-rule-manager-82dv.onrender.com/login ";
  };

  const getValidationRules = async () => {

    try {

      const response = await axios.get(
        "https://salesforce-validation-rule-manager-82dv.onrender.com/validation-rules"
      );

      setRules(response.data);

    } catch (error) {

      console.log(error);
      alert("Failed to fetch validation rules");
    }
  };
  const toggleRule = async (id, status) => {

  try {

    await axios.get(
      `https://salesforce-validation-rule-manager-82dv.onrender.com/toggle-rule/${id}/${status}`
    );

    alert("Validation Rule Updated");

    getValidationRules();

  } catch (error) {

    console.log(error);

    alert("Failed to update rule");
  }
};
  return (
    <div style={{ padding: "30px" }}>

      <h1>Salesforce Validation Rule Manager</h1>

      <button onClick={loginToSalesforce}>
        Login with Salesforce
      </button>

      <button
        onClick={getValidationRules}
        style={{ marginLeft: "10px" }}
      >
        Get Validation Rules
      </button>

      <table
        border="1"
        cellPadding="10"
        style={{
          marginTop: "20px",
          borderCollapse: "collapse"
        }}
      >

        <thead>
          <tr>
            <th>Validation Rule</th>
            <th>Status</th>
<th>Action</th>
          </tr>
        </thead>

        <tbody>

          {rules.map((rule) => (

            <tr key={rule.Id}>
              <td>{rule.ValidationName}</td>
              <td>
  {rule.Active ? "Active" : "Inactive"}
</td>

<td>
  <button
    onClick={() =>
      toggleRule(rule.Id, rule.Active)
    }
  >
    Toggle
  </button>
</td>
            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default App;