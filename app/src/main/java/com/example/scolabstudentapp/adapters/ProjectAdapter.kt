package com.example.scolabstudentapp.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.scolabstudentapp.databinding.ItemProjectBinding
import com.example.scolabstudentapp.models.Projet

class ProjectAdapter(private val onItemClicked: (Projet) -> Unit) : ListAdapter<Projet, ProjectAdapter.ProjectViewHolder>(ProjectDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProjectViewHolder {
        val binding = ItemProjectBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ProjectViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ProjectViewHolder, position: Int) {
        val project = getItem(position)
        holder.bind(project)
        holder.itemView.setOnClickListener { onItemClicked(project) }
    }

    inner class ProjectViewHolder(private val binding: ItemProjectBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(project: Projet) {
            binding.projectNameText.text = project.nom
            binding.projectDescriptionText.text = project.description
            binding.projectProgress.progress = project.pourcentageAvancement.toInt()
            binding.projectStatusChip.text = project.statut.toString().replace('_', ' ').lowercase().replaceFirstChar { it.titlecase() }
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
}
