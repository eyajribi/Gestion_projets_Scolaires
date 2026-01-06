package com.example.scolabstudentapp.models

import androidx.room.TypeConverter
import java.util.Date
import com.example.scolabstudentapp.models.StatutProjet

class Converters {
    @TypeConverter
    fun fromTimestamp(value: Long?): Date? {
        return value?.let { Date(it) }
    }

    @TypeConverter
    fun dateToTimestamp(date: Date?): Long? {
        return date?.time
    }

    @TypeConverter
    fun fromStatutProjet(value: String?): StatutProjet? {
        return value?.let { StatutProjet.valueOf(it) }
    }

    @TypeConverter
    fun statutProjetToString(statut: StatutProjet?): String? {
        return statut?.name
    }

    @TypeConverter
    fun fromStringList(value: String?): List<String>? {
        return value?.split(",")?.map { it.trim() }
    }

    @TypeConverter
    fun stringListToString(list: List<String>?): String? {
        return list?.joinToString(",")
    }

    // Ajoute ici d'autres convertisseurs si StatutProjet ou d'autres types complexes sont utilisés
}
