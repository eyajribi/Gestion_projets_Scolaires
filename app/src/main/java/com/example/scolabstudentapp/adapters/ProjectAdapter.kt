package com.example.scolabstudentapp.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.scolabstudentapp.R
import com.example.scolabstudentapp.models.Projet
import com.google.android.material.card.MaterialCardView
import com.google.android.material.chip.Chip

class ProjectAdapter(private val onProjectClick: (Projet) -> Unit) : ListAdapter<Projet, ProjectAdapter.ProjectViewHolder>(ProjectDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProjectViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_project, parent, false)
        return ProjectViewHolder(view, onProjectClick)
    }

    override fun onBindViewHolder(holder: ProjectViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class ProjectViewHolder(itemView: View, private val onProjectClick: (Projet) -> Unit) : RecyclerView.ViewHolder(itemView) {
        private val projectNameText: TextView = itemView.findViewById(R.id.projectNameText)
        private val projectStatusChip: Chip = itemView.findViewById(R.id.projectStatusChip)
        private val projectDescriptionText: TextView = itemView.findViewById(R.id.projectDescriptionText)
        private val projectProgress: com.google.android.material.progressindicator.LinearProgressIndicator = itemView.findViewById(R.id.projectProgress)
        private val projectCard: MaterialCardView = itemView as MaterialCardView

        fun bind(project: Projet) {
            projectNameText.text = project.nom
            projectDescriptionText.text = project.description ?: "Aucune description"
            
            // Mettre à jour l'apparence selon le statut
            val statusText = project.statut ?: "NON DÉFINI"
            when (statusText.toString().uppercase()) {
                "ACTIF", "EN_COURS" -> {
                    projectStatusChip.text = "Actif"
                    projectStatusChip.setChipBackgroundColorResource(android.R.color.holo_green_light)
                }
                "TERMINÉ", "COMPLÉTÉ" -> {
                    projectStatusChip.text = "Terminé"
                    projectStatusChip.setChipBackgroundColorResource(android.R.color.holo_blue_light)
                }
                "EN_ATTENTE", "PAUSÉ" -> {
                    projectStatusChip.text = "En attente"
                    projectStatusChip.setChipBackgroundColorResource(android.R.color.holo_orange_light)
                }
                "ANNULÉ" -> {
                    projectStatusChip.text = "Annulé"
                    projectStatusChip.setChipBackgroundColorResource(android.R.color.holo_red_light)
                }

            }
            
            projectCard.setOnClickListener {
                onProjectClick(project)
            }
        }
    }
}

class ProjectDiffCallback : DiffUtil.ItemCallback<Projet>() {
    override fun areItemsTheSame(oldItem: Projet, newItem: Projet): Boolean {
        return oldItem.id == newItem.id
    }

    override fun areContentsTheSame(oldItem: Projet, newItem: Projet): Boolean {
        return oldItem == newItem
    }
}
