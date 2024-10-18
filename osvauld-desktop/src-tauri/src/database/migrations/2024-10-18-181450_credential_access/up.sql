-- Create credential_access table
CREATE TABLE IF NOT EXISTS credential_access (
    id VARCHAR PRIMARY KEY NOT NULL,
    credential_id VARCHAR NOT NULL,
    user_id VARCHAR NOT NULL,
    access_type VARCHAR NOT NULL,
    folder_id VARCHAR NOT NULL,
    encrypted_key TEXT NOT NULL,
    FOREIGN KEY (credential_id) REFERENCES credentials(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (folder_id) REFERENCES folders (id)
);
