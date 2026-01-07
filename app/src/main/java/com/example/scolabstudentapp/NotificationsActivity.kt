package com.example.scolabstudentapp

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.scolabstudentapp.adapters.NotificationAdapter
import com.example.scolabstudentapp.api.RetrofitClient
import com.example.scolabstudentapp.databinding.ActivityNotificationsBinding
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class NotificationsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityNotificationsBinding
    private lateinit var notificationAdapter: NotificationAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityNotificationsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupToolbar()
        setupRecyclerView()
        loadNotifications()
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }
    }

    private fun setupRecyclerView() {
        notificationAdapter = NotificationAdapter { notification ->
            // Marquer comme lu
            markAsRead(notification.id)
        }
        binding.notificationsRecyclerView.apply {
            layoutManager = LinearLayoutManager(this@NotificationsActivity)
            adapter = notificationAdapter
        }
    }

    private fun loadNotifications() {
        lifecycleScope.launch {
            try {
                binding.progressBar.visibility = android.view.View.VISIBLE
                
                val response = RetrofitClient.getEtudiantNotifications()
                
                if (response.isSuccessful) {
                    val notifications = response.body()
                    if (!notifications.isNullOrEmpty()) {
                        notificationAdapter.submitList(notifications)
                        binding.emptyView.visibility = android.view.View.GONE
                        binding.notificationsRecyclerView.visibility = android.view.View.VISIBLE
                    } else {
                        showEmptyView()
                    }
                } else {
                    Toast.makeText(this@NotificationsActivity, "Erreur de chargement: ${response.code()}", Toast.LENGTH_SHORT).show()
                    showEmptyView()
                }
                
            } catch (e: Exception) {
                Toast.makeText(this@NotificationsActivity, "Erreur réseau: ${e.message}", Toast.LENGTH_SHORT).show()
                showEmptyView()
            } finally {
                binding.progressBar.visibility = android.view.View.GONE
            }
        }
    }

    private fun markAsRead(notificationId: String) {
        lifecycleScope.launch {
            try {
                // TODO: Implémenter l'API pour marquer comme lu
                // Pour l'instant, on recharge juste la liste
                loadNotifications()
            } catch (e: Exception) {
                println("DEBUG: Erreur marquer comme lu: ${e.message}")
            }
        }
    }

    private fun showEmptyView() {
        binding.emptyView.visibility = android.view.View.VISIBLE
        binding.notificationsRecyclerView.visibility = android.view.View.GONE
    }
}
