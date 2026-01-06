package com.example.scolabstudentapp

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.isVisible
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.scolabstudentapp.adapters.TaskAdapter
import com.example.scolabstudentapp.databinding.ActivityTasksBinding
import kotlinx.coroutines.launch

class TasksActivity : AppCompatActivity() {

    private lateinit var binding: ActivityTasksBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityTasksBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Configuration de la Toolbar
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { onBackPressedDispatcher.onBackPressed() }

        setupRecyclerView()
        loadAllTasks()
    }

    private fun setupRecyclerView() {
        binding.tasksRecyclerview.layoutManager = LinearLayoutManager(this)
    }

    private fun loadAllTasks() {
        showLoading(true)

        lifecycleScope.launch {
            try {
                // TODO: Remplacer par l'ID de l'étudiant connecté
                val studentId = "some-student-id"
                val response = ApiClient.apiService.getAllTasks(studentId)

                if (response.isSuccessful) {
                    val tasks = response.body() ?: emptyList()
                    binding.tasksRecyclerview.adapter = TaskAdapter(tasks) { task ->
                        // Action au clic sur le bouton de la tâche
                        Intent(this@TasksActivity, DeliverablesActivity::class.java).also {
                            it.putExtra("EXTRA_TASK", task)
                            startActivity(it)
                        }
                    }
                    // Gérer l'état vide
                    binding.emptyViewText.isVisible = tasks.isEmpty()
                } else {
                    showError("Erreur: ${response.code()}")
                    binding.emptyViewText.isVisible = true
                }

            } catch (e: Exception) {
                e.printStackTrace()
                showError("Erreur de connexion: ${e.message}")
                binding.emptyViewText.isVisible = true
            } finally {
                showLoading(false)
            }
        }
    }

    private fun showLoading(isLoading: Boolean) {
        binding.progressBar.isVisible = isLoading
        binding.tasksRecyclerview.isVisible = !isLoading
    }

    private fun showError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }
}
