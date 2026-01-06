import React from 'react';
import TeacherProjectManagement from '../components/Teacher/ProjectManagement/TeacherProjectManagement';

// Cette page devient simplement un wrapper autour de TeacherProjectManagement
// pour éviter d'avoir une deuxième Sidebar et un double layout.
const TeacherDashboard = () => {
  return <TeacherProjectManagement activeView="dashboard" />;
};

export default TeacherDashboard;