package com.example.scolabstudentapp.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.scolabstudentapp.R

class CalendarAdapter : ListAdapter<Map<String, Any>, CalendarAdapter.CalendarViewHolder>(CalendarDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CalendarViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_calendar, parent, false)
        return CalendarViewHolder(view)
    }

    override fun onBindViewHolder(holder: CalendarViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class CalendarViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val titleText: TextView = itemView.findViewById(R.id.eventTitle)
        private val dateText: TextView = itemView.findViewById(R.id.eventDate)
        private val typeText: TextView = itemView.findViewById(R.id.eventType)

        fun bind(event: Map<String, Any>) {
            titleText.text = event["title"]?.toString() ?: "Événement"
            dateText.text = event["date"]?.toString() ?: ""
            typeText.text = event["type"]?.toString() ?: "Projet"
        }
    }
}

class CalendarDiffCallback : DiffUtil.ItemCallback<Map<String, Any>>() {
    override fun areItemsTheSame(oldItem: Map<String, Any>, newItem: Map<String, Any>): Boolean {
        return oldItem["id"] == newItem["id"]
    }

    override fun areContentsTheSame(oldItem: Map<String, Any>, newItem: Map<String, Any>): Boolean {
        return oldItem == newItem
    }
}
