import React from "react";

const ExportButton = ({ data }) => {
  const handleExport = () => {
    const csvRows = [
      ["Nom", "Valeur"],
      ...data.map(row => [row.name, row.value])
    ];
    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporting.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <button onClick={handleExport} className="export-btn">
      Exporter les données
    </button>
  );
};

export default ExportButton;
