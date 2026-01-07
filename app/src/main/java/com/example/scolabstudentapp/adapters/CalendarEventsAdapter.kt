package com.example.scolabstudentapp.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.scolabstudentapp.R
import com.example.scolabstudentapp.models.CalendarEvent
import java.text.SimpleDateFormat
import java.util.*

class CalendarEventsAdapter(
    private val events: List<CalendarEvent>
) : RecyclerView.Adapter<CalendarEventsAdapter.CalendarViewHolder>() {

    class CalendarViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val eventTitle: TextView = itemView.findViewById(R.id.eventTitle)
        val eventDate: TextView = itemView.findViewById(R.id.eventDate)
        val eventDescription: TextView = itemView.findViewById(R.id.eventDescription)

        fun bind(event: CalendarEvent) {
            eventTitle.text = event.titre
            eventDate.text = SimpleDateFormat("dd MMM yyyy", Locale.FRENCH).format(event.dateDebut)
            eventDescription.text = event.description ?: ""
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CalendarViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_calendar_event, parent, false)
        return CalendarViewHolder(view)
    }

    override fun onBindViewHolder(holder: CalendarViewHolder, position: Int) {
        holder.bind(events[position])
    }

    override fun getItemCount(): Int = events.size
}
