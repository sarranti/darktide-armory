import React from "react";
import classMap from "../utils/classMap";

export default function WeaponCard({
  weapon,
  onToggleOptimal,
  onCycleStatus,
  onCountChange,
  activeClass,
}) {
  const isSainted = weapon.status === "U" && weapon.isOptimal;

  return (
    <div
      key={weapon.rowIndex}
      className={`weapon-card status-${weapon.status} ${isSainted ? "optimal-border" : ""}`}
    >
      <button
        className={`optimal-star ${weapon.isOptimal ? "filled" : ""}`}
        onClick={() => onToggleOptimal(weapon)}
      >
        ★
      </button>

      <h3>{weapon.weaponName}</h3>
      <span className="dump-stat">Dump: {weapon.dumpStat}</span>

      {/* Curio class chips are temporarily hidden until the logic is revisited. */}
      {/*
      {weapon.itemType === "Curio" && (
        <div className="curio-chips">
          {Object.keys(classMap).map((key) => {
            const present = (weapon.rawOptimalString || "").includes(key);
            return (
              <span
                key={key}
                className={`curio-chip ${present ? "present" : ""} ${activeClass === key ? "active" : ""}`}
                title={classMap[key]}
              >
                {key}
              </span>
            );
          })}
        </div>
      )}
      */}

      <div className="card-controls">
        <button
          className={`status-btn ${weapon.status}`}
          onClick={() => onCycleStatus(weapon)}
        >
          {weapon.status === "None" && "☐ Unowned"}
          {weapon.status === "C" && "☑ Collected"}
          {weapon.status === "U" && "🔥 Upgraded"}
        </button>
        <div className="count-picker">
          <button
            type="button"
            className="count-step-btn"
            onClick={() => onCountChange(weapon, Math.max(0, Number(weapon.count || 0) - 1))}
            aria-label={`Decrease quantity for ${weapon.weaponName}`}
          >
            −
          </button>
          <input
            type="number"
            min="0"
            value={weapon.count}
            onChange={(e) => onCountChange(weapon, e.target.value)}
          />
          <button
            type="button"
            className="count-step-btn"
            onClick={() => onCountChange(weapon, Number(weapon.count || 0) + 1)}
            aria-label={`Increase quantity for ${weapon.weaponName}`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
