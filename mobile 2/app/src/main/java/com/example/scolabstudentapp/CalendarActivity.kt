package com.example.scolabstudentapp

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.RecyclerView
import com.example.scolabstudentapp.databinding.ActivityCalendarBinding

class CalendarActivity : AppCompatActivity() {

    private lateinit var binding: ActivityCalendarBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCalendarBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = "Calendrier"

        // Charger les événements dynamiques
        // TODO: Ajouter la logique pour charger les événements depuis l'API
    }
}
