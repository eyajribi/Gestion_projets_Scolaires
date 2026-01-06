import React, { useState } from "react";

const PeriodSelector = ({ onChange }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleChange = () => {
    if (onChange) {
      onChange({ startDate, endDate });
    }
  };

  return (
    <div className="period-selector">
      <label>
        Date de début:
        <input
          type="date"
          value={startDate}
          onChange={e => { setStartDate(e.target.value); handleChange(); }}
        />
      </label>
      <label>
        Date de fin:
        <input
          type="date"
          value={endDate}
          onChange={e => { setEndDate(e.target.value); handleChange(); }}
        />
      </label>
    </div>
  );
};

export default PeriodSelector;
