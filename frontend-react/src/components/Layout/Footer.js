import React from "react";
import { useLocation, Link } from "react-router-dom";
import logoE from "../../logoE.png";
import "./Footer.css";

const Footer = () => {
	const location = useLocation();

	const sidebarPaths = [
		"/teacher-dashboard",
		"/projects",
		"/groups",
		"/deliverables",
		"/statistics",
		"/tasks",
		"/profile",
	];

	const hasSidebar = sidebarPaths.some((path) =>
		location.pathname.startsWith(path)
	);

	return (
		<footer className={`dashboard-footer${hasSidebar ? " dashboard-footer--with-sidebar" : ""}`}>
			<div className="footer-container">
				<div className="footer-content">
					<div className="footer-column">
						<div className="footer-brand">
							<img src={logoE} alt="Logo EduProject" className="footer-logo" />
							<div className="footer-brand-text">
								<h3>EduProject</h3>
								<p>
									Plateforme de gestion de projets académiques pour les
									universités, instituts et écoles.
								</p>
							</div>
						</div>
					</div>
					<div className="footer-column">
						<h3>Navigation</h3>
						<ul className="footer-links">
							<li>
								<Link to="/teacher-dashboard">
									<i className="fas fa-tachometer-alt"></i>
									<span>Tableau de bord</span>
								</Link>
							</li>
							<li>
								<Link to="/projects">
									<i className="fas fa-project-diagram"></i>
									<span>Projets</span>
								</Link>
							</li>
							<li>
								<Link to="/deliverables">
									<i className="fas fa-file-upload"></i>
									<span>Livrables</span>
								</Link>
							</li>
							<li>
								<Link to="/groups">
									<i className="fas fa-users"></i>
									<span>Groupes</span>
								</Link>
							</li>
						</ul>
					</div>
					<div className="footer-column">
						<h3>Contact</h3>
						<div className="footer-contact">
							<div className="contact-item">
								<i className="fas fa-map-marker-alt"></i>
								<span>Établissements d'enseignement supérieur</span>
							</div>
							<div className="contact-item">
								<i className="fas fa-envelope"></i>
								<span>support@eduproject.tn</span>
							</div>
							<div className="contact-item">
								<i className="fas fa-phone"></i>
								<span>+216 12 345 678</span>
							</div>
						</div>
					</div>
				</div>
				<div className="copyright">
					<p>&copy; 2026 EduProject - Tous droits réservés</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
