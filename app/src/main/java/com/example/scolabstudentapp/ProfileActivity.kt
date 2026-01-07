package com.example.scolabstudentapp

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.provider.MediaStore
import android.view.View
import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.bumptech.glide.Glide
import com.example.scolabstudentapp.databinding.ActivityProfileBinding
import com.example.scolabstudentapp.models.User
import com.example.scolabstudentapp.viewmodels.ProfileResultState
import com.example.scolabstudentapp.viewmodels.ProfileViewModel
import androidx.core.widget.doAfterTextChanged
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody
import java.io.File

import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class ProfileActivity : AppCompatActivity() {

    private lateinit var binding: ActivityProfileBinding
    private val viewModel: ProfileViewModel by viewModels()
    private var selectedPhotoUri: Uri? = null
    private val PICK_IMAGE_REQUEST = 1001

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        supportActionBar?.title = getString(R.string.profile_title)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        setupObservers()
        viewModel.loadUserProfile()

        // Validation en temps réel
        binding.nameEditText.doAfterTextChanged { validateFields() }
        binding.surnameEditText.doAfterTextChanged { validateFields() }
        binding.phoneEditText.doAfterTextChanged { validateFields() }
        binding.facultyEditText.doAfterTextChanged { validateFields() }
        binding.departmentEditText.doAfterTextChanged { validateFields() }
        binding.levelEditText.doAfterTextChanged { validateFields() }
        binding.fieldEditText.doAfterTextChanged { validateFields() }

        binding.saveButton.setOnClickListener {
            if (validateFields()) {
                saveProfile()
            }
        }

        binding.changePhotoButton.setOnClickListener {
            val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
            startActivityForResult(intent, PICK_IMAGE_REQUEST)
        }
    }

    private fun validateFields(): Boolean {
        val nom = binding.nameEditText.text.toString().trim()
        val prenom = binding.surnameEditText.text.toString().trim()
        val numTel = binding.phoneEditText.text.toString().trim()
        val fac = binding.facultyEditText.text.toString().trim()
        val dep = binding.departmentEditText.text.toString().trim()
        val niveau = binding.levelEditText.text.toString().trim()
        val filiere = binding.fieldEditText.text.toString().trim()
        var valid = true
        val errorMsg = getString(R.string.register_error_empty_fields)
        binding.nameLayout.error = if (nom.isEmpty()) errorMsg else null
        binding.surnameLayout.error = if (prenom.isEmpty()) errorMsg else null
        binding.phoneLayout.error = if (numTel.isEmpty()) errorMsg else null
        binding.facultyLayout.error = if (fac.isEmpty()) errorMsg else null
        binding.departmentLayout.error = if (dep.isEmpty()) errorMsg else null
        binding.levelLayout.error = if (niveau.isEmpty()) errorMsg else null
        binding.fieldLayout.error = if (filiere.isEmpty()) errorMsg else null
        valid = nom.isNotEmpty() && prenom.isNotEmpty() && numTel.isNotEmpty() && fac.isNotEmpty() && dep.isNotEmpty() && niveau.isNotEmpty() && filiere.isNotEmpty()
        binding.saveButton.isEnabled = valid
        return valid
    }

    private fun saveProfile() {
        val nom = binding.nameEditText.text.toString().trim()
        val prenom = binding.surnameEditText.text.toString().trim()
        val numTel = binding.phoneEditText.text.toString().trim()
        val fac = binding.facultyEditText.text.toString().trim()
        val dep = binding.departmentEditText.text.toString().trim()
        val niveau = binding.levelEditText.text.toString().trim()
        val filiere = binding.fieldEditText.text.toString().trim()
        viewModel.saveProfile(nom, prenom, numTel, fac, dep, niveau, filiere)
        if (selectedPhotoUri != null) {
            uploadPhoto(selectedPhotoUri!!)
        }
    }

    private fun uploadPhoto(uri: Uri) {
        // Fonctionnalité à implémenter dans le ViewModel/répository si besoin
        // viewModel.uploadProfilePhoto(body) // À implémenter dans ProfileViewModel
    }

    private fun getRealPathFromURI(contentUri: Uri): String {
        var result: String? = null
        val cursor = contentResolver.query(contentUri, null, null, null, null)
        if (cursor != null) {
            if (cursor.moveToFirst()) {
                val idx = cursor.getColumnIndex(MediaStore.Images.ImageColumns.DATA)
                if (idx >= 0) result = cursor.getString(idx)
            }
            cursor.close()
        }
        return result ?: contentUri.path!!
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == PICK_IMAGE_REQUEST && resultCode == Activity.RESULT_OK && data != null && data.data != null) {
            selectedPhotoUri = data.data
            binding.profileImageView.setImageURI(selectedPhotoUri)
        }
    }

    private fun setupObservers() {
        viewModel.profileResult.observe(this) { result ->
            val isLoading = result is ProfileResultState.Loading
            binding.profileProgressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
            if (result is ProfileResultState.Success) {
                bindUserDataToFields(result.user)
                binding.profileErrorText.visibility = View.GONE
            } else if (result is ProfileResultState.Error) {
                binding.profileErrorText.text = result.message
                binding.profileErrorText.visibility = View.VISIBLE
            }
        }
    }

    private fun bindUserDataToFields(user: User) {
        binding.nameEditText.setText(user.nom)
        binding.surnameEditText.setText(user.prenom)
        binding.emailEditText.setText(user.email)
        binding.phoneEditText.setText(user.numTel ?: "")
        binding.facultyEditText.setText(user.nomFac ?: "")
        binding.departmentEditText.setText(user.nomDep?.joinToString(", ") ?: "")
        // Les champs niveau et filiere n'existent pas dans User, donc on laisse vide
        binding.levelEditText.setText("")
        binding.fieldEditText.setText("")
        Glide.with(this)
            .load(user.urlPhotoProfil)
            .placeholder(R.drawable.ic_profile_placeholder)
            .error(R.drawable.ic_profile_placeholder)
            .circleCrop()
            .into(binding.profileImageView)
    }
}
