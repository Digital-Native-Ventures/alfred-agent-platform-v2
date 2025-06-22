-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create memories table with vector embeddings
CREATE TABLE IF NOT EXISTS memories (
  id          SERIAL PRIMARY KEY,
  session_id  UUID,
  role        TEXT,
  content     TEXT,
  embedding   VECTOR(1536),
  ts          TIMESTAMPTZ DEFAULT now()
);

-- Create index on embeddings for faster similarity searches
CREATE INDEX IF NOT EXISTS memories_embedding_idx ON memories USING ivfflat (embedding vector_cosine_ops);

-- Create index on session_id for faster filtering
CREATE INDEX IF NOT EXISTS memories_session_id_idx ON memories (session_id);

-- Create index on timestamp for temporal queries
CREATE INDEX IF NOT EXISTS memories_ts_idx ON memories (ts);