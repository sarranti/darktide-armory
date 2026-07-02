import React from "react";

export default function ClassTabs({ classMap, activeClass, onSelectClass }) {
  return (
    <div className="class-tabs">
      {Object.keys(classMap).map((key) => (
        <button
          key={key}
          className={activeClass === key ? "active" : ""}
          onClick={() => onSelectClass(key)}
        >
          {classMap[key]}
        </button>
      ))}
    </div>
  );
}
