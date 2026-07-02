import React, { useMemo, useState } from "react";
import { useGoogleSheets } from "./useGoogleSheets";
import AboutPage from "./components/AboutPage";
import AppHeader from "./components/AppHeader";
import ClassTabs from "./components/ClassTabs";
import GroupedView from "./components/GroupedView";
import OptimalView from "./components/OptimalView";
import AllWeaponsView from "./components/AllWeaponsView";
import WeaponCard from "./components/WeaponCard";
import { isOptimalValue, toggleOptimalValue } from "./utils/optimalUtils";
import classMap from "./utils/classMap";

const getExcelColumnName = (colIndex) => {
  let columnName = "";
  while (colIndex >= 0) {
    columnName = String.fromCharCode((colIndex % 26) + 65) + columnName;
    colIndex = Math.floor(colIndex / 26) - 1;
  }
  return columnName;
};

export default function App() {
  const { isAuthenticated, login, tokenExpiry, silentRefresh } =
    useGoogleSheets();
  const [sheetId, setSheetId] = useState(
    localStorage.getItem("darktide_sheet_id") || "",
  );
  const [rawRows, setRawRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeClass, setActiveClass] = useState("V");
  const [viewMode, setViewMode] = useState("about");
  const [selectedWeaponId, setSelectedWeaponId] = useState(null);

  const handleSheetInput = (inputValue) => {
    const sheetIdMatch = inputValue.match(/\/d\/([a-zA-Z0-9-_]+)/);
    setSheetId(sheetIdMatch ? sheetIdMatch[1] : inputValue.trim());
  };

  const ensureAuth = async () => {
    if (!tokenExpiry || Date.now() > tokenExpiry) {
      try {
        console.log("Token expired. Refreshing silently...");
        await silentRefresh();
      } catch (err) {
        console.error("Silent refresh failed", err);
        alert("Session expired. Please click 'Authenticate' to log in again.");
        throw new Error("Auth required");
      }
    }
  };

  const fetchWeapons = async () => {
    if (!sheetId) return alert("Please enter your Spreadsheet ID");

    await ensureAuth();

    setIsLoading(true);
    try {
      localStorage.setItem("darktide_sheet_id", sheetId);
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: "Stats!A:ZZ",
      });
      if (response.result.values) {
        setRawRows(response.result.values);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load sheet.");
    } finally {
      setIsLoading(false);
    }
  };

  const formattedWeapons = useMemo(() => {
    if (!rawRows || rawRows.length === 0) return [];
    const headers = rawRows[0];

    const collectedIdx = headers.findIndex((h) =>
      String(h || "").includes(`Collected_${activeClass}`),
    );
    const upgradedIdx = headers.findIndex((h) =>
      String(h || "").includes(`Upgraded_${activeClass}`),
    );
    const countIdx = headers.findIndex((h) =>
      String(h || "").includes(`Count_${activeClass}`),
    );

    return rawRows.slice(1).map((row, index) => {
      const isCollected = row[collectedIdx] === "TRUE";
      const isUpgraded = row[upgradedIdx] === "TRUE";
      let status = "None";
      if (isUpgraded) status = "U";
      else if (isCollected) status = "C";

      const optimalString = (row[2] || "").toString().toUpperCase();
      const rawType = (row[4] || "").toString().toUpperCase();
      let itemType = "Ranged";
      if (rawType === "TRUE" || rawType === "M") itemType = "Melee";
      else if (rawType === "C" || rawType === "CURIO") itemType = "Curio";

      const isOptimal = isOptimalValue(
        optimalString,
        activeClass,
        itemType,
        Object.keys(classMap),
      );

      return {
        rowIndex: index + 2,
        weaponName: row[0] || "Unknown",
        dumpStat: row[1] || "",
        availableClasses: row[3] || "",
        status,
        count: parseInt(row[countIdx], 10) || 0,
        isOptimal,
        rawOptimalString: optimalString,
        itemType,
        colCollectedLetter:
          collectedIdx !== -1 ? getExcelColumnName(collectedIdx) : null,
        colUpgradedLetter:
          upgradedIdx !== -1 ? getExcelColumnName(upgradedIdx) : null,
        colCountLetter: countIdx !== -1 ? getExcelColumnName(countIdx) : null,
      };
    });
  }, [rawRows, activeClass]);

  const displayedWeapons = useMemo(() => {
    return formattedWeapons.filter((weapon) =>
      weapon.availableClasses.includes(activeClass),
    );
  }, [formattedWeapons, activeClass]);

  const handleStatusCycle = async (weapon) => {
    if (!weapon.colCollectedLetter || !weapon.colUpgradedLetter) return;

    await ensureAuth();

    let nextCollected = "FALSE";
    let nextUpgraded = "FALSE";
    if (weapon.status === "None") nextCollected = "TRUE";
    else if (weapon.status === "C") {
      nextCollected = "TRUE";
      nextUpgraded = "TRUE";
    }

    try {
      await window.gapi.client.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: sheetId,
        resource: {
          valueInputOption: "USER_ENTERED",
          data: [
            {
              range: `Stats!${weapon.colCollectedLetter}${weapon.rowIndex}`,
              values: [[nextCollected]],
            },
            {
              range: `Stats!${weapon.colUpgradedLetter}${weapon.rowIndex}`,
              values: [[nextUpgraded]],
            },
          ],
        },
      });
      fetchWeapons();
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const updateCountInSheet = async (weapon, value) => {
    if (!weapon.colCountLetter) return;

    await ensureAuth();

    const newCount = parseInt(value, 10) || 0;
    try {
      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `Stats!${weapon.colCountLetter}${weapon.rowIndex}`,
        valueInputOption: "USER_ENTERED",
        resource: { values: [[newCount]] },
      });
      setRawRows((prev) => {
        const updated = [...prev];
        const countIdx = prev[0].findIndex((h) =>
          String(h || "").includes(`Count_${activeClass}`),
        );
        if (updated[weapon.rowIndex - 1] && countIdx !== -1) {
          updated[weapon.rowIndex - 1][countIdx] = String(newCount);
        }
        return updated;
      });
    } catch (err) {
      console.error("Count sync failed:", err);
    }
  };

  const toggleOptimalStatus = async (weapon) => {
    let newValue = "";

    await ensureAuth();

    newValue = toggleOptimalValue(
      weapon.rawOptimalString,
      activeClass,
      weapon.itemType,
      Object.keys(classMap),
    );

    try {
      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `Stats!C${weapon.rowIndex}`,
        valueInputOption: "USER_ENTERED",
        resource: { values: [[newValue]] },
      });

      setRawRows((prev) => {
        const updated = [...prev];
        if (updated[weapon.rowIndex - 1]) {
          updated[weapon.rowIndex - 1][2] = newValue;
        }
        return updated;
      });
    } catch (err) {
      console.error("Optimal status toggle failed:", err);
    }
  };

  const handleLoadData = async () => {
    await fetchWeapons();
    setViewMode("grouped");
  };

  return (
    <div className="dashboard">
      <AppHeader
        isAuthenticated={isAuthenticated}
        login={login}
        sheetId={sheetId}
        handleSheetInput={handleSheetInput}
        onLoadData={handleLoadData}
      />

      <nav className="main-nav">
        <button
          className={viewMode === "about" ? "active" : ""}
          onClick={() => setViewMode("about")}
        >
          About
        </button>
        {isAuthenticated && (
          <>
            <button
              className={viewMode === "grouped" ? "active" : ""}
              onClick={() => setViewMode("grouped")}
            >
              By Weapon
            </button>
            <button
              className={viewMode === "optimal" ? "active" : ""}
              onClick={() => setViewMode("optimal")}
            >
              Optimal
            </button>
            <button
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
            >
              Show All
            </button>
          </>
        )}
      </nav>

      <main>
        {viewMode === "about" && <AboutPage />}

        {viewMode !== "about" && isAuthenticated && rawRows.length > 0 && (
          <div className="controls-bar">
            <ClassTabs
              classMap={classMap}
              activeClass={activeClass}
              onSelectClass={setActiveClass}
            />
          </div>
        )}

        {viewMode !== "about" && isAuthenticated && rawRows.length > 0 && (
          <div className="view-container">
            {viewMode === "list" && (
              <AllWeaponsView
                displayedWeapons={displayedWeapons}
                handleStatusCycle={handleStatusCycle}
                updateCountInSheet={updateCountInSheet}
                toggleOptimalStatus={toggleOptimalStatus}
                activeClass={activeClass}
              />
            )}
            {viewMode === "optimal" && (
              <OptimalView
                displayedWeapons={displayedWeapons}
                handleStatusCycle={handleStatusCycle}
                updateCountInSheet={updateCountInSheet}
                toggleOptimalStatus={toggleOptimalStatus}
                activeClass={activeClass}
              />
            )}
            {viewMode === "grouped" && (
              <GroupedView
                displayedWeapons={displayedWeapons}
                selectedWeaponId={selectedWeaponId}
                onSelectWeapon={setSelectedWeaponId}
                handleStatusCycle={handleStatusCycle}
                updateCountInSheet={updateCountInSheet}
                toggleOptimalStatus={toggleOptimalStatus}
                activeClass={activeClass}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
