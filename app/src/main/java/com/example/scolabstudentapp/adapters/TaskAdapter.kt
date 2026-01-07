package com.example.scolabstudentapp.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.scolabstudentapp.R
import com.example.scolabstudentapp.databinding.ItemTaskBinding
import com.example.scolabstudentapp.models.Tache
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class TaskAdapter(
    private val onTaskActionClicked: (Tache) -> Unit
) : ListAdapter<Tache, TaskAdapter.TaskViewHolder>(TaskDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): TaskViewHolder {
        val binding = ItemTaskBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return TaskViewHolder(binding)
    }

    override fun onBindViewHolder(holder: TaskViewHolder, position: Int) {
        val task = getItem(position)
        holder.bind(task)
    }

    inner class TaskViewHolder(private val binding: ItemTaskBinding) : RecyclerView.ViewHolder(binding.root) {
        private val outputFormat = SimpleDateFormat("'Pour le' dd MMM", Locale.FRENCH)
        private val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault()).apply {
            timeZone = TimeZone.getTimeZone("UTC")
        }

        fun bind(task: Tache) {
            binding.taskTitleDetailText.text = task.titre
            try {
                val date: Date? = inputFormat.parse(task.dateEcheance)
                binding.taskDueDateDetailText.text = date?.let { outputFormat.format(it) } ?: "Date invalide"
            } catch (e: Exception) {
                binding.taskDueDateDetailText.text = "Date invalide"
            }

            val statusIcon = when (task.statut) {
                "TERMINEE" -> R.drawable.ic_task_done
                "EN_RETARD" -> R.drawable.ic_task_late
                else -> R.drawable.ic_task_todo // A_FAIRE, EN_COURS, EN_ATTENTE
            }
            binding.taskStatusIcon.setImageResource(statusIcon)

            // The button changes based on the presence of a submitted deliverable
            // This functionality is commented out as `livrableAssocie` is not in the Tache model
            // if (task.livrableAssocie?.fichier != null) {
            //     binding.submitButton.text = "Voir le dépôt"
            // } else {
            binding.submitButton.text = "Déposer"
            // }

            binding.submitButton.setOnClickListener {
                onTaskActionClicked(task)
            }
        }
    }

    class TaskDiffCallback : DiffUtil.ItemCallback<Tache>() {
        override fun areItemsTheSame(oldItem: Tache, newItem: Tache): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: Tache, newItem: Tache): Boolean {
            return oldItem == newItem
        }
    }
}
