package com.example.scolabstudentapp

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.scolabstudentapp.api.RetrofitClient
import com.example.scolabstudentapp.auth.AuthManager
import com.example.scolabstudentapp.test.TestScript
import com.example.scolabstudentapp.databinding.ActivityLoginBinding
import com.example.scolabstudentapp.models.ReqRes
import com.example.scolabstudentapp.models.AuthResponse
import com.example.scolabstudentapp.models.User
import com.example.scolabstudentapp.viewmodels.LoginResult
import com.example.scolabstudentapp.viewmodels.LoginViewModel
import com.example.scolabstudentapp.StudentDashboardActivity
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject
import kotlinx.coroutines.launch

@AndroidEntryPoint
class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private lateinit var googleSignInClient: GoogleSignInClient
    
    // Utilisation de Hilt pour injecter le ViewModel
    private val viewModel: LoginViewModel by viewModels()
    
    @Inject
    lateinit var authManager: AuthManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Vérification de session persistante
        if (authManager.isLoggedIn()) {
            // S'assurer que RetrofitClient utilise le bon AuthManager dès le démarrage
            RetrofitClient.setAuthManager(authManager)
            startActivity(Intent(this, StudentDashboardActivity::class.java))
            finish()
            return
        }
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
                // Utiliser le nouveau backend pour la connexion
                loginWithBackend(email, password)
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
        
        // Bouton de test automatique (optionnel - pour développement)
        binding.loginButton.setOnLongClickListener {
            // Test automatique avec islem@gmail.com
            binding.emailEditText.setText("islem@gmail.com")
            binding.passwordEditText.setText("azertyA1*")
            
            // Lancer le test complet
            lifecycleScope.launch {
                TestScript.runCompleteTest()
            }
            
            Toast.makeText(this, "Test automatique lancé", Toast.LENGTH_SHORT).show()
            true
        }
    }

    private fun loginWithBackend(email: String, password: String) {
        println("DEBUG: Début de connexion avec le backend")
        println("DEBUG: Email: $email")
        
        lifecycleScope.launch {
            try {
                binding.loginButton.isEnabled = false
                binding.progressBar.visibility = View.VISIBLE
                
                val loginRequest = com.example.scolabstudentapp.models.ReqRes(
                    email = email,
                    password = password
                )
                
                println("DEBUG: Envoi de la requête de connexion...")
                val response = RetrofitClient.login(loginRequest)
                
                println("DEBUG: Réponse reçue - Code: ${response.code()}, Successful: ${response.isSuccessful()}")
                
                if (response.isSuccessful) {
                    val loginResponse = response.body()
                    println("DEBUG: Corps de la réponse: $loginResponse")
                    
                    if (loginResponse?.status == "success") {
                        println("DEBUG: Connexion réussie, sauvegarde du token...")
                        
                        // S'assurer que RetrofitClient utilise le bon AuthManager
                        RetrofitClient.setAuthManager(authManager)
                        // Sauvegarder le token dans AuthManager
                        authManager.saveToken(loginResponse.token ?: "")
                        println("DEBUG: Token dans AuthManager après save: ${authManager.getToken()}")
                        // (optionnel) Sauvegarder aussi dans RetrofitClient pour compatibilité
                        RetrofitClient.saveToken(loginResponse.token)

                        // Sauvegarder les informations utilisateur
                        loginResponse.user?.let { user ->
                            println("DEBUG: Sauvegarde de l'utilisateur: ${user.email}")
                            authManager.saveCurrentUser(user)
                        } ?: println("DEBUG: Aucun utilisateur dans la réponse")
                        
                        // Naviguer vers le dashboard
                        println("DEBUG: Navigation vers le dashboard...")
                        startActivity(Intent(this@LoginActivity, StudentDashboardActivity::class.java))
                        finish()
                    } else {
                        println("DEBUG: Échec de connexion - Status: ${loginResponse?.status}, Message: ${loginResponse?.message}")
                        binding.loginErrorTextView.text = loginResponse?.message ?: "Erreur de connexion"
                        binding.loginErrorTextView.visibility = View.VISIBLE
                    }
                } else {
                    println("DEBUG: Erreur HTTP - Code: ${response.code()}, Message: ${response.message()}")
                    binding.loginErrorTextView.text = "Erreur de connexion: ${response.code()} - ${response.message()}"
                    binding.loginErrorTextView.visibility = View.VISIBLE
                }
            } catch (e: Exception) {
                println("DEBUG: Exception lors de la connexion: ${e.message}")
                e.printStackTrace()
                binding.loginErrorTextView.text = "Erreur réseau: ${e.message}"
                binding.loginErrorTextView.visibility = View.VISIBLE
            } finally {
                binding.loginButton.isEnabled = true
                binding.progressBar.visibility = View.GONE
                println("DEBUG: Fin de la tentative de connexion")
            }
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
