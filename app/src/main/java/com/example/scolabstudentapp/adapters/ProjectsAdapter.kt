package com.example.scolabstudentapp.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.scolabstudentapp.R
import com.example.scolabstudentapp.models.Projet
import com.example.scolabstudentapp.models.StatutProjet
import com.google.android.material.chip.Chip
import com.google.android.material.progressindicator.LinearProgressIndicator
import java.text.SimpleDateFormat
import java.util.Locale

class ProjectsAdapter(
    private val projects: List<Projet>,
    private val onItemClick: (Projet) -> Unit
) : RecyclerView.Adapter<ProjectsAdapter.ProjectViewHolder>() {

    class ProjectViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val projectNameText: TextView = itemView.findViewById(R.id.projectNameText)
        private val projectDescriptionText: TextView = itemView.findViewById(R.id.projectDescriptionText)
        private val projectStatusChip: Chip = itemView.findViewById(R.id.projectStatusChip)
        private val projectProgress: LinearProgressIndicator = itemView.findViewById(R.id.projectProgress)
        private val projectDatesText: TextView? = itemView.findViewById(R.id.projectDatesText)

        fun bind(project: Projet, onItemClick: (Projet) -> Unit) {
            projectNameText.text = project.nom
            // Afficher 'Aucune description' si description nulle ou vide
            projectDescriptionText.text = if (project.description.isNullOrBlank()) "Aucune description" else project.description

            // Afficher les dates formatées
            val dateDebut = formatDate(project.dateDebut)
            val dateFin = formatDate(project.dateFin)
            projectDatesText?.text = "Du $dateDebut au $dateFin"

            // Statut du projet
            val statusText = when (project.statut) {
                StatutProjet.EN_COURS -> "En cours"
                StatutProjet.TERMINE -> "Terminé"
                StatutProjet.EN_ATTENTE -> "En attente"
                StatutProjet.ANNULE -> "Annulé"
                StatutProjet.PLANIFIE -> "Planifié"
            }
            projectStatusChip.text = statusText

            // Gestion du projet archivé
            if (project.estArchive) {
                projectStatusChip.chipBackgroundColor = itemView.context.getColorStateList(R.color.gray)
                projectStatusChip.text = "Archivé"
            } else {
                projectStatusChip.chipBackgroundColor = null // Couleur par défaut
            }

            // Progression (si disponible)
            projectProgress.progress = project.pourcentageAvancement.toInt()

            itemView.setOnClickListener {
                onItemClick(project)
            }
        }

        // Formateur de date ISO -> format lisible (API 24+)
        private fun formatDate(dateStr: String?): String {
            if (dateStr.isNullOrBlank()) return "?"
            return try {
                val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
                val outFormat = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())
                val date = isoFormat.parse(dateStr)
                if (date != null) outFormat.format(date) else dateStr
            } catch (e: Exception) {
                dateStr
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProjectViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_project, parent, false)
        return ProjectViewHolder(view)
    }

    override fun onBindViewHolder(holder: ProjectViewHolder, position: Int) {
        holder.bind(projects[position], onItemClick)
    }

    override fun getItemCount(): Int = projects.size
}
