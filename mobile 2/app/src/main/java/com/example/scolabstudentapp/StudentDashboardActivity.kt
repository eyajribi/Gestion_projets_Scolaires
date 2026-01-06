package com.example.scolabstudentapp

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.scolabstudentapp.adapters.DeadlineTaskAdapter
import com.example.scolabstudentapp.api.RetrofitClient
import com.example.scolabstudentapp.databinding.ActivityStudentDashboardBinding
import com.example.scolabstudentapp.models.Tache
import kotlinx.coroutines.launch

class StudentDashboardActivity : AppCompatActivity() {

    private lateinit var binding: ActivityStudentDashboardBinding
    private lateinit var deadlineTaskAdapter: DeadlineTaskAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityStudentDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)

        setupRecyclerView()
        setupNavigation()

        loadAllDashboardData()
    }

    private fun setupRecyclerView() {
        binding.deadlinesRecyclerview.layoutManager = LinearLayoutManager(this)
    }

    private fun setupNavigation() {
        binding.quickAccessProjectsCard.setOnClickListener {
            startActivity(Intent(this, ProjectsActivity::class.java))
        }

        binding.quickAccessTasksCard.setOnClickListener {
            startActivity(Intent(this, TasksActivity::class.java))
        }

        binding.quickAccessFeedbacksCard.setOnClickListener {
            startActivity(Intent(this, FeedbacksActivity::class.java))
        }
    }

    private fun loadAllDashboardData() {
        // In a real app, you should get the studentId from your AuthManager or wherever it's stored
        val studentId = "TODO_GET_STUDENT_ID"

        loadUserInfo(studentId)
        loadUpcomingDeadlines(studentId)
    }

    private fun loadUserInfo(studentId: String) {
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.apiService.getUserProfile(studentId)
                if (response.isSuccessful) {
                    val user = response.body()
                    binding.studentNameText.text = "Bonjour, ${user?.prenom ?: "Étudiant"}!"
                } else {
                    binding.studentNameText.text = "Bonjour, Étudiant!"
                }
            } catch (e: Exception) {
                binding.studentNameText.text = "Bonjour, Étudiant!"
            }
        }
    }

    private fun loadUpcomingDeadlines(studentId: String) {
        lifecycleScope.launch {
            try {
                // This endpoint does not exist in the provided ApiService, so I will use getMyTasks()
                val response = RetrofitClient.apiService.getMyTasks()
                if (response.isSuccessful) {
                    val tasks = response.body() ?: emptyList()
                    updateDeadlinesUI(tasks)
                } else {
                    updateDeadlinesUI(emptyList())
                }
            } catch (e: Exception) {
                updateDeadlinesUI(emptyList())
            }
        }
    }

    private fun updateDeadlinesUI(tasks: List<Tache>) {
        if (tasks.isEmpty()) {
            // You could show a message here
        }
        deadlineTaskAdapter = DeadlineTaskAdapter(tasks)
        binding.deadlinesRecyclerview.adapter = deadlineTaskAdapter
    }

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.student_menu, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.menu_profile -> {
                startActivity(Intent(this, ProfileActivity::class.java))
                true
            }
            R.id.menu_settings -> {
                // Implement settings
                true
            }
            R.id.menu_logout -> {
                RetrofitClient.clearTokens()
                startActivity(Intent(this, LoginActivity::class.java))
                finish()
                true
            }
            R.id.menu_livrables -> {
                startActivity(Intent(this, DeliverablesActivity::class.java))
                true
            }
            R.id.menu_feedbacks -> {
                startActivity(Intent(this, FeedbacksActivity::class.java))
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
}
