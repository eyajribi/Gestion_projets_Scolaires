import React, { useState } from 'react';
import './ProjectCalendar.css';

const ProjectCalendar = ({ projects, onProjectSelect, onEditProject, onDeleteProject }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month' ou 'week'

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    // Correction: getDay() retourne 0 pour dimanche, 1 pour lundi, etc.
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const navigateWeek = (direction) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + (direction * 7)));
  };

  const getTasksForDay = (date) => {
  const dayTasks = [];
  
  projects.forEach(project => {
    if (project.taches) {
      project.taches.forEach(task => {
        const taskDate = new Date(task.dateEcheance);
        if (taskDate.toDateString() === date.toDateString()) {
          dayTasks.push({
            ...task,
            projectName: project.nom,
            isTask: true
          });
        }
      });
    }
  });
  
  return dayTasks;
};

  const getProjectsForDay = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return projects.filter(project => {
      if (!project.dateDebut || !project.dateFin) return false;
      
      const startDate = new Date(project.dateDebut);
      const endDate = new Date(project.dateFin);
      
      // S'assurer que les heures sont ignorées pour la comparaison
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      
      return compareDate >= startDate && compareDate <= endDate;
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'PLANIFIE': '#06b6d4',
      'EN_COURS': '#10b981',
      'TERMINE': '#3b82f6',
      'ANNULE': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getWeekDays = () => {
    const startDate = new Date(currentDate);
    const dayOfWeek = startDate.getDay();
    const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Ajustement pour lundi comme premier jour
    const monday = new Date(startDate.setDate(diff));
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Jours du mois précédent
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);
    
    // Afficher les derniers jours du mois précédent
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push(
        <div key={`prev-${day}`} className="calendar-day other-month">
          <div className="day-header">
            <span className="day-number">{day}</span>
          </div>
        </div>
      );
    }

    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const dayProjects = getProjectsForDay(day);
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = new Date().toDateString() === date.toDateString();
      
      days.push(
        <div key={day} className={`calendar-day ${isToday ? 'today' : ''}`}>
          <div className="day-header">
            <span className="day-number">{day}</span>
            {isToday && <span className="today-badge">Aujourd'hui</span>}
          </div>
          <div className="day-projects">
            {dayProjects.slice(0, 3).map(project => (
              <div
                key={project.id}
                className="calendar-project"
                style={{ borderLeftColor: getStatusColor(project.statut) }}
                onClick={() => onProjectSelect(project)}
                title={`${project.nom} (${project.statut})`}
              >
                <span className="project-name">{project.nom}</span>
                <span className="project-status">{project.statut.toLowerCase().replace('_', ' ')}</span>
              </div>
            ))}
            {dayProjects.length > 3 && (
              <div className="more-projects">
                +{dayProjects.length - 3} autre(s)
              </div>
            )}
          </div>
        </div>
      );
    }

    // Jours du mois suivant pour compléter la grille
    const totalCells = 42; // 6 lignes de 7 jours
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <div key={`next-${day}`} className="calendar-day other-month">
          <div className="day-header">
            <span className="day-number">{day}</span>
          </div>
        </div>
      );
    }

    return days;
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    const days = [];

    weekDays.forEach((date, index) => {
      const dayProjects = projects.filter(project => {
        if (!project.dateDebut || !project.dateFin) return false;
        
        const startDate = new Date(project.dateDebut);
        const endDate = new Date(project.dateFin);
        const compareDate = new Date(date);
        
        compareDate.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        
        return compareDate >= startDate && compareDate <= endDate;
      });

      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div key={index} className={`calendar-day week-view ${isToday ? 'today' : ''}`}>
          <div className="day-header">
            <span className="day-number">{date.getDate()}</span>
            <span className="day-name">{date.toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
            {isToday && <span className="today-badge">Aujourd'hui</span>}
          </div>
          <div className="day-projects">
            {dayProjects.map(project => (
              <div
                key={project.id}
                className="calendar-project"
                style={{ borderLeftColor: getStatusColor(project.statut) }}
                onClick={() => onProjectSelect(project)}
                title={`${project.nom} (${project.statut})`}
              >
                <span className="project-name">{project.nom}</span>
                <span className="project-status">{project.statut.toLowerCase().replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      );
    });

    return days;
  };

  const getNavigationTitle = () => {
    if (view === 'month') {
      return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    } else {
      const weekDays = getWeekDays();
      const start = weekDays[0];
      const end = weekDays[6];
      return `Semaine du ${start.toLocaleDateString('fr-FR')} au ${end.toLocaleDateString('fr-FR')}`;
    }
  };

  const handleNavigation = (direction) => {
    if (view === 'month') {
      navigateMonth(direction);
    } else {
      navigateWeek(direction);
    }
  };

  return (
    <div className="project-calendar">
      {/* En-tête du calendrier */}
      <div className="calendar-header">
        <div className="calendar-navigation">
          <button onClick={() => handleNavigation(-1)} className="nav-btn">
            <i className="fas fa-chevron-left"></i>
          </button>
          <h2>{getNavigationTitle()}</h2>
          <button onClick={() => handleNavigation(1)} className="nav-btn">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <div className="calendar-views">
          <button
            className={`view-btn ${view === 'month' ? 'active' : ''}`}
            onClick={() => setView('month')}
          >
            M
          </button>
          <button
            className={`view-btn ${view === 'week' ? 'active' : ''}`}
            onClick={() => setView('week')}
          >
            Sem
          </button>
        </div>
      </div>

      {/* Légende */}
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="color-dot" style={{ backgroundColor: '#06b6d4' }}></div>
          <span>Planifié</span>
        </div>
        <div className="legend-item">
          <div className="color-dot" style={{ backgroundColor: '#10b981' }}></div>
          <span>En cours</span>
        </div>
        <div className="legend-item">
          <div className="color-dot" style={{ backgroundColor: '#3b82f6' }}></div>
          <span>Terminé</span>
        </div>
        <div className="legend-item">
          <div className="color-dot" style={{ backgroundColor: '#ef4444' }}></div>
          <span>Annulé</span>
        </div>
      </div>

      {/* Grille du calendrier */}
      <div className={`calendar-grid ${view === 'week' ? 'week-view' : ''}`}>
        {/* En-têtes des jours */}
        <div className="calendar-weekday">Lun</div>
        <div className="calendar-weekday">Mar</div>
        <div className="calendar-weekday">Mer</div>
        <div className="calendar-weekday">Jeu</div>
        <div className="calendar-weekday">Ven</div>
        <div className="calendar-weekday">Sam</div>
        <div className="calendar-weekday">Dim</div>

        {/* Jours */}
        {view === 'month' ? renderMonthView() : renderWeekView()}
      </div>
    </div>
  );
};

export default ProjectCalendar;