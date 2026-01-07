package com.example.scolabstudentapp

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.scolabstudentapp.databinding.ActivityLoginBinding
import com.example.scolabstudentapp.viewmodels.LoginResult
import com.example.scolabstudentapp.viewmodels.LoginViewModel
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private lateinit var googleSignInClient: GoogleSignInClient
    
    // Utilisation de Hilt pour injecter le ViewModel
    private val viewModel: LoginViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupGoogleSignIn()
        setupClickListeners()
        observeViewModel()
    }

    private fun setupGoogleSignIn() {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestEmail()
            .requestIdToken("YOUR_WEB_CLIENT_ID") // Remplacez avec votre client ID
            .build()
        
        googleSignInClient = GoogleSignIn.getClient(this, gso)
    }

    private fun setupClickListeners() {
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

        binding.googleLoginButton.setOnClickListener {
            signInWithGoogle()
        }

        binding.githubLoginButton.setOnClickListener {
            startActivity(Intent(this, GitHubAuthActivity::class.java))
        }

        binding.forgotPasswordTextView.setOnClickListener {
            startActivity(Intent(this, ForgotPasswordActivity::class.java))
        }

        binding.registerTextView.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }

    private fun signInWithGoogle() {
        val signInIntent = googleSignInClient.signInIntent
        googleSignInLauncher.launch(signInIntent)
    }

    private val googleSignInLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
            try {
                val account = task.getResult(ApiException::class.java)
                handleGoogleSignInResult(account)
            } catch (e: ApiException) {
                binding.loginErrorTextView.text = "Erreur d'authentification Google: ${e.statusCode}"
                binding.loginErrorTextView.visibility = View.VISIBLE
            }
        }
    }

    private fun handleGoogleSignInResult(account: GoogleSignInAccount?) {
        account?.let {
            // MODE DÉMO - Simule une connexion Google réussie
            val mockResponse = com.example.scolabstudentapp.models.AuthResponse(
                token = "google_demo_token_${System.currentTimeMillis()}",
                user = com.example.scolabstudentapp.models.User(
                    id = "google_demo_user",
                    email = it.email ?: "",
                    nom = it.familyName ?: "Google",
                    prenom = it.givenName ?: "User",
                    role = "ETUDIANT"
                )
            )
            
            // Sauvegarder dans AuthManager
            val authManager = com.example.scolabstudentapp.auth.AuthManager(this)
            authManager.saveToken(mockResponse.token ?: "")
            authManager.saveCurrentUser(mockResponse.user ?: return@let)
            
            startActivity(Intent(this, StudentDashboardActivity::class.java))
            finish()
        }
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
                    startActivity(Intent(this, StudentDashboardActivity::class.java))
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
