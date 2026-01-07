package com.example.scolabstudentapp

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.OpenableColumns
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.scolabstudentapp.R
import com.example.scolabstudentapp.api.RetrofitClient
import com.example.scolabstudentapp.databinding.ActivityDeliverablesBinding
import com.example.scolabstudentapp.viewmodels.DeliverablesViewModel
import com.example.scolabstudentapp.viewmodels.SubmissionResult
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.RequestBody

@AndroidEntryPoint
class DeliverablesActivity : AppCompatActivity() {

    private lateinit var binding: ActivityDeliverablesBinding
    private val viewModel: DeliverablesViewModel by viewModels()

    private var selectedFileUri: Uri? = null
    private var taskId: String? = null
    private var livrableId: String? = null

    private val filePickerLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        uri?.let {
            selectedFileUri = it
            binding.selectedFileNameText.text = getFileName(it)
            binding.selectedFileNameText.visibility = View.VISIBLE
            binding.uploadButton.isEnabled = true
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDeliverablesBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Données de test pour vérifier l'affichage
        println("DEBUG: Initialisation de DeliverablesActivity avec données de test")
        binding.taskTitleDeliverableText.text = "Tâche Test - Dépôt de livrable"
        binding.projectNameDeliverableText.text = "Projet Test 2024"
        
        // Récupérer les données de l'intent
        taskId = intent.getStringExtra("EXTRA_TASK_ID")
        livrableId = intent.getStringExtra("EXTRA_LIVRABLE_ID") ?: taskId // Utiliser taskId comme fallback
        
        val taskTitle = intent.getStringExtra("EXTRA_TASK_TITLE")
        val projectName = intent.getStringExtra("EXTRA_PROJECT_NAME") ?: "Projet"
            
        // Afficher les infos
        binding.taskTitleDeliverableText.text = taskTitle ?: "Tâche"
        binding.projectNameDeliverableText.text = projectName ?: "Projet"
        
        if (livrableId == null) {
            Toast.makeText(this, "Informations manquantes", Toast.LENGTH_LONG).show()
            finish()
            return
        }

        // Gérer les clics
        binding.selectFileButton.setOnClickListener {
            filePickerLauncher.launch("*/*")
        }

        binding.uploadButton.setOnClickListener {
            selectedFileUri?.let { uri ->
                livrableId?.let { id ->
                    submitLivrable(id, uri)
                }
            } ?: run {
                Toast.makeText(this, "Veuillez sélectionner un fichier", Toast.LENGTH_SHORT).show()
            }
        }

        // Toolbar
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { onBackPressedDispatcher.onBackPressed() }

        setupObservers()
    }

    private fun submitLivrable(livrableId: String, fileUri: android.net.Uri) {
        println("DEBUG: Début de la soumission du livrable $livrableId")
        
        lifecycleScope.launch {
            try {
                binding.uploadButton.isEnabled = false
                binding.progressBar.visibility = View.VISIBLE
                
                // Convertir l'URI en MultipartBody.Part
                val filePart = createMultipartBody(fileUri)
                
                if (filePart == null) {
                    Toast.makeText(this@DeliverablesActivity, "Erreur de traitement du fichier", Toast.LENGTH_SHORT).show()
                    return@launch
                }
                
                // Appeler l'API backend
                val response = RetrofitClient.soumettreEtudiantLivrable(livrableId, filePart)
                
                println("DEBUG: Réponse soumission livrable - Code: ${response.code()}, Successful: ${response.isSuccessful()}")
                
                if (response.isSuccessful) {
                    val result = response.body()
                    println("DEBUG: Livrable soumis avec succès: $result")
                    
                    Toast.makeText(this@DeliverablesActivity, "Livrable soumis avec succès !", Toast.LENGTH_SHORT).show()
                    
                    // Rediriger vers la page des tâches
                    val intent = Intent(this@DeliverablesActivity, TasksActivity::class.java)
                    startActivity(intent)
                    finish()
                    
                } else {
                    println("DEBUG: Erreur soumission livrable: ${response.code()} - ${response.message()}")
                    val errorMessage = when (response.code()) {
                        401 -> "Non autorisé - Veuillez vous reconnecter"
                        403 -> "Accès refusé"
                        404 -> "Livrable non trouvé"
                        413 -> "Fichier trop volumineux"
                        500 -> "Erreur serveur - Veuillez réessayer plus tard"
                        else -> "Erreur de soumission: ${response.message()}"
                    }
                    
                    Toast.makeText(this@DeliverablesActivity, errorMessage, Toast.LENGTH_LONG).show()
                }
                
            } catch (e: java.net.SocketTimeoutException) {
                println("DEBUG: Timeout lors de la soumission: ${e.message}")
                Toast.makeText(this@DeliverablesActivity, "Timeout de connexion", Toast.LENGTH_LONG).show()
            } catch (e: java.net.ConnectException) {
                println("DEBUG: Impossible de se connecter au serveur: ${e.message}")
                Toast.makeText(this@DeliverablesActivity, "Serveur indisponible", Toast.LENGTH_LONG).show()
            } catch (e: Exception) {
                println("DEBUG: Exception lors de la soumission: ${e.message}")
                e.printStackTrace()
                Toast.makeText(this@DeliverablesActivity, "Erreur: ${e.message}", Toast.LENGTH_LONG).show()
            } finally {
                binding.uploadButton.isEnabled = true
                binding.progressBar.visibility = View.GONE
            }
        }
    }
    
    private fun createMultipartBody(fileUri: android.net.Uri): okhttp3.MultipartBody.Part? {
        return try {
            val inputStream = contentResolver.openInputStream(fileUri)
            val fileName = getFileName(fileUri)
            val mediaType = contentResolver.getType(fileUri)?.toMediaType() ?: "application/octet-stream".toMediaType()
            val requestBody = RequestBody.create(mediaType, inputStream?.readBytes() ?: ByteArray(0))
            okhttp3.MultipartBody.Part.createFormData("fichier", fileName, requestBody)
        } catch (e: Exception) {
            println("DEBUG: Erreur création MultipartBody: ${e.message}")
            e.printStackTrace()
            null
        }
    }
    
    private fun getFileName(uri: android.net.Uri): String {
        var name = "fichier"
        contentResolver.query(uri, null, null, null, null)?.use { cursor ->
            val nameIndex = cursor.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
            if (cursor.moveToFirst() && nameIndex >= 0) {
                name = cursor.getString(nameIndex) ?: "fichier"
            }
        }
        return name
    }

    private fun setupObservers() {
        viewModel.submissionResult.observe(this) { result ->
            setLoading(false)
            when (result) {
                is SubmissionResult.Loading -> setLoading(true)
                is SubmissionResult.Success -> {
                    Toast.makeText(this, getString(R.string.deliverable_submitted_success), Toast.LENGTH_SHORT).show()
                    setResult(RESULT_OK)
                    finish()
                }
                is SubmissionResult.Error -> {
                    Toast.makeText(this, result.message, Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private fun setLoading(isLoading: Boolean) {
        if (isLoading) {
            binding.progressBar.visibility = View.VISIBLE
            binding.uploadButton.isEnabled = false
        } else {
            binding.progressBar.visibility = View.GONE
            binding.uploadButton.isEnabled = true
        }
    }

    companion object {
        const val EXTRA_LIVRABLE_ID = "extra_livrable_id"
        const val EXTRA_TASK_TITLE = "extra_task_title"
        const val EXTRA_PROJECT_NAME = "extra_project_name"
    }
}
