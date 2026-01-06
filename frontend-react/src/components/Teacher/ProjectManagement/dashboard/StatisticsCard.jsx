import React from 'react';

const StatisticsCard = ({ title, value, icon, color, trend, subtitle }) => {
  const getColorClass = () => {
    const colors = {
      primary: 'stat-primary',
      success: 'stat-success',
      warning: 'stat-warning',
      danger: 'stat-danger',
      info: 'stat-info',
      secondary: 'stat-secondary'
    };
    return colors[color] || 'stat-primary';
  };

  return (
    <div className={`statistics-card ${getColorClass()}`}>
      <div className="stat-content">
        <div className="stat-icon">
          <i className={icon}></i>
        </div>
        <div className="stat-data">
          <div className="stat-value">{value}</div>
          <div className="stat-title">{title}</div>
          {subtitle && <div className="stat-subtitle">{subtitle}</div>}
        </div>
      </div>
      {trend && (
        <div className={`stat-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
          <i className={`fas fa-${trend.isPositive ? 'arrow-up' : 'arrow-down'}`}></i>
          <span>{trend.value}%</span>
        </div>
      )}
    </div>
  );
};

export default StatisticsCard;