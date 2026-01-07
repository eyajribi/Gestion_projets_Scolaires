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
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject
import kotlinx.coroutines.launch

@AndroidEntryPoint
class CalendarActivity : AppCompatActivity() {

    private lateinit var binding: ActivityCalendarBinding
    
    @Inject
    lateinit var authManager: AuthManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCalendarBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = getString(R.string.calendar_title)
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
        binding.progressBar.visibility = View.VISIBLE
        
        lifecycleScope.launch {
            try {
                // TODO: Implémenter l'appel API pour récupérer les événements du calendrier
                // val response = RetrofitClient.apiService.getCalendarEvents()
                
                // Pour l'instant, afficher un message
                binding.emptyEventsText.visibility = View.VISIBLE
                binding.emptyEventsText.text = "Aucun événement à afficher"
                
            } catch (e: Exception) {
                Toast.makeText(this@CalendarActivity, "Erreur: ${e.message}", Toast.LENGTH_SHORT).show()
                binding.emptyEventsText.visibility = View.VISIBLE
                binding.emptyEventsText.text = getString(R.string.error_loading_data)
            } finally {
                binding.progressBar.visibility = View.GONE
            }
        }
    }

    private fun loadEventsForDate(year: Int, month: Int, dayOfMonth: Int) {
        binding.progressBar.visibility = View.VISIBLE
        
        lifecycleScope.launch {
            try {
                // TODO: Implémenter l'appel API pour récupérer les événements d'une date spécifique
                // val date = "$year-${month+1}-$dayOfMonth"
                // val response = RetrofitClient.apiService.getEventsForDate(date)
                
                // Pour l'instant, afficher un message
                Toast.makeText(
                    this@CalendarActivity, 
                    "Événements pour $dayOfMonth/${month+1}/$year", 
                    Toast.LENGTH_SHORT
                ).show()
                
            } catch (e: Exception) {
                Toast.makeText(this@CalendarActivity, "Erreur: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                binding.progressBar.visibility = View.GONE
            }
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressedDispatcher.onBackPressed()
        return true
    }
}
