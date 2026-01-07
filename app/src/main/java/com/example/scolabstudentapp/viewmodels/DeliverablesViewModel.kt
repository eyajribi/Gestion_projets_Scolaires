package com.example.scolabstudentapp.viewmodels

import android.net.Uri
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.scolabstudentapp.models.Livrable
import com.example.scolabstudentapp.repositories.ProjectDetailRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DeliverablesViewModel @Inject constructor(
    private val repository: ProjectDetailRepository
) : ViewModel() {

    private val _submissionResult = MutableLiveData<SubmissionResult>()
    val submissionResult: LiveData<SubmissionResult> = _submissionResult

    fun submitLivrable(livrableId: String, fileUri: Uri) {
        viewModelScope.launch {
            _submissionResult.value = SubmissionResult.Loading
            val result = repository.submitLivrable(livrableId, fileUri)
            result.onSuccess {
                _submissionResult.value = SubmissionResult.Success(it)
            }.onFailure {
                _submissionResult.value = SubmissionResult.Error(it.message ?: "Submission failed")
            }
        }
    }
}

sealed class SubmissionResult {
    data class Success(val livrable: Livrable) : SubmissionResult()
    data class Error(val message: String) : SubmissionResult()
    object Loading : SubmissionResult()
}
