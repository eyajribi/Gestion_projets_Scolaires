package com.example.scolabstudentapp

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.scolabstudentapp.databinding.ActivityForgotPasswordBinding
import com.example.scolabstudentapp.viewmodels.ForgotPasswordViewModel
import com.example.scolabstudentapp.viewmodels.ResetResult
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class ForgotPasswordActivity : AppCompatActivity() {

    private lateinit var binding: ActivityForgotPasswordBinding
    private val viewModel: ForgotPasswordViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityForgotPasswordBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupUI()
        setupClickListeners()
        setupObservers()
    }

    private fun setupUI() {
        binding.title.text = "Mot de passe oublié"
        binding.subtitle.text = "Entrez votre email pour recevoir un lien de réinitialisation"
        binding.emailLayout.hint = "Adresse email"
        binding.resetButton.text = "Réinitialiser le mot de passe"
        binding.backToLogin.text = "Retour à la connexion"
    }

    private fun setupClickListeners() {
        binding.resetButton.setOnClickListener {
            val email = binding.emailInput.text.toString().trim()
            if (validateInputs(email)) {
                viewModel.forgotPassword(email)
            }
        }

        binding.backToLogin.setOnClickListener {
            navigateToLogin()
        }
    }

    private fun setupObservers() {
        viewModel.resetResult.observe(this) { result ->
            showLoading(result is ResetResult.Loading)
            when (result) {
                is ResetResult.Success -> {
                    showSuccess(result.message)
                    lifecycleScope.launch {
                        kotlinx.coroutines.delay(2000)
                        navigateToLogin()
                    }
                }
                is ResetResult.Error -> showError(result.message)
                else -> {}
            }
        }
    }

    private fun validateInputs(email: String): Boolean {
        var isValid = true

        if (email.isEmpty()) {
            binding.emailLayout.error = "L'email est requis"
            isValid = false
        } else if (!isValidEmail(email)) {
            binding.emailLayout.error = "Format d'email invalide"
            isValid = false
        } else {
            binding.emailLayout.error = null
        }

        return isValid
    }

    private fun isValidEmail(email: String): Boolean {
        val emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\$"
        return email.matches(emailRegex.toRegex())
    }

    private fun showLoading(loading: Boolean) {
        binding.resetButton.isEnabled = !loading
        binding.resetButton.text = if (loading) "Envoi en cours..." else "Réinitialiser le mot de passe"
        binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
    }

    private fun showSuccess(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
        binding.successMessage.text = message
        binding.successMessage.visibility = View.VISIBLE
        binding.emailLayout.visibility = View.GONE
        binding.resetButton.visibility = View.GONE
    }

    private fun showError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
        binding.emailLayout.error = message
    }

    private fun navigateToLogin() {
        val intent = Intent(this, LoginActivity::class.java)
        startActivity(intent)
        finish()
    }

    @Deprecated("Utilisez OnBackPressedDispatcher à la place de onBackPressed.")
    override fun onBackPressed() {
        super.onBackPressed()
        navigateToLogin()
    }
}
