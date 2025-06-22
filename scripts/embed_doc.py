import sys, os, openai, psycopg2, textwrap, tiktoken
from pgvector.psycopg2 import register_vector
doc_path = sys.argv[1]
text = open(doc_path).read()
chunks = textwrap.wrap(text, 1000)
openai.api_key = os.environ["OPENAI_API_KEY"]
conn = psycopg2.connect(os.environ["PGVECTOR_URL"])
register_vector(conn)
cur = conn.cursor()
cur.execute("CREATE TABLE IF NOT EXISTS doc_chunks(id SERIAL, content TEXT, embedding VECTOR(1536))")
for chunk in chunks:
    emb = openai.embeddings.create(model="text-embedding-3-small", input=chunk).data[0].embedding
    cur.execute("INSERT INTO doc_chunks(content, embedding) VALUES (%s, %s)", (chunk, emb))
conn.commit()