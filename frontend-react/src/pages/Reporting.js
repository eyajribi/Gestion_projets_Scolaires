import React, { useState } from "react";
import PeriodSelector from "../components/Statistics/PeriodSelector";
import ReportingCharts from "../components/Statistics/ReportingCharts";
import ExportButton from "../components/Statistics/ExportButton";

const Reporting = () => {
  const [period, setPeriod] = useState({ startDate: "", endDate: "" });

  const sampleData = [
    { name: "2026-01-01", value: 400 },
    { name: "2026-01-10", value: 300 },
    { name: "2026-01-15", value: 200 },
    { name: "2026-01-20", value: 278 },
    { name: "2026-01-25", value: 189 },
  ];

  // Filtrer les données selon la période sélectionnée
  const filteredData = sampleData.filter(row => {
    if (!period.startDate && !period.endDate) return true;
    const date = row.name;
    if (period.startDate && date < period.startDate) return false;
    if (period.endDate && date > period.endDate) return false;
    return true;
  });

  return (
    <div className="reporting-container">
      <h2>Reporting</h2>
      <PeriodSelector onChange={setPeriod} />
      <ReportingCharts data={filteredData} />
      <ExportButton data={filteredData} />
    </div>
  );
};

export default Reporting;
