-- Scaffold baseline; auth/tenant tables land in java-persistence follow-up migrations.
CREATE TABLE IF NOT EXISTS flyway_baseline (
    id SMALLINT PRIMARY KEY,
    note VARCHAR(255) NOT NULL
);

INSERT INTO flyway_baseline (id, note)
SELECT 1, 'scaffold'
WHERE NOT EXISTS (SELECT 1 FROM flyway_baseline WHERE id = 1);
