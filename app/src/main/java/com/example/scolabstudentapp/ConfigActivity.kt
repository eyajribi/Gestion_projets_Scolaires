package com.example.scolabstudentapp

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.scolabstudentapp.api.RetrofitClient
import com.example.scolabstudentapp.databinding.ActivityConfigBinding
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class ConfigActivity : AppCompatActivity() {

    private lateinit var binding: ActivityConfigBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityConfigBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupClickListeners()
        displayCurrentConfig()
    }

    private fun setupClickListeners() {
        binding.btnEmulator.setOnClickListener {
            RetrofitClient.setBaseUrl("http://10.0.2.2:8080/")
            displayCurrentConfig()
            Toast.makeText(this, "URL changée pour l'émulateur", Toast.LENGTH_SHORT).show()
        }

        binding.btnLocalhost.setOnClickListener {
            RetrofitClient.setBaseUrl("http://localhost:8080/")
            displayCurrentConfig()
            Toast.makeText(this, "URL changée pour localhost", Toast.LENGTH_SHORT).show()
        }

        binding.btnNetworkLocal.setOnClickListener {
            RetrofitClient.setBaseUrl("http://192.168.1.100:8080/")
            displayCurrentConfig()
            Toast.makeText(this, "URL changée pour le réseau local", Toast.LENGTH_SHORT).show()
        }

        binding.btnCustomUrl.setOnClickListener {
            val customUrl = binding.editCustomUrl.text.toString().trim()
            if (customUrl.isNotEmpty()) {
                if (!customUrl.startsWith("http://") && !customUrl.startsWith("https://")) {
                    RetrofitClient.setBaseUrl("http://$customUrl")
                } else {
                    RetrofitClient.setBaseUrl(customUrl)
                }
                displayCurrentConfig()
                Toast.makeText(this, "URL changée pour: $customUrl", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(this, "Veuillez entrer une URL valide", Toast.LENGTH_SHORT).show()
            }
        }

        binding.btnTestConnection.setOnClickListener {
            testConnection()
        }

        binding.btnBackToLogin.setOnClickListener {
            finish()
        }
    }

    private fun displayCurrentConfig() {
        binding.currentUrlText.text = "URL actuelle: ${RetrofitClient.getCurrentBaseUrl()}"
        binding.editCustomUrl.setText(RetrofitClient.getCurrentBaseUrl())
    }

    private fun testConnection() {
        Toast.makeText(this, "Test de connexion en cours...", Toast.LENGTH_SHORT).show()
        
        // Vous pouvez ajouter un test de connexion simple ici
        // Par exemple, essayer de contacter le backend
        Thread {
            try {
                val url = java.net.URL("${RetrofitClient.getCurrentBaseUrl()}/auth/health")
                val connection = url.openConnection() as java.net.HttpURLConnection
                connection.requestMethod = "GET"
                connection.connectTimeout = 5000
                val responseCode = connection.responseCode
                
                runOnUiThread {
                    if (responseCode == 200) {
                        Toast.makeText(this@ConfigActivity, "Connexion réussie !", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(this@ConfigActivity, "Erreur de connexion: $responseCode", Toast.LENGTH_LONG).show()
                    }
                }
            } catch (e: Exception) {
                runOnUiThread {
                    Toast.makeText(this@ConfigActivity, "Erreur de connexion: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }
}
