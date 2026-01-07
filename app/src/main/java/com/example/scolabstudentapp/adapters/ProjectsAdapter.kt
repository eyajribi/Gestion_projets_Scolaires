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

class ProjectsAdapter(
    private val projects: List<Projet>,
    private val onItemClick: (Projet) -> Unit
) : RecyclerView.Adapter<ProjectsAdapter.ProjectViewHolder>() {

    class ProjectViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val projectNameText: TextView = itemView.findViewById(R.id.projectNameText)
        private val projectDescriptionText: TextView = itemView.findViewById(R.id.projectDescriptionText)
        private val projectStatusChip: Chip = itemView.findViewById(R.id.projectStatusChip)
        private val projectProgress: LinearProgressIndicator = itemView.findViewById(R.id.projectProgress)

        fun bind(project: Projet, onItemClick: (Projet) -> Unit) {
            projectNameText.text = project.nom
            projectDescriptionText.text = project.description ?: "Aucune description"
            
            // Statut du projet
            val statusText = when (project.statut) {
                StatutProjet.EN_COURS -> "En cours"
                StatutProjet.TERMINE -> "Terminé"
                StatutProjet.EN_ATTENTE -> "En attente"
                StatutProjet.ANNULE -> "Annulé"
                StatutProjet.PLANIFIE -> "Planifié"
                else -> "Inconnu"
            }
            projectStatusChip.text = statusText
            
            // Progression (si disponible)
            projectProgress.progress = project.pourcentageAvancement.toInt()
            
            itemView.setOnClickListener {
                onItemClick(project)
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
