package com.example.scolabstudentapp.adapters

import android.graphics.drawable.Drawable
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.scolabstudentapp.R
import com.example.scolabstudentapp.databinding.ItemLivrableBinding
import com.example.scolabstudentapp.models.Livrable
import java.text.SimpleDateFormat
import java.util.Locale

class LivrablesAdapter(private val onItemClicked: (Livrable) -> Unit) : ListAdapter<Livrable, LivrablesAdapter.LivrableViewHolder>(LivrableDiffCallback()) {

    inner class LivrableViewHolder(private val binding: ItemLivrableBinding) : RecyclerView.ViewHolder(binding.root) {
        private val dateFormat = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())

        fun bind(livrable: Livrable) {
            binding.livrableNameTextView.text = livrable.nom
            val deadline = try {
                val parsed = dateFormat.parse(livrable.dateEcheance)
                if (parsed != null) dateFormat.format(parsed) else livrable.dateEcheance
            } catch (_: Exception) { livrable.dateEcheance }
            binding.livrableDeadlineTextView.text = binding.root.context.getString(R.string.livrable_deadline, deadline)

            // Statut + couleur + icône
            val context = binding.root.context
            val (statutText, statutColor, statutIcon) = when (livrable.statut) {
                "A_SOUMETTRE" -> Triple(context.getString(R.string.livrable_status_a_soumettre), R.color.orange, R.drawable.ic_upload)
                "SOUMIS" -> Triple(context.getString(R.string.livrable_status_soumis), R.color.blue, R.drawable.ic_check_circle)
                "EN_CORRECTION" -> Triple(context.getString(R.string.livrable_status_en_correction), R.color.purple_700, R.drawable.ic_edit)
                "CORRIGE" -> Triple(context.getString(R.string.livrable_status_corrige), R.color.green, R.drawable.ic_done_all)
                "REJETE" -> Triple(context.getString(R.string.livrable_status_rejete), R.color.red, R.drawable.ic_error)
                else -> Triple(livrable.statut, R.color.gray, R.drawable.ic_help)
            }
            binding.livrableStatusTextView.text = binding.root.context.getString(R.string.livrable_status, statutText)
            binding.livrableStatusTextView.setTextColor(ContextCompat.getColor(context, statutColor))
            val icon: Drawable? = ContextCompat.getDrawable(context, statutIcon)
            icon?.setBounds(0, 0, 48, 48)
            binding.livrableStatusTextView.setCompoundDrawablesRelative(icon, null, null, null)
            binding.livrableStatusTextView.visibility = View.VISIBLE

            // Bouton Déposer
            if (livrable.statut == "A_SOUMETTRE" || livrable.statut == "REJETE") {
                binding.livrableSubmitButton.visibility = View.VISIBLE
                binding.livrableSubmitButton.setOnClickListener {
                    onItemClicked(livrable)
                }
            } else {
                binding.livrableSubmitButton.visibility = View.GONE
            }

            // Bouton Télécharger si fichier rendu
            if (livrable.fichier != null && (livrable.statut == "SOUMIS" || livrable.statut == "CORRIGE" || livrable.statut == "EN_CORRECTION")) {
                binding.livrableDownloadButton.visibility = View.VISIBLE
                binding.livrableDownloadButton.setOnClickListener {
                    val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(livrable.fichier.url))
                    context.startActivity(intent)
                }
                // Icône de fichier
                val fileIcon = ContextCompat.getDrawable(context, R.drawable.ic_file)
                fileIcon?.setBounds(0, 0, 48, 48)
                binding.livrableDownloadButton.setCompoundDrawablesRelative(fileIcon, null, null, null)
            } else {
                binding.livrableDownloadButton.visibility = View.GONE
            }

            // Note et commentaire si évalué (avec couleur)
            if (livrable.evaluation != null) {
                val note = livrable.evaluation.note
                val noteColor = when {
                    note >= 16 -> R.color.green
                    note >= 12 -> R.color.blue
                    note >= 10 -> R.color.orange
                    else -> R.color.red
                }
                binding.livrableNoteTextView.text = binding.root.context.getString(R.string.livrable_note, note)
                binding.livrableNoteTextView.setTextColor(ContextCompat.getColor(context, noteColor))
                binding.livrableNoteTextView.visibility = View.VISIBLE
                binding.livrableCommentTextView.text = binding.root.context.getString(R.string.livrable_comment, livrable.evaluation.commentaire ?: "-")
                binding.livrableCommentTextView.visibility = View.VISIBLE
            } else {
                binding.livrableNoteTextView.visibility = View.GONE
                binding.livrableCommentTextView.visibility = View.GONE
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): LivrableViewHolder {
        val binding = ItemLivrableBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return LivrableViewHolder(binding)
    }

    override fun onBindViewHolder(holder: LivrableViewHolder, position: Int) {
        val currentLivrable = getItem(position)
        holder.itemView.setOnClickListener {
            onItemClicked(currentLivrable)
        }
        holder.bind(currentLivrable)
    }

    class LivrableDiffCallback : DiffUtil.ItemCallback<Livrable>() {
        override fun areItemsTheSame(oldItem: Livrable, newItem: Livrable): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: Livrable, newItem: Livrable): Boolean {
            return oldItem == newItem
        }
    }
}
