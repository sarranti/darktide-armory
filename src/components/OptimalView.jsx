import React from "react";
import WeaponCard from "./WeaponCard";

export default function OptimalView({
  displayedWeapons,
  handleStatusCycle,
  updateCountInSheet,
  toggleOptimalStatus,
  activeClass,
}) {
  const sortWeapons = (weapons) =>
    weapons.slice().sort((a, b) => a.weaponName.localeCompare(b.weaponName));

  const sections = [
    {
      title: "Optimal Melee",
      items: sortWeapons(
        displayedWeapons.filter((w) => w.isOptimal && w.itemType === "Melee"),
      ),
    },
    {
      title: "Optimal Range",
      items: sortWeapons(
        displayedWeapons.filter((w) => w.isOptimal && w.itemType === "Ranged"),
      ),
    },
    {
      title: "Optimal Curios",
      items: sortWeapons(
        displayedWeapons.filter((w) => w.isOptimal && w.itemType === "Curio"),
      ),
    },
    {
      title: "Melee",
      items: sortWeapons(
        displayedWeapons.filter((w) => !w.isOptimal && w.itemType === "Melee"),
      ),
    },
    {
      title: "Range",
      items: sortWeapons(
        displayedWeapons.filter((w) => !w.isOptimal && w.itemType === "Ranged"),
      ),
    },
    {
      title: "Curios",
      items: sortWeapons(
        displayedWeapons.filter((w) => !w.isOptimal && w.itemType === "Curio"),
      ),
    },
  ];

  return sections.map(
    (section) =>
      section.items.length > 0 && (
        <div key={section.title} className="optimal-section">
          <h2 className="section-title">{section.title}</h2>
          <div className="weapon-grid">
            {section.items.map((weapon) => (
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
        </div>
      ),
  );
}
