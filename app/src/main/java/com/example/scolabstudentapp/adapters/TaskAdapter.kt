package com.example.scolabstudentapp.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.scolabstudentapp.R
import com.example.scolabstudentapp.models.Tache

class TaskAdapter(private val onTaskClick: (Tache) -> Unit) : ListAdapter<Tache, TaskAdapter.TaskViewHolder>(TaskDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): TaskViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_task, parent, false)
        return TaskViewHolder(view, onTaskClick)
    }

    override fun onBindViewHolder(holder: TaskViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class TaskViewHolder(itemView: View, private val onTaskClick: (Tache) -> Unit) : RecyclerView.ViewHolder(itemView) {
        private val taskTitleDetailText: TextView = itemView.findViewById(R.id.task_title_detail_text)

        fun bind(task: Tache) {
            taskTitleDetailText.text = task.titre
            
            taskTitleDetailText.setOnClickListener {
                onTaskClick(task)
            }
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
