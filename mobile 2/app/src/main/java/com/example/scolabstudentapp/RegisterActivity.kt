package com.example.scolabstudentapp

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.scolabstudentapp.databinding.ActivityRegisterBinding
import com.example.scolabstudentapp.viewmodels.RegisterResult
import com.example.scolabstudentapp.viewmodels.RegisterViewModel

class RegisterActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRegisterBinding

    // On instancie le ViewModel via Hilt
    private val registerViewModel: RegisterViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupObservers()

        binding.registerButton.setOnClickListener {
            val nom = binding.nameInput.text.toString().trim()
            val prenom = binding.firstnameInput.text.toString().trim()
            val email = binding.emailInput.text.toString().trim()
            val password = binding.passwordInput.text.toString().trim()
            val numTel = binding.phoneInput.text?.toString()?.trim()
            val nomFac = binding.facultyInput.text?.toString()?.trim()
            val nomDep = binding.departmentInput.text?.toString()?.trim()
            val niveau = binding.levelInput.text?.toString()?.trim()
            val filiere = binding.fieldInput.text?.toString()?.trim()

            // Validation avancée
            when {
                nom.isEmpty() -> {
                    binding.nameInput.error = "Champ obligatoire"
                    binding.nameInput.requestFocus()
                    return@setOnClickListener
                }
                prenom.isEmpty() -> {
                    binding.firstnameInput.error = "Champ obligatoire"
                    binding.firstnameInput.requestFocus()
                    return@setOnClickListener
                }
                email.isEmpty() -> {
                    binding.emailInput.error = "Champ obligatoire"
                    binding.emailInput.requestFocus()
                    return@setOnClickListener
                }
                !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches() -> {
                    binding.emailInput.error = "Email invalide"
                    binding.emailInput.requestFocus()
                    return@setOnClickListener
                }
                password.isEmpty() -> {
                    binding.passwordInput.error = "Champ obligatoire"
                    binding.passwordInput.requestFocus()
                    return@setOnClickListener
                }
                password.length < 8 -> {
                    binding.passwordInput.error = "Le mot de passe doit contenir au moins 8 caractères"
                    binding.passwordInput.requestFocus()
                    return@setOnClickListener
                }
                numTel.isNullOrEmpty() -> {
                    binding.phoneInput.error = "Champ obligatoire"
                    binding.phoneInput.requestFocus()
                    return@setOnClickListener
                }
                nomFac.isNullOrEmpty() -> {
                    binding.facultyInput.error = "Champ obligatoire"
                    binding.facultyInput.requestFocus()
                    return@setOnClickListener
                }
                nomDep.isNullOrEmpty() -> {
                    binding.departmentInput.error = "Champ obligatoire"
                    binding.departmentInput.requestFocus()
                    return@setOnClickListener
                }
                niveau.isNullOrEmpty() -> {
                    binding.levelInput.error = "Champ obligatoire"
                    binding.levelInput.requestFocus()
                    return@setOnClickListener
                }
                filiere.isNullOrEmpty() -> {
                    binding.fieldInput.error = "Champ obligatoire"
                    binding.fieldInput.requestFocus()
                    return@setOnClickListener
                }
            }

            registerViewModel.register(nom, prenom, email, password, numTel, nomFac, nomDep, niveau, filiere)
        }

        binding.loginLink.setOnClickListener {
            finish()
        }
    }

    private fun setupObservers() {
        registerViewModel.registerResult.observe(this) { result ->
            when (result) {
                is RegisterResult.Loading -> {
                    binding.registerButton.isEnabled = false
                }
                is RegisterResult.Success -> {
                    binding.registerButton.isEnabled = true
                    Toast.makeText(this, "Inscription réussie !", Toast.LENGTH_SHORT).show()
                    val intent = Intent(this, MainActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    startActivity(intent)
                }
                is RegisterResult.Error -> {
                    binding.registerButton.isEnabled = true
                    Toast.makeText(this, "Erreur: ${result.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }
}
