package com.example.scolabstudentapp

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.scolabstudentapp.databinding.ActivityCalendarBinding
import com.example.scolabstudentapp.api.RetrofitClient
import com.example.scolabstudentapp.auth.AuthManager
import com.example.scolabstudentapp.models.CalendarEvent
import com.example.scolabstudentapp.adapters.CalendarEventsAdapter
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import dagger.hilt.android.AndroidEntryPoint
import java.text.SimpleDateFormat
import java.util.*
import javax.inject.Inject
import kotlinx.coroutines.launch

@AndroidEntryPoint
class CalendarActivity : AppCompatActivity() {

    private lateinit var binding: ActivityCalendarBinding
    private lateinit var calendarAdapter: CalendarEventsAdapter
    private var calendarEvents: List<CalendarEvent> = emptyList()
    
    @Inject
    lateinit var authManager: AuthManager
    private val gson = Gson()
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCalendarBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Données de test pour vérifier l'affichage
        println("DEBUG: Initialisation de CalendarActivity")
        
        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = "Calendrier"
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { onBackPressedDispatcher.onBackPressed() }

        setupCalendar()
        loadCalendarEvents()
    }

    private fun setupCalendar() {
        // Configuration du calendrier
        binding.calendarView.setOnDateChangeListener { _, year, month, dayOfMonth ->
            // Afficher les événements pour la date sélectionnée
            loadEventsForDate(year, month, dayOfMonth)
        }
    }

    private fun loadCalendarEvents() {
        println("DEBUG: Chargement des événements du calendrier")
        lifecycleScope.launch {
            try {
                binding.progressBar.visibility = View.VISIBLE
                
                val response = RetrofitClient.getEtudiantCalendrier()
                println("DEBUG: Réponse API calendrier: ${response.isSuccessful}")
                
                if (response.isSuccessful) {
                    val eventsData = response.body()
                    if (eventsData != null && eventsData.isNotEmpty()) {
                        Toast.makeText(this@CalendarActivity, "${eventsData.size} événements calendrier trouvés", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(this@CalendarActivity, "Aucun événement trouvé", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    println("DEBUG: Erreur API calendrier: ${response.code()} - ${response.message()}")
                    Toast.makeText(this@CalendarActivity, "Erreur de chargement: ${response.message()}", Toast.LENGTH_LONG).show()
                }
                
            } catch (e: Exception) {
                println("DEBUG: Exception calendrier: ${e.message}")
                Toast.makeText(this@CalendarActivity, "Erreur réseau: ${e.message}", Toast.LENGTH_LONG).show()
            } finally {
                binding.progressBar.visibility = View.GONE
            }
        }
    }

    private fun loadEventsForDate(year: Int, month: Int, dayOfMonth: Int) {
        val dateStr = String.format("%04d-%02d-%02d", year, month + 1, dayOfMonth)
        val filteredEvents = calendarEvents.filter { event ->
            val eventDateStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(event.dateDebut)
            eventDateStr.startsWith(dateStr)
        }
        
        if (filteredEvents.isNotEmpty()) {
            val eventsText = filteredEvents.joinToString("\n") { "${it.titre}: ${it.description ?: ""}" }
            Toast.makeText(this, "Événements du $dateStr:\n$eventsText", Toast.LENGTH_LONG).show()
        } else {
            Toast.makeText(this, "Aucun événement pour cette date", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressedDispatcher.onBackPressed()
        return true
    }
}
