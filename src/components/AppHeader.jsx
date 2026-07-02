import React from "react";

export default function AppHeader({
  isAuthenticated,
  login,
  sheetId,
  handleSheetInput,
  onLoadData,
}) {
  return (
    <header className="app-header">
      <h1>Armory</h1>
      <div className="connection-bar">
        {!isAuthenticated ? (
          <button onClick={login}>Authenticate with Google</button>
        ) : (
          <>
            <input
              type="text"
              placeholder="Sheet ID"
              value={sheetId}
              onChange={(e) => handleSheetInput(e.target.value)}
            />
            <button onClick={onLoadData}>Load Data</button>
          </>
        )}
      </div>
    </header>
  );
}
