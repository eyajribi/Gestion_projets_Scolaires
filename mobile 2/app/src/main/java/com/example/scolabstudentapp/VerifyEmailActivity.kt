package com.example.scolabstudentapp

import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import com.example.scolabstudentapp.databinding.ActivityVerifyEmailBinding
import androidx.lifecycle.ViewModelProvider
import android.widget.Toast

class VerifyEmailActivity : AppCompatActivity() {
    private lateinit var binding: ActivityVerifyEmailBinding
    private val viewModel: com.example.scolabstudentapp.viewmodels.VerifyEmailViewModel by lazy {
        ViewModelProvider(this)[com.example.scolabstudentapp.viewmodels.VerifyEmailViewModel::class.java]
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityVerifyEmailBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.verifyButton.setOnClickListener {
            val token = binding.tokenEditText.text.toString().trim()
            binding.verifyErrorTextView.visibility = View.GONE
            if (token.isEmpty()) {
                binding.verifyErrorTextView.text = "Veuillez saisir le code de vérification."
                binding.verifyErrorTextView.visibility = View.VISIBLE
            } else {
                viewModel.verifyEmail(token)
            }
        }

        viewModel.verifyResult.observe(this) { result ->
            when (result) {
                is VerifyEmailViewModel.VerifyResult.Loading -> {
                    binding.progressBar.visibility = View.VISIBLE
                    binding.verifyButton.isEnabled = false
                }
                is VerifyEmailViewModel.VerifyResult.Success -> {
                    binding.progressBar.visibility = View.GONE
                    binding.verifyButton.isEnabled = true
                    Toast.makeText(this, "Email vérifié avec succès !", Toast.LENGTH_LONG).show()
                    finish()
                }
                is VerifyEmailViewModel.VerifyResult.Error -> {
                    binding.progressBar.visibility = View.GONE
                    binding.verifyButton.isEnabled = true
                    binding.verifyErrorTextView.text = result.message
                    binding.verifyErrorTextView.visibility = View.VISIBLE
                }
            }
        }
    }
}
