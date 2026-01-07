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
        feedbacksAdapter = FeedbacksAdapter(emptyList())
        feedbacksAdapter.setOnReplyClickListener { feedback ->
            showReplyDialog(feedback)
        }
        binding.feedbacksRecyclerView.apply {
            adapter = feedbacksAdapter
            layoutManager = LinearLayoutManager(this@FeedbacksActivity)
        }
    }

    private fun loadFeedbacks() {
        binding.progressBar.visibility = View.VISIBLE
        binding.emptyViewText.visibility = View.GONE
        
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.getMyFeedbacks()
                if (response.isSuccessful) {
                    feedbacks = response.body()?.toMutableList() ?: mutableListOf()
                    feedbacksAdapter.updateFeedbacks(feedbacks)
                    
                    // Gérer l'état vide
                    binding.emptyViewText.visibility = if (feedbacks.isEmpty()) View.VISIBLE else View.GONE
                    binding.emptyViewText.text = getString(R.string.empty_feedbacks_message)
                } else {
                    Toast.makeText(this@FeedbacksActivity, "Erreur de chargement: ${response.code()}", Toast.LENGTH_SHORT).show()
                    binding.emptyViewText.visibility = View.VISIBLE
                    binding.emptyViewText.text = getString(R.string.error_loading_data)
                }
            } catch (e: Exception) {
                Toast.makeText(this@FeedbacksActivity, "Erreur: ${e.message}", Toast.LENGTH_SHORT).show()
                binding.emptyViewText.visibility = View.VISIBLE
                binding.emptyViewText.text = getString(R.string.error_network_connection, e.message)
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