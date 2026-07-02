import React from "react";
import WeaponCard from "./WeaponCard";

export default function GroupedView({
  displayedWeapons,
  selectedWeaponId,
  onSelectWeapon,
  handleStatusCycle,
  updateCountInSheet,
  toggleOptimalStatus,
  activeClass,
}) {
  const groupedByType = { Melee: {}, Ranged: {}, Curio: {} };

  displayedWeapons.forEach((weapon) => {
    const type = weapon.itemType;
    const name = weapon.weaponName;

    if (!groupedByType[type]) groupedByType[type] = {};
    if (!groupedByType[type][name]) groupedByType[type][name] = [];
    groupedByType[type][name].push(weapon);
  });

  const typeOrder = ["Melee", "Ranged", "Curio"];
  const selectedWeaponName = displayedWeapons.find(
    (weapon) => weapon.rowIndex === selectedWeaponId,
  )?.weaponName;

  return (
    <div className="master-detail-layout">
      <div className="master-pane">
        {typeOrder.map((type) => {
          const weaponsInType = groupedByType[type];
          if (!weaponsInType || Object.keys(weaponsInType).length === 0) {
            return null;
          }

          const sortedNames = Object.keys(weaponsInType).sort((a, b) =>
            a.localeCompare(b),
          );

          return (
            <div key={type} className="master-section">
              <h2 className="master-section-title">{type}</h2>
              <div className="type-accordions">
                {sortedNames.map((name) => (
                  <details
                    key={name}
                    className="weapon-accordion"
                    onToggle={(event) => {
                      if (event.target.open) {
                        const firstVariant = weaponsInType[name][0];
                        onSelectWeapon(firstVariant.rowIndex);
                      }
                    }}
                  >
                    <summary className="accordion-header">
                      <span className="weapon-title">{name}</span>
                    </summary>
                    <div className="accordion-content compact-list">
                      {weaponsInType[name].map((weapon) => (
                        <div
                          key={weapon.rowIndex}
                          className={`compact-list-item ${selectedWeaponId === weapon.rowIndex ? "selected" : ""}`}
                          onClick={() => onSelectWeapon(weapon.rowIndex)}
                        >
                          <span className="compact-left-group">
                            <span className="optimal-star-icon">
                              {weapon.isOptimal ? "★" : " "}
                            </span>
                            <span className="compact-dump">
                              Dump: {weapon.dumpStat}
                            </span>
                          </span>

                          <span className={`tiny-status badge-${weapon.status}`}>
                            {weapon.status === "C"
                              ? "Collected"
                              : weapon.status === "U"
                                ? "Upgraded"
                                : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="detail-pane">
        {selectedWeaponId ? (
          <div className="multi-card-grid">
            {displayedWeapons
              .filter((weapon) => weapon.weaponName === selectedWeaponName)
                .map((weapon) => (
                <div key={weapon.rowIndex} className="detail-card-wrapper">
                  <WeaponCard
                    weapon={weapon}
                    onToggleOptimal={toggleOptimalStatus}
                    onCycleStatus={handleStatusCycle}
                    onCountChange={updateCountInSheet}
                    activeClass={activeClass}
                  />
                </div>
              ))}
          </div>
        ) : (
          <div className="empty-detail-state">
            <h3>Select a Weapon</h3>
            <p>
              Click a weapon name on the left to display all variants and their
              respective stats on the right.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
