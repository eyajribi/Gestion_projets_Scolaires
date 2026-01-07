package com.example.scolabstudentapp.fragments

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.scolabstudentapp.ProjectDetailActivity
import com.example.scolabstudentapp.adapters.ProjectAdapter
import com.example.scolabstudentapp.databinding.FragmentProjectsBinding
import com.example.scolabstudentapp.viewmodels.ProjectsViewModel
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.example.scolabstudentapp.R
import com.example.scolabstudentapp.viewmodels.RefreshState
import com.google.android.material.snackbar.Snackbar
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class ProjectsFragment : Fragment() {

    private var _binding: FragmentProjectsBinding? = null
    private val binding get() = _binding!!

    private val viewModel: ProjectsViewModel by viewModels()
    private lateinit var projectAdapter: ProjectAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProjectsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupRecyclerView()
        setupObservers()

        binding.root.findViewById<SwipeRefreshLayout>(R.id.swipeRefreshLayout).setOnRefreshListener {
            viewModel.refreshProjects()
        }
    }

    private fun setupRecyclerView() {
        projectAdapter = ProjectAdapter { project ->
            val intent = Intent(requireActivity(), ProjectDetailActivity::class.java)
            intent.putExtra(ProjectDetailActivity.EXTRA_PROJECT_ID, project.id)
            startActivity(intent)
        }
        binding.projectsRecyclerView.apply {
            adapter = projectAdapter
            layoutManager = LinearLayoutManager(requireContext())
        }
    }

    private fun setupObservers() {
        viewModel.projects.observe(viewLifecycleOwner) { projects ->
            projectAdapter.submitList(projects)
            binding.emptyView.visibility = if (projects.isEmpty()) View.VISIBLE else View.GONE
        }

        viewModel.refreshState.observe(viewLifecycleOwner) { state ->
            val swipeRefreshLayout = binding.root.findViewById<SwipeRefreshLayout>(R.id.swipeRefreshLayout)
            swipeRefreshLayout.isRefreshing = state is RefreshState.Loading

            if (state is RefreshState.Error) {
                Snackbar.make(binding.root, state.message, Snackbar.LENGTH_LONG)
                    .setAction("Réessayer") { 
                        viewModel.refreshProjects()
                    }
                    .show()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
