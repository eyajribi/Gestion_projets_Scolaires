package com.Scolab.ScolabBackend.Entity;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class EvaluationTest {

    @Test
    void estValide_devraitRetournerVrai_pourNotesEntre0et20() {
        Evaluation e = new Evaluation();
        e.setNote(0.0);
        assertTrue(e.estValide());
        e.setNote(10.0);
        assertTrue(e.estValide());
        e.setNote(20.0);
        assertTrue(e.estValide());
    }

    @Test
    void estValide_devraitRetournerFaux_pourNotesInvalides() {
        Evaluation e = new Evaluation();
        e.setNote(null);
        assertFalse(e.estValide());
        e.setNote(-1.0);
        assertFalse(e.estValide());
        e.setNote(21.0);
        assertFalse(e.estValide());
    }

    @Test
    void getAppreciation_devraitRetournerTexteCorrect() {
        Evaluation e = new Evaluation();

        e.setNote(null);
        assertEquals("Non évalué", e.getAppreciation());

        e.setNote(9.0);
        assertEquals("Insuffisant", e.getAppreciation());

        e.setNote(10.0);
        assertEquals("Passable", e.getAppreciation());

        e.setNote(12.5);
        assertEquals("Assez bien", e.getAppreciation());

        e.setNote(14.5);
        assertEquals("Bien", e.getAppreciation());

        e.setNote(16.0);
        assertEquals("Très bien", e.getAppreciation());
    }
}


