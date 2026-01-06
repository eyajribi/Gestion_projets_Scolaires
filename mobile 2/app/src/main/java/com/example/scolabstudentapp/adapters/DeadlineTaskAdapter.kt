package com.example.scolabstudentapp.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.scolabstudentapp.databinding.ItemDeadlineTaskBinding
import com.example.scolabstudentapp.models.Tache
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class DeadlineTaskAdapter(private val tasks: List<Tache>) : RecyclerView.Adapter<DeadlineTaskAdapter.DeadlineViewHolder>() {

    inner class DeadlineViewHolder(private val binding: ItemDeadlineTaskBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(task: Tache) {
            binding.taskTitleText.text = task.titre
            binding.taskDueDateText.text = formatRemainingTime(task.dateEcheance)
        }

        private fun formatRemainingTime(dueDateString: String): String {
            return try {
                val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
                sdf.timeZone = TimeZone.getTimeZone("UTC")
                val dueDate: Date = sdf.parse(dueDateString) ?: return "Date invalide"

                val now = Calendar.getInstance().time
                val diff = dueDate.time - now.time
                val daysRemaining = diff / (1000 * 60 * 60 * 24)

                when {
                    daysRemaining < 0 -> "En retard"
                    daysRemaining == 0L -> "Aujourd'hui"
                    daysRemaining == 1L -> "Demain"
                    else -> "Dans $daysRemaining jours"
                }
            } catch (e: Exception) {
                "Date invalide"
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): DeadlineViewHolder {
        val binding = ItemDeadlineTaskBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return DeadlineViewHolder(binding)
    }

    override fun onBindViewHolder(holder: DeadlineViewHolder, position: Int) {
        holder.bind(tasks[position])
    }

    override fun getItemCount(): Int = tasks.size
}
