package com.example.scolabstudentapp

import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.scolabstudentapp.databinding.ActivityDeliverablesBinding
import com.example.scolabstudentapp.viewmodels.DeliverablesViewModel
import com.example.scolabstudentapp.viewmodels.SubmissionResult



class DeliverablesActivity : AppCompatActivity() {

    private lateinit var binding: ActivityDeliverablesBinding
    private val viewModel: DeliverablesViewModel by viewModels()

    private var selectedFileUri: Uri? = null
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

        // Récupérer les données de l'intent
        livrableId = intent.getStringExtra(EXTRA_LIVRABLE_ID)
        val taskTitle = intent.getStringExtra(EXTRA_TASK_TITLE)
        val projectName = intent.getStringExtra(EXTRA_PROJECT_NAME)

        if (livrableId == null || taskTitle == null || projectName == null) {
            Toast.makeText(this, "Informations manquantes", Toast.LENGTH_LONG).show()
            finish()
            return
        }

        // Afficher les infos
        binding.taskTitleDeliverableText.text = taskTitle
        binding.projectNameDeliverableText.text = projectName

        // Gérer les clics
        binding.selectFileButton.setOnClickListener {
            filePickerLauncher.launch("*/*")
        }

        binding.uploadButton.setOnClickListener {
            selectedFileUri?.let { uri ->
                livrableId?.let { id ->
                    viewModel.submitLivrable(id, uri)
                }
            }
        }

        // Toolbar
        binding.toolbar.setNavigationOnClickListener { onBackPressedDispatcher.onBackPressed() }

        setupObservers()
    }

    private fun setupObservers() {
        viewModel.submissionResult.observe(this) { result ->
            setLoading(false)
            when (result) {
                is SubmissionResult.Loading -> setLoading(true)
                is SubmissionResult.Success -> {
                    Toast.makeText(this, "Fichier envoyé avec succès !", Toast.LENGTH_SHORT).show()
                    setResult(RESULT_OK)
                    finish()
                }
                is SubmissionResult.Error -> {
                    Toast.makeText(this, "Erreur: ${result.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private fun setLoading(isLoading: Boolean) {
        binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        binding.uploadButton.isEnabled = !isLoading
        binding.selectFileButton.isEnabled = !isLoading
    }

    private fun getFileName(uri: Uri): String {
        var fileName: String? = null
        val cursor = contentResolver.query(uri, null, null, null, null)
        cursor?.use {
            if (it.moveToFirst()) {
                val nameIndex = it.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
                if (nameIndex != -1) {
                    fileName = it.getString(nameIndex)
                }
            }
        }
        return fileName ?: "Fichier sélectionné"
    }

    companion object {
        const val EXTRA_LIVRABLE_ID = "extra_livrable_id"
        const val EXTRA_TASK_TITLE = "extra_task_title"
        const val EXTRA_PROJECT_NAME = "extra_project_name"
    }
}
