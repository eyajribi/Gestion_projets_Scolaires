package com.Scolab.ScolabBackend.Repository;

import com.Scolab.ScolabBackend.Entity.Groupe;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface GroupeRepository extends MongoRepository<Groupe, String> {
    // ...existing code...
}

