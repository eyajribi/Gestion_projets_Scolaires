package com.example.scolabstudentapp

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.scolabstudentapp.api.RetrofitClient
import com.example.scolabstudentapp.databinding.ActivityDeliverablesBinding
import com.example.scolabstudentapp.models.Livrable
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File

class LivrablesActivity : AppCompatActivity() {

    private lateinit var binding: ActivityDeliverablesBinding
    private var livrables: List<Livrable> = emptyList()

    private val pickFileLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == RESULT_OK) {
            result.data?.data?.let { uri ->
                // À adapter selon la logique réelle
                uploadFile(uri, "livrableIdExemple")
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDeliverablesBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        // TODO: Charger les livrables si besoin
        // fetchLivrables()

        binding.selectFileButton.setOnClickListener {
            pickFile()
        }
        binding.uploadButton.setOnClickListener {
            // TODO: Appeler uploadFile avec le bon uri et id
        }
    }

    private fun pickFile() {
        val intent = Intent(Intent.ACTION_GET_CONTENT).apply { type = "*/*" }
        pickFileLauncher.launch(intent)
    }

    private fun uploadFile(uri: Uri, livrableId: String) {
        binding.progressBar.visibility = android.view.View.VISIBLE
        val file = File(contentResolver.openInputStream(uri)?.let { inputStream ->
            val tempFile = File.createTempFile("upload", null, cacheDir)
            tempFile.outputStream().use { outputStream ->
                inputStream.copyTo(outputStream)
            }
            tempFile
        }?.absolutePath ?: return)

        val requestFile = file.asRequestBody("multipart/form-data".toMediaTypeOrNull())
        val body = MultipartBody.Part.createFormData("fichier", file.name, requestFile)

        lifecycleScope.launch {
            try {
                val token = RetrofitClient.getToken() ?: ""
                val response = RetrofitClient.apiService.soumettreLivrable(token, livrableId, body)
                if (response.isSuccessful) {
                    Toast.makeText(this@LivrablesActivity, "Upload réussi", Toast.LENGTH_SHORT).show()
                    // TODO: rafraîchir la liste si besoin
                } else {
                    Toast.makeText(this@LivrablesActivity, "Échec upload", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@LivrablesActivity, "Erreur: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                binding.progressBar.visibility = android.view.View.GONE
            }
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressedDispatcher.onBackPressed()
        return true
    }
}
