package com.example.scolabstudentapp.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.scolabstudentapp.R
import com.example.scolabstudentapp.models.Tache

class TasksAdapter(
    private val tasks: List<Tache>,
    private val onItemClick: (Tache) -> Unit
) : RecyclerView.Adapter<TasksAdapter.TaskViewHolder>() {

    class TaskViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val taskTitleText: TextView = itemView.findViewById(R.id.task_title_detail_text)
        private val taskDueDateText: TextView = itemView.findViewById(R.id.task_due_date_detail_text)

        fun bind(task: Tache, onItemClick: (Tache) -> Unit) {
            taskTitleText.text = task.titre
            taskDueDateText.text = "Échéance: ${task.dateEcheance}"
            
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
