package com.example.scolabstudentapp

import android.os.Bundle
import android.view.LayoutInflater
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.scolabstudentapp.adapters.FeedbacksAdapter
import com.example.scolabstudentapp.databinding.ActivityFeedbacksBinding
import com.example.scolabstudentapp.models.Feedback
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import kotlinx.coroutines.launch

class FeedbacksActivity : AppCompatActivity() {

    private lateinit var binding: ActivityFeedbacksBinding
    private lateinit var feedbacksAdapter: FeedbacksAdapter
    private var feedbacks: MutableList<Feedback> = mutableListOf()

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
        binding.feedbacksRecyclerView.adapter = feedbacksAdapter
    }

    private fun loadFeedbacks() {
        lifecycleScope.launch {
            try {
                val token = com.example.scolabstudentapp.api.RetrofitClient.getToken() ?: ""
                // TODO: Remplacer par la bonne méthode pour récupérer les feedbacks
                feedbacks = mutableListOf() // À remplacer par la vraie récupération
                feedbacksAdapter.updateFeedbacks(feedbacks)
            } catch (e: Exception) {
                Toast.makeText(this@FeedbacksActivity, "Erreur: ${e.message}", Toast.LENGTH_SHORT).show()
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
        Toast.makeText(this, "Fonctionnalité à implémenter côté API", Toast.LENGTH_SHORT).show()
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressedDispatcher.onBackPressed()
        return true
    }
}