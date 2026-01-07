package com.example.scolabstudentapp.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.scolabstudentapp.R
import com.example.scolabstudentapp.models.Notification

class NotificationAdapter(private val onItemClick: (Notification) -> Unit) : ListAdapter<Notification, NotificationAdapter.NotificationViewHolder>(NotificationDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): NotificationViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_notification, parent, false)
        return NotificationViewHolder(view, onItemClick)
    }

    override fun onBindViewHolder(holder: NotificationViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class NotificationViewHolder(itemView: View, private val onItemClick: (Notification) -> Unit) : RecyclerView.ViewHolder(itemView) {
        private val titleText: TextView = itemView.findViewById(R.id.notificationTitle)
        private val messageText: TextView = itemView.findViewById(R.id.notificationMessage)
        private val dateText: TextView = itemView.findViewById(R.id.notificationDate)
        private val unreadIndicator: View = itemView.findViewById(R.id.unreadIndicator)

        fun bind(notification: Notification) {
            titleText.text = notification.titre
            messageText.text = notification.message
            dateText.text = notification.dateCreation
            
            // Afficher l'indicateur de non lu (simplifié)
            unreadIndicator.visibility = View.GONE
            
            itemView.setOnClickListener {
                onItemClick(notification)
            }
        }
    }
}

class NotificationDiffCallback : DiffUtil.ItemCallback<Notification>() {
    override fun areItemsTheSame(oldItem: Notification, newItem: Notification): Boolean {
        return oldItem.id == newItem.id
    }

    override fun areContentsTheSame(oldItem: Notification, newItem: Notification): Boolean {
        return oldItem == newItem
    }
}
