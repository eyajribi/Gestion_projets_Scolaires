package com.example.scolabstudentapp.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.scolabstudentapp.databinding.ItemLivrableBinding
import com.example.scolabstudentapp.models.Livrable
import java.text.SimpleDateFormat
import java.util.Locale

class LivrablesAdapter(private val onItemClicked: (Livrable) -> Unit) : ListAdapter<Livrable, LivrablesAdapter.LivrableViewHolder>(LivrableDiffCallback()) {

    inner class LivrableViewHolder(private val binding: ItemLivrableBinding) : RecyclerView.ViewHolder(binding.root) {
        private val dateFormat = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())

        fun bind(livrable: Livrable) {
            binding.livrableNameTextView.text = livrable.nom
            binding.livrableDeadlineTextView.text = dateFormat.format(livrable.dateEcheance)
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
