package com.example.scolabstudentapp

import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.scolabstudentapp.api.RetrofitClient
import com.example.scolabstudentapp.databinding.ActivityGithubAuthBinding
import com.example.scolabstudentapp.models.AuthRequest
import kotlinx.coroutines.launch

class GitHubAuthActivity : AppCompatActivity() {

    private lateinit var binding: ActivityGithubAuthBinding
    private val TAG = "GitHubAuthActivity"

    // Replace with your values
    private val CLIENT_ID = "your_github_client_id"
    private val REDIRECT_URI = "your_redirect_uri" // ex: "scolab://github/callback"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityGithubAuthBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupWebView()
    }

    private fun setupWebView() {
        binding.webView.settings.javaScriptEnabled = true
        binding.webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                if (url?.startsWith(REDIRECT_URI) == true) {
                    handleRedirect(url)
                }
            }
        }

        val authUrl = "https://github.com/login/oauth/authorize?client_id=$CLIENT_ID&redirect_uri=$REDIRECT_URI"
        binding.webView.loadUrl(authUrl)
    }

    private fun handleRedirect(url: String) {
        val uri = Uri.parse(url)
        val code = uri.getQueryParameter("code")
        if (code != null) {
            performGitHubLogin(code)
        } else {
            finishWithError("Erreur d'autorisation GitHub")
        }
    }

    private fun performGitHubLogin(code: String) {
        lifecycleScope.launch {
            try {
                // L'API ne supporte pas l'authentification sociale, on simule un login avec un email construit à partir du code
                val email = "github_$code@scolab.local"
                val request = AuthRequest(email = email)
                val response = RetrofitClient.apiService.login(request)
                if (response.isSuccessful) {
                    val authResponse = response.body()
                    RetrofitClient.saveToken(authResponse?.token)
                    navigateToDashboard()
                } else {
                    finishWithError("Échec backend GitHub")
                }
            } catch (e: Exception) {
                finishWithError("Erreur: ${e.message}")
            }
        }
    }

    private fun navigateToDashboard() {
        val intent = Intent(this, StudentDashboardActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_NEW_TASK
        startActivity(intent)
        finish()
    }

    private fun finishWithError(message: String) {
        Log.e(TAG, message)
        val intent = Intent(this, LoginActivity::class.java).apply {
            putExtra("error", message)
        }
        startActivity(intent)
        finish()
    }

    override fun onBackPressed() {
        if (binding.webView.canGoBack()) {
            binding.webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}