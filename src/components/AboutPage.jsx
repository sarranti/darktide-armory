import React from "react";

const AboutPage = () => (
  <div className="about-page">
    <h1>Welcome to the Arsenal Tracker</h1>
    <p>
      This tool helps you manage your Darktide weapon collection by syncing with
      your Google Sheets.
    </p>
    <div className="setup-steps">
      <h2>Getting Started</h2>
      <ol>
        <li>
          <strong>Step 1:</strong> If you don't have a template yet, you can
          create one by making a copy of the default template in your google
          drive:{" "}
          <a
            href="https://docs.google.com/spreadsheets/d/1jwscnYcFndVzskmI3o8rbh9yRjyb5hEU3XJj6B326hU/edit?usp=sharing"
            target="_blank"
            rel="noreferrer"
          >
            Click here to copy the template
          </a>
          .
        </li>
        <li>
          <strong>Step 2:</strong> Authenticate using the button above.
        </li>
        <li>
          <strong>Step 3:</strong> Paste your Sheet ID by clicking share and
          copying the link, then click "Load Data".
          <ul>
            <li>
              Note: the sheet does not need to be shared publicly. This only
              loads in your browser and is not shared with anyone.
            </li>
            <li>
              <strong>Finding your Sheet ID:</strong> The Sheet ID is the long
              string in the URL of your Google Sheet. For example, in the URL:
              <br />
              <code>
                https://docs.google.com/spreadsheets/d/1jwscnYcFndVzskmI3o8rbh9yRjyb5hEU3XJj6B326hU/edit
              </code>
              <br />
              The Sheet ID is: <code>1jwscnYcFndVzskmI3o8rbh9yRjyb5hEU3XJj6B326hU</code>
            </li>
          </ul>
        </li>
      </ol>
    </div>
  </div>
);

export default AboutPage;
