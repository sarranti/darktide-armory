import React from "react";
import WeaponCard from "./WeaponCard";

const typeOrder = ["Melee", "Ranged", "Curio"];

const sortWeapons = (weapons) =>
  weapons.slice().sort((a, b) => a.weaponName.localeCompare(b.weaponName));

export default function AllWeaponsView({
  displayedWeapons,
  handleStatusCycle,
  updateCountInSheet,
  toggleOptimalStatus,
  activeClass,
}) {
  const groupedByType = { Melee: [], Ranged: [], Curio: [] };

  displayedWeapons.forEach((weapon) => {
    const type = weapon.itemType;
    if (!groupedByType[type]) groupedByType[type] = [];
    groupedByType[type].push(weapon);
  });

  return (
    <div className="all-weapons-view">
      {typeOrder.map((type) => {
        const weapons = sortWeapons(groupedByType[type] || []);
        if (!weapons.length) return null;

        return (
          <section key={type} className="weapon-section">
            <h2 className="section-title">{type === "Curio" ? "Curios" : type}</h2>
            <div className="weapon-grid">
              {weapons.map((weapon) => (
                <WeaponCard
                  key={weapon.rowIndex}
                  weapon={weapon}
                  onToggleOptimal={toggleOptimalStatus}
                  onCycleStatus={handleStatusCycle}
                  onCountChange={updateCountInSheet}
                  activeClass={activeClass}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
