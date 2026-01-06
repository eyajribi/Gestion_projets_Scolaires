package com.example.scolabstudentapp

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.scolabstudentapp.databinding.ActivityLoginBinding
import com.example.scolabstudentapp.viewmodels.LoginResult
import com.example.scolabstudentapp.viewmodels.LoginViewModel
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    
    // Utilisation de Hilt pour injecter le ViewModel
    private val viewModel: LoginViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.loginButton.setOnClickListener {
            val email = binding.emailEditText.text.toString().trim()
            val password = binding.passwordEditText.text.toString()
            binding.loginErrorTextView.visibility = View.GONE
            if (email.isEmpty() || password.isEmpty()) {
                binding.loginErrorTextView.text = "Veuillez remplir tous les champs obligatoires."
                binding.loginErrorTextView.visibility = View.VISIBLE
            } else if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                binding.loginErrorTextView.text = "Format d'email invalide."
                binding.loginErrorTextView.visibility = View.VISIBLE
            } else {
                viewModel.login(email, password)
            }
        }

        observeViewModel()
    }

    private fun observeViewModel() {
        viewModel.loginResult.observe(this) { result ->
            when (result) {
                is LoginResult.Loading -> {
                    binding.progressBar.visibility = View.VISIBLE
                    binding.loginButton.isEnabled = false
                }
                is LoginResult.Success -> {
                    binding.progressBar.visibility = View.GONE
                    binding.loginButton.isEnabled = true
                    startActivity(Intent(this, MainActivity::class.java))
                    finish()
                }
                is LoginResult.Error -> {
                    binding.progressBar.visibility = View.GONE
                    binding.loginButton.isEnabled = true
                    binding.loginErrorTextView.text = result.message
                    binding.loginErrorTextView.visibility = View.VISIBLE
                }
            }
        }
    }
}
