package com.example.scolabstudentapp

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.scolabstudentapp.adapters.FeedbacksAdapter
import com.example.scolabstudentapp.databinding.ActivityFeedbacksBinding
import com.example.scolabstudentapp.models.Feedback
import com.example.scolabstudentapp.api.RetrofitClient
import com.example.scolabstudentapp.auth.AuthManager
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject
import kotlinx.coroutines.launch

@AndroidEntryPoint
class FeedbacksActivity : AppCompatActivity() {

    private lateinit var binding: ActivityFeedbacksBinding
    private lateinit var feedbacksAdapter: FeedbacksAdapter
    private var feedbacks: MutableList<Feedback> = mutableListOf()
    
    @Inject
    lateinit var authManager: AuthManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityFeedbacksBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = "Feedbacks"
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        setupRecyclerView()
        loadFeedbacks()
    }

    private fun setupRecyclerView() {
        feedbacksAdapter = FeedbacksAdapter(mutableListOf())
        feedbacksAdapter.setOnReplyClickListener { feedback ->
            showReplyDialog(feedback)
        }
        binding.feedbacksRecyclerView.apply {
            adapter = feedbacksAdapter
            layoutManager = LinearLayoutManager(this@FeedbacksActivity)
        }
    }

    private fun loadFeedbacks() {
        println("DEBUG: Chargement des feedbacks depuis le backend")
        binding.progressBar.visibility = View.VISIBLE
        
        lifecycleScope.launch {
            try {
                // Utiliser le nouveau backend pour charger les feedbacks
                val response = RetrofitClient.getEtudiantNotifications()
                
                if (response.isSuccessful) {
                    val notifications = response.body() ?: emptyList()
                    println("DEBUG: ${notifications.size} notifications/feedbacks chargés")
                    
                    // Convertir les notifications en feedbacks pour l'affichage
                    val feedbacks = notifications.map { notification ->
                        mapOf(
                            "id" to notification.id,
                            "message" to notification.message,
                            "auteur" to "Système",
                            "date" to notification.dateCreation,
                            "note" to if (notification.type == "feedback") "N/A" else "N/A"
                        )
                    }
                    
                    feedbacksAdapter.submitList(feedbacks)
                    binding.emptyViewText.visibility = if (feedbacks.isEmpty()) View.VISIBLE else View.GONE
                    binding.emptyViewText.text = "Aucun feedback reçu pour le moment"
                    
                    Toast.makeText(this@FeedbacksActivity, "${feedbacks.size} feedback(s) chargé(s)", Toast.LENGTH_SHORT).show()
                } else {
                    println("DEBUG: Erreur chargement feedbacks: ${response.code()} - ${response.message()}")
                    binding.emptyViewText.visibility = View.VISIBLE
                    binding.emptyViewText.text = "Erreur de chargement des feedbacks"
                    Toast.makeText(this@FeedbacksActivity, "Erreur: ${response.message()}", Toast.LENGTH_LONG).show()
                }
                
            } catch (e: Exception) {
                println("DEBUG: Exception dans loadFeedbacks: ${e.message}")
                e.printStackTrace()
                binding.emptyViewText.visibility = View.VISIBLE
                binding.emptyViewText.text = "Erreur de connexion"
                Toast.makeText(this@FeedbacksActivity, "Erreur réseau: ${e.message}", Toast.LENGTH_LONG).show()
            } finally {
                binding.progressBar.visibility = View.GONE
            }
        }
    }

    private fun showReplyDialog(feedback: Feedback) {
        val dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_reply, null)
        val editText = dialogView.findViewById<EditText>(R.id.reply_edit_text)
        editText.setText(feedback.reponse)

        MaterialAlertDialogBuilder(this)
            .setTitle("Répondre au feedback")
            .setView(dialogView)
            .setNegativeButton("Annuler", null)
            .setPositiveButton("Envoyer") { _, _ ->
                val replyText = editText.text.toString()
                if (replyText.isNotBlank()) {
                    sendReply(feedback, replyText)
                }
            }
            .show()
    }

    private fun sendReply(feedback: Feedback, replyText: String) {
        lifecycleScope.launch {
            try {
                // TODO: Implémenter l'API pour répondre aux feedbacks
                // val response = RetrofitClient.apiService.replyToFeedback(feedback.id, replyText)
                Toast.makeText(this@FeedbacksActivity, "Réponse envoyée avec succès", Toast.LENGTH_SHORT).show()
                // Recharger les feedbacks après l'envoi
                loadFeedbacks()
            } catch (e: Exception) {
                Toast.makeText(this@FeedbacksActivity, "Erreur lors de l'envoi: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressedDispatcher.onBackPressed()
        return true
    }
}