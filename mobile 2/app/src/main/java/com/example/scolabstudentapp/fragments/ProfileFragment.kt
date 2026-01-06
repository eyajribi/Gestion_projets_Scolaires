package com.example.scolabstudentapp.fragments

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import com.bumptech.glide.Glide
import com.example.scolabstudentapp.LoginActivity
import com.example.scolabstudentapp.ProfileActivity
import com.example.scolabstudentapp.R
import com.example.scolabstudentapp.auth.AuthManager
import com.example.scolabstudentapp.databinding.FragmentProfileBinding
import com.example.scolabstudentapp.models.User
import com.example.scolabstudentapp.viewmodels.ProfileResult
import com.example.scolabstudentapp.viewmodels.ProfileViewModel
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class ProfileFragment : Fragment() {

    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!

    private val viewModel: ProfileViewModel by viewModels()

    @Inject
    lateinit var authManager: AuthManager

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupObservers()
        viewModel.loadUserProfile()

        binding.editProfileButton.setOnClickListener {
            startActivity(Intent(requireActivity(), ProfileActivity::class.java))
        }

        binding.logoutButton.setOnClickListener {
            authManager.clearToken()
            val intent = Intent(requireActivity(), LoginActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            requireActivity().finish()
        }
    }

    override fun onResume() {
        super.onResume()
        // Recharger le profil au cas où il a été modifié
        viewModel.loadUserProfile()
    }

    private fun setupObservers() {
        viewModel.profileResult.observe(viewLifecycleOwner) { result ->
            val isLoading = result is ProfileResult.Loading
            binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
            binding.profileContentGroup.visibility = if (isLoading) View.GONE else View.VISIBLE

            if (result is ProfileResult.Success) {
                bindUserData(result.user)
            } else if (result is ProfileResult.Error) {
                Toast.makeText(requireContext(), "Erreur: ${result.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun bindUserData(user: User) {
        binding.profileName.text = "${user.prenom} ${user.nom}"
        binding.profileEmail.text = user.email

        Glide.with(this)
            .load(user.urlPhotoProfil)
            .placeholder(R.drawable.ic_profile_placeholder)
            .error(R.drawable.ic_profile_placeholder)
            .circleCrop()
            .into(binding.profileImage)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
