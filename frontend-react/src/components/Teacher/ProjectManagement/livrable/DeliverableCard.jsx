import React, { useState } from 'react';
import StatusBadge from '../../../Common/StatusBadge';

// Carte de livrable réutilisée dans la vue globale et par projet

const COMMENT_SUGGESTIONS = [
	"Travail très satisfaisant, continuez ainsi !",
	"Bon respect des consignes, quelques points à améliorer.",
	"Qualité technique correcte, attention à la présentation.",
	"Livrable incomplet, merci de revoir certains aspects.",
	"Commentaires personnalisés..."
];

const DeliverableCard = ({ deliverable, onEvaluate, onSetInCorrection, onReject }) => {
	const [showHistoryModal, setShowHistoryModal] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const [isEvaluating, setIsEvaluating] = useState(false);
	const [note, setNote] = useState(deliverable?.note ?? '');
	const [commentaires, setCommentaires] = useState(deliverable?.appreciation ?? '');
	const [selectedSuggestion, setSelectedSuggestion] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [errors, setErrors] = useState({});

	// Historique des évaluations (champ evaluations)
	// Historique trié du plus récent au plus ancien
	const evaluations = (deliverable.evaluations || []).slice().sort((a, b) => {
		const da = a.date ? new Date(a.date) : new Date(0);
		const db = b.date ? new Date(b.date) : new Date(0);
		return db - da;
	});

	if (!deliverable) return null;

	const {
		id,
		nom,
		description,
		statut,
		dateEcheance,
		dateSoumission,
		projet,
		groupe,
		fichier,
		evaluation
	} = deliverable;

	const deadline = dateEcheance ? new Date(dateEcheance) : null;
	const submissionDate = dateSoumission ? new Date(dateSoumission) : null;
	const isLate = deadline && deadline < new Date() && statut !== 'CORRIGE' && statut !== 'REJETE';

	const handleEvaluateSubmit = async (e) => {
		e.preventDefault();
		if (!onEvaluate || note === '') return;

		try {
			setSubmitting(true);
			await onEvaluate(id, parseFloat(note), commentaires);
			setIsEvaluating(false);
		} catch (error) {
			console.error("Erreur lors de l'évaluation du livrable:", error);
		} finally {
			setSubmitting(false);
		}
	};
	const validateForm = () => {
		const newErrors = {};
		if (!note || note === '') {
			newErrors.note = 'La note est requise';
		} else {
			const n = parseFloat(note);
			if (isNaN(n) || n < 0 || n > 20) {
				newErrors.note = 'La note doit être un nombre entre 0 et 20';
			}
		}
		if (!commentaires || commentaires.trim().length < 10) {
			newErrors.commentaires = 'Les commentaires doivent contenir au moins 10 caractères';
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const canSetInCorrection = statut === 'SOUMIS';
	const canReject = statut === 'SOUMIS' || statut === 'EN_CORRECTION';
	const canEvaluate = statut === 'EN_CORRECTION' || statut === 'SOUMIS';

		// --- UI/UX amélioré ---
		return (
			<div className={`deliverable-card modern-ui ${isLate ? 'late' : ''}`} style={{boxShadow: '0 2px 12px #0001', borderRadius: 16, margin: '1.5rem 0', background: '#fff', transition: 'box-shadow 0.2s', border: isLate ? '2px solid #e74c3c' : '1px solid #e5e7eb'}}>
				<div className="deliverable-card-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', padding: '1.2rem 1.5rem 0.7rem 1.5rem', borderTopLeftRadius: 16, borderTopRightRadius: 16, background: isLate ? '#fff6f6' : '#f9fafb'}}>
					<div className="deliverable-title-block">
						<h3 className="deliverable-title" style={{margin: 0, fontWeight: 700, fontSize: '1.25rem', color: '#1a202c', cursor: 'pointer'}} onClick={() => setIsExpanded(!isExpanded)}>
							{nom}
							{isLate && <span className="late-badge" style={{marginLeft: 12, color: '#e74c3c', fontWeight: 600, fontSize: '0.95em'}}><i className="fas fa-exclamation-triangle"></i> En retard</span>}
						</h3>
						<div className="deliverable-meta-line" style={{marginTop: 6, display: 'flex', gap: 18, fontSize: '0.98em', color: '#555'}}>
							{projet && (
								<span className="deliverable-project" style={{display: 'flex', alignItems: 'center', gap: 5}}>
									<i className="fas fa-folder"></i> {projet.nom}
								</span>
							)}
							{groupe && (
								<span className="deliverable-group" style={{display: 'flex', alignItems: 'center', gap: 5}}>
									<i className="fas fa-users"></i> {groupe.nom || groupe.libelle}
								</span>
							)}
						</div>
					</div>
					<div className="deliverable-status-block" style={{textAlign: 'right'}}>
						<StatusBadge status={statut} size="md" />
						{deadline && (
							<div className="deliverable-deadline" style={{fontSize: '0.97em', color: '#888', marginTop: 2}}>
								<i className="fas fa-calendar-alt"></i>{' '}
								{deadline.toLocaleDateString('fr-FR')}
							</div>
						)}
						{submissionDate && (
							<div className="deliverable-submission" style={{fontSize: '0.97em', color: '#888'}}>
								<i className="fas fa-clock"></i>{' '}
								Soumis le {submissionDate.toLocaleDateString('fr-FR')}
							</div>
						)}
					</div>
				</div>

				{/* Bloc fichier */}
				{fichier && (
					<div className="deliverable-file-block" style={{margin: '0.5rem 0 1rem 0', background: '#f8fafc', padding: '0.7rem 1.5rem', borderRadius: 12, border: '1px solid #e5e7eb', display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center'}}>
						<span style={{fontWeight: 600, color: '#1a202c'}}><i className="fas fa-file"></i> {fichier.nom}</span>
						<span style={{color: '#888'}}><i className="fas fa-weight-hanging"></i> {fichier.taille ? (fichier.taille < 1024 ? fichier.taille + ' B' : fichier.taille < 1024*1024 ? (fichier.taille/1024).toFixed(1) + ' KB' : (fichier.taille/1024/1024).toFixed(1) + ' MB') : '0 B'}</span>
						<span style={{color: '#888'}}><i className="fas fa-tag"></i> {fichier.type}</span>
						{fichier.dateUpload && <span style={{color: '#888'}}><i className="fas fa-calendar-plus"></i> {new Date(fichier.dateUpload).toLocaleString('fr-FR')}</span>}
						{fichier.url && (
							<a
								href={fichier.url.startsWith('http') ? fichier.url : `/api/fichiers/${encodeURIComponent(fichier.url)}`}
								className="btn btn-sm btn-outline"
								style={{marginLeft: 8, background: '#fff', border: '1px solid #1a7f37', color: '#1a7f37', borderRadius: 6, padding: '0.3em 0.9em', fontWeight: 600, transition: 'background 0.2s'}}
								target="_blank"
								rel="noopener noreferrer"
								download
								onMouseOver={e => e.currentTarget.style.background='#e8f5e9'}
								onMouseOut={e => e.currentTarget.style.background='#fff'}
							>
								<i className="fas fa-download"></i> Télécharger
							</a>
						)}
					</div>
				)}

				{description && (
					<div className={`deliverable-description ${isExpanded ? 'expanded' : ''}`} style={{padding: '0 1.5rem 0.5rem 1.5rem', color: '#333', fontSize: '1.05em'}}>
						<p style={{margin: 0, whiteSpace: 'pre-line'}}>{description}</p>
						{!isExpanded && description.length > 180 && (
							<button
								type="button"
								className="btn btn-text btn-sm"
								style={{marginTop: 6, color: '#1a7f37', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600}}
								onClick={() => setIsExpanded(true)}
							>
								Voir plus
							</button>
						)}
					</div>
				)}

				{/* Bloc évaluation courante détaillée */}
				{evaluation && (
					<div className="deliverable-eval-current" style={{margin: '0.5rem 0 1rem 0', background: '#f3f7f3', padding: '0.7rem 1.5rem', borderRadius: 12, border: '1px solid #e5e7eb', display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center'}}>
						<span style={{fontWeight: 600, color: '#1a7f37'}}><i className="fas fa-star"></i> Note : {evaluation.note != null ? evaluation.note + '/20' : 'Non évalué'}</span>
						{evaluation.commentaires && <span style={{color: '#555'}}><i className="fas fa-comment"></i> {evaluation.commentaires}</span>}
						{evaluation.evaluateur && (
							<span style={{color: '#005'}}>
								<i className="fas fa-user-tie"></i> {
									typeof evaluation.evaluateur === 'object'
										? [evaluation.evaluateur.nom, evaluation.evaluateur.prenom].filter(Boolean).join(' ') || evaluation.evaluateur.email || 'Enseignant'
										: evaluation.evaluateur
								}
							</span>
						)}
						{evaluation.dateEvaluation && <span style={{color: '#888'}}><i className="fas fa-calendar-check"></i> {new Date(evaluation.dateEvaluation).toLocaleString('fr-FR')}</span>}
					</div>
				)}

				<div className="deliverable-footer" style={{padding: '0.7rem 1.5rem 1.2rem 1.5rem', borderBottomLeftRadius: 16, borderBottomRightRadius: 16}}>
					<div className="deliverable-grade" style={{fontSize: '1.1em', fontWeight: 600, color: deliverable.note != null ? '#1a7f37' : '#bbb', marginBottom: 8}}>
						{deliverable.note != null ? (
							<>
								<span className="grade-main">{deliverable.note}/20</span>
								{deliverable.appreciation && (
									<span className="grade-comment" style={{marginLeft: 10, color: '#555', fontWeight: 400}}>{deliverable.appreciation}</span>
								)}
							</>
						) : (
							<span className="grade-placeholder">Non évalué</span>
						)}
					</div>

				{/* Bouton pour afficher l'historique dans un modal */}
				{evaluations.length > 0 && (
					<button
						type="button"
						className="btn btn-sm btn-outline"
						style={{marginTop: 10, marginBottom: 8, border: '1px solid #2563eb', color: '#2563eb', borderRadius: 6, padding: '0.3em 1em', fontWeight: 600, background: '#f8fafc', cursor: 'pointer'}}
						onClick={() => setShowHistoryModal(true)}
					>
						<i className="fas fa-history"></i> Voir l'historique des évaluations
					</button>
				)}

				{/* Modal d'historique des évaluations */}
				{showHistoryModal && (
					<div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0007', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<div style={{
							background: '#fff',
							borderRadius: 14,
							boxShadow: '0 4px 32px #0002',
							padding: '2.2rem 2.5rem',
							minWidth: 620,
							maxWidth: '98vw',
							width: '100%',
							maxHeight: '80vh',
							overflowY: 'auto',
							position: 'relative',
							border: '1.5px solid #e5e7eb',
							scrollbarWidth: 'thin',
							scrollbarColor: '#2563eb #f3f7fa'
						}}>
							<button
								type="button"
								onClick={() => setShowHistoryModal(false)}
								style={{position: 'absolute', top: 16, right: 18, background: 'none', border: 'none', color: '#888', fontSize: 22, cursor: 'pointer'}}
								title="Fermer"
								aria-label="Fermer"
							>
								<i className="fas fa-times"></i>
							</button>
							<h4 style={{marginTop: 0, marginBottom: 8, color: '#2563eb', fontWeight: 700, position: 'sticky', top: 0, background: '#fff', zIndex: 2, paddingBottom: 8}}>
								<i className="fas fa-history"></i> Historique des évaluations
							</h4>
							<div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18, marginBottom: 8}}>
								{nom && (
									<span style={{background: '#f3f7fa', color: '#2563eb', fontWeight: 700, borderRadius: 12, padding: '0.22em 1em', fontSize: '1.04em', letterSpacing: 0.1, border: '1px solid #e5e7eb'}}>
										<i className="fas fa-file-alt"></i> {nom}
									</span>
								)}
								{projet && projet.nom && (
									<span style={{background: '#e8f5e9', color: '#1a7f37', fontWeight: 700, borderRadius: 12, padding: '0.22em 1em', fontSize: '1.04em', letterSpacing: 0.1, border: '1px solid #c3e6cb'}}>
										<i className="fas fa-folder"></i> Projet : {projet.nom}
									</span>
								)}
							</div>
							{groupe && (
								<div style={{
									marginBottom: 18,
									display: 'inline-flex',
									alignItems: 'center',
									background: '#e8f0fe',
									color: '#2563eb',
									fontWeight: 700,
									fontSize: '1.08em',
									borderRadius: 18,
									padding: '0.32em 1.2em 0.32em 0.9em',
									boxShadow: '0 1px 6px #2563eb11',
									letterSpacing: 0.2,
									border: '1.2px solid #c3dafe',
									width: 'fit-content',
									gap: 8
								}}>
									<span style={{display: 'flex', alignItems: 'center', fontSize: '1.1em', marginRight: 6}}>
										<i className="fas fa-users"></i>
									</span>
									<span>Groupe&nbsp;:</span>
									<span style={{fontWeight: 800, color: '#1746a0', marginLeft: 2}}>{groupe.nom || groupe.libelle}</span>
								</div>
							)}
							<div style={{
								marginBottom: 10,
								color: '#444',
								fontSize: '1.05em',
								fontWeight: 500,
								borderBottom: '1.5px solid #e5e7eb',
								paddingBottom: 8,
								display: 'flex',
								gap: 8,
								background: '#fff',
								position: 'sticky',
								top: 54,
								zIndex: 1
							}}>
								<span style={{flex: '0 0 120px'}}>Date</span>
								<span style={{flex: '0 0 80px'}}>Note</span>
								<span style={{flex: 2}}>Commentaires</span>
								<span style={{flex: '0 0 160px'}}>Évaluateur</span>
							</div>
												<ul className="evaluation-history-list" style={{listStyle: 'none', padding: 0, margin: 0}}>
													{evaluations.map((ev, idx) => (
														<li
															key={idx}
															style={{
																display: 'flex',
																alignItems: 'flex-start',
																gap: 8,
																padding: '0.7rem 0.2rem',
																borderBottom: idx < evaluations.length - 1 ? '1px solid #f0f0f0' : 'none',
																fontSize: '1em',
																color: '#222',
																background: idx % 2 === 0 ? '#f8fafc' : '#fff',
																borderRadius: 6,
																transition: 'background 0.18s',
																cursor: 'pointer',
															}}
															onMouseOver={e => e.currentTarget.style.background='#e8f0fe'}
															onMouseOut={e => e.currentTarget.style.background=idx%2===0?'#f8fafc':'#fff'}
														>
															<span style={{flex: '0 0 120px', color: '#888', fontSize: '0.98em'}}>
																{ev.dateEvaluation
																	? new Date(ev.dateEvaluation).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
																	: ev.date
																		? new Date(ev.date).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
																		: '-'}
															</span>
															<span style={{flex: '0 0 80px', display: 'flex', alignItems: 'center'}}>
																{ev.note != null ? (
																	<span style={{background: '#2563eb', color: '#fff', borderRadius: 8, padding: '0.18em 0.9em', fontWeight: 700, fontSize: '1.08em', boxShadow: '0 1px 4px #2563eb22'}}>{ev.note}</span>
																) : (
																	<span style={{color:'#bbb'}}> - </span>
																)}
															</span>
															<span style={{flex: 2, color: '#333', fontSize: '0.99em', whiteSpace: 'pre-line'}}>
																{ev.commentaires || ev.commentaire || <span style={{color:'#bbb'}}>Aucun commentaire</span>}
															</span>
															<span style={{flex: '0 0 160px', color: '#005', fontWeight: 500}}>
																{(() => {
																	if (!ev.evaluateur) return <span style={{color:'#bbb'}}>Inconnu</span>;
																	if (typeof ev.evaluateur === 'object') {
																		const nomComplet = [ev.evaluateur.nom, ev.evaluateur.prenom].filter(Boolean).join(' ');
																		return nomComplet || ev.evaluateur.email || 'Enseignant';
																	}
																	return ev.evaluateur;
																})()}
															</span>
														</li>
													))}
												</ul>
						</div>
					</div>
				)}

					<div className="deliverable-actions" style={{marginTop: 18, display: 'flex', gap: 12, flexWrap: 'wrap'}}>
						{canSetInCorrection && onSetInCorrection && (
							<button
								type="button"
								className="btn btn-md btn-primary"
								style={{background: '#1a7f37', color: '#fff', border: 'none', borderRadius: 6, padding: '0.45em 1.2em', fontWeight: 600, fontSize: '1em', boxShadow: '0 1px 4px #1a7f3722', transition: 'background 0.2s'}}
								onClick={() => onSetInCorrection(id)}
								onMouseOver={e => e.currentTarget.style.background='#17692e'}
								onMouseOut={e => e.currentTarget.style.background='#1a7f37'}
							>
								<i className="fas fa-edit"></i> Mettre en correction
							</button>
						)}

						{canEvaluate && onEvaluate && (
							<button
								type="button"
								className="btn btn-md btn-success"
								style={{background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '0.45em 1.2em', fontWeight: 600, fontSize: '1em', boxShadow: '0 1px 4px #2563eb22', transition: 'background 0.2s'}}
								onClick={() => setIsEvaluating(true)}
								onMouseOver={e => e.currentTarget.style.background='#1746a0'}
								onMouseOut={e => e.currentTarget.style.background='#2563eb'}
							>
								<i className="fas fa-check"></i> Évaluer
							</button>
						)}

						{canReject && onReject && (
							<button
								type="button"
								className="btn btn-md btn-outline"
								style={{background: '#fff', color: '#e74c3c', border: '1.5px solid #e74c3c', borderRadius: 6, padding: '0.45em 1.2em', fontWeight: 600, fontSize: '1em', boxShadow: '0 1px 4px #e74c3c22', transition: 'background 0.2s'}}
								onClick={() => onReject(id)}
								onMouseOver={e => {e.currentTarget.style.background='#fbeaea'; e.currentTarget.style.color='#c0392b';}}
								onMouseOut={e => {e.currentTarget.style.background='#fff'; e.currentTarget.style.color='#e74c3c';}}
							>
								<i className="fas fa-times"></i> Rejeter
							</button>
						)}
					</div>
				</div>

				{isEvaluating && (
					<div className="deliverable-eval-modal" style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0007', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<div className="eval-card" style={{background: '#fff', borderRadius: 14, boxShadow: '0 4px 32px #0002', padding: '2.2rem 2.5rem', minWidth: 320, maxWidth: 420}}>
							<h4 style={{marginTop: 0, marginBottom: 18, color: '#2563eb', fontWeight: 700}}>Évaluer le livrable</h4>
							<form onSubmit={handleEvaluateSubmit}>
								<div className="form-group" style={{marginBottom: 18}}>
									<label style={{fontWeight: 600, color: '#1a202c'}}>Note (sur 20)</label>
									<input
										type="number"
										min="0"
										max="20"
										step="0.5"
										value={note}
										onChange={(e) => setNote(e.target.value)}
										required
										disabled={submitting}
										style={{width: '100%', padding: '0.5em', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: '1.1em', marginTop: 4}}
									/>
									{errors.note && <div style={{color: '#e74c3c', fontSize: '0.98em', marginTop: 4}}>{errors.note}</div>}
								</div>
								<div className="form-group" style={{marginBottom: 18}}>
									<label style={{fontWeight: 600, color: '#1a202c'}}>Commentaires</label>
									<textarea
										rows={3}
										value={commentaires}
										onChange={(e) => {
											setCommentaires(e.target.value);
											if (selectedSuggestion && e.target.value !== selectedSuggestion) setSelectedSuggestion('');
										}}
										disabled={submitting}
										style={{width: '100%', padding: '0.5em', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: '1.05em', marginTop: 4}}
									/>
									{errors.commentaires && <div style={{color: '#e74c3c', fontSize: '0.98em', marginTop: 4}}>{errors.commentaires}</div>}
									<div style={{marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8}}>
										{COMMENT_SUGGESTIONS.map((s, i) => (
											<button
												key={i}
												type="button"
												onClick={() => { setCommentaires(s); setSelectedSuggestion(s); }}
												disabled={submitting}
												style={{
													background: commentaires === s ? '#2563eb' : '#f3f7fa',
													color: commentaires === s ? '#fff' : '#2563eb',
													border: '1px solid #2563eb',
													borderRadius: 6,
													padding: '0.3em 0.8em',
													fontWeight: 500,
													fontSize: '0.98em',
													cursor: 'pointer',
													transition: 'background 0.2s, color 0.2s',
													outline: 'none',
													boxShadow: commentaires === s ? '0 2px 8px #2563eb22' : 'none'
												}}
											>{s}</button>
										))}
									</div>
								</div>
								<div className="eval-actions" style={{display: 'flex', gap: 12, justifyContent: 'flex-end'}}>
									<button
										type="button"
										className="btn btn-md btn-secondary"
										style={{background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '0.45em 1.2em', fontWeight: 600, fontSize: '1em'}}
										onClick={() => setIsEvaluating(false)}
										disabled={submitting}
									>
										Annuler
									</button>
									<button
										type="submit"
										className="btn btn-md btn-success"
										style={{background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '0.45em 1.2em', fontWeight: 600, fontSize: '1em', boxShadow: '0 1px 4px #2563eb22', transition: 'background 0.2s'}}
										disabled={submitting || note === ''}
									>
										{submitting ? 'Enregistrement...' : 'Enregistrer'}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}
			</div>
		);
};

export default DeliverableCard;

