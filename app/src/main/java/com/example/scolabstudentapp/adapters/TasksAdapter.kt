package com.example.scolabstudentapp.adapters

import android.content.Intent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.scolabstudentapp.DeliverablesActivity
import com.example.scolabstudentapp.R
import com.example.scolabstudentapp.models.Tache

class TasksAdapter(
    private val tasks: List<Tache>,
    private val onItemClick: (Tache) -> Unit
) : RecyclerView.Adapter<TasksAdapter.TaskViewHolder>() {

    class TaskViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val taskTitleText: TextView = itemView.findViewById(R.id.task_title_detail_text)
        private val taskDueDateText: TextView = itemView.findViewById(R.id.task_due_date_detail_text)
        private val submitButton: View = itemView.findViewById(R.id.submit_button)

        fun bind(task: Tache, onItemClick: (Tache) -> Unit) {
            taskTitleText.text = task.titre
            taskDueDateText.text = "Échéance: ${task.dateEcheance}"
            // Afficher le bouton Déposer seulement si la tâche est à faire ou en cours
            if (task.statut == "A_FAIRE" || task.statut == "EN_COURS") {
                submitButton.visibility = View.VISIBLE
                submitButton.setOnClickListener {
                    val context = itemView.context
                    val intent = Intent(context, DeliverablesActivity::class.java)
                    intent.putExtra("EXTRA_TASK_ID", task.id)
                    intent.putExtra("EXTRA_PROJECT_ID", task.projetId)
                    intent.putExtra("EXTRA_TASK_TITLE", task.titre)
                    context.startActivity(intent)
                }
            } else {
                submitButton.visibility = View.GONE
            }
            itemView.setOnClickListener {
                onItemClick(task)
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): TaskViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_task, parent, false)
        return TaskViewHolder(view)
    }

    override fun onBindViewHolder(holder: TaskViewHolder, position: Int) {
        holder.bind(tasks[position], onItemClick)
    }

    override fun getItemCount(): Int = tasks.size
}
