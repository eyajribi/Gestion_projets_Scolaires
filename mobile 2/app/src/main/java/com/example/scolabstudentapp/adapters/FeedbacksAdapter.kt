package com.example.scolabstudentapp.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.scolabstudentapp.databinding.ItemFeedbackBinding
import com.example.scolabstudentapp.models.Feedback

class FeedbacksAdapter(private var feedbacks: List<Feedback>) : RecyclerView.Adapter<FeedbacksAdapter.FeedbackViewHolder>() {

    private var onReplyClickListener: ((Feedback) -> Unit)? = null

    fun setOnReplyClickListener(listener: (Feedback) -> Unit) {
        onReplyClickListener = listener
    }

    fun updateFeedbacks(newFeedbacks: List<Feedback>) {
        feedbacks = newFeedbacks
        notifyDataSetChanged()
    }

    inner class FeedbackViewHolder(private val binding: ItemFeedbackBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(feedback: Feedback) {
            binding.feedbackCommentTextView.text = feedback.commentaire
            binding.feedbackRatingBar.rating = feedback.note
            binding.feedbackRatingTextView.text = feedback.note.toString()

            if (feedback.reponse != null) {
                // Si une réponse existe, on l'affiche
                binding.replySectionGroup.visibility = View.VISIBLE
                binding.replyTextView.text = feedback.reponse
                binding.replyButton.text = "Répondre"
            } else {
                // Sinon, on masque la section de réponse
                binding.replySectionGroup.visibility = View.GONE
                binding.replyButton.text = "Répondre"
            }

            binding.replyButton.setOnClickListener {
                onReplyClickListener?.invoke(feedback)
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FeedbackViewHolder {
        val binding = ItemFeedbackBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return FeedbackViewHolder(binding)
    }

    override fun onBindViewHolder(holder: FeedbackViewHolder, position: Int) {
        holder.bind(feedbacks[position])
    }

    override fun getItemCount(): Int = feedbacks.size
}