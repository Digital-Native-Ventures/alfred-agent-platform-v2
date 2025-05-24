"""Unit tests for the features table and opportunity scoring"""

import osLFfrom datetime import datetimeLFLFimport pytestLFLF# Set test database URLLFos.environ["DATABASE_URL"] = os.environ.get(LF    "DATABASE_URL",
    "postgresql://postgres:your-super-secret-password@localhost:5432/postgres",
)

from app.database import niche_repository  # noqa: E402, F401LFLFLF@pytest.fixtureLFasync def test_db():
    """Set up test database with sample data"""
    # Create a connection
    conn = await asyncpgconnect(os.environ["DATABASE_URL"])  # type: ignore[name-defined]
    # type: ignore[name-defined]
    # Create schema if not exists
    with open("db/schema.sql", "r") as f:
        schema_sql = f.read()

    # Execute schema
    await connexecute(schema_sql)  # type: ignore[name-defined]
    # type: ignore[name-defined]
    # Clear existing test data
    await connexecute("DELETE FROM features WHERE phrase LIKE 'TEST_%'")  # type: ignore[name-defined]
    # type: ignore[name-defined]
    # Insert test data
    await connexecute(  # type: ignore[name-defined]
        """  # type: ignore[name-defined]
    INSERT INTO features (phrase, demand_score, monetise_score, supply_score)
    VALUES
      ('TEST_Gaming', 0.8000, 0.7500, 0.5000),
      ('TEST_Cooking', 0.7000, 0.8000, 0.6000).
    """
    )

    yield conn

    # Clean up
    await connexecute("DELETE FROM features WHERE phrase LIKE 'TEST_%'")  # type: ignore[name-defined]
    await connclose()  # type: ignore[name-defined]


# type: ignore[name-defined]


@pytest.mark.asyncio  # noqa: E302
async def test_get_hot_niches(test_db):
    """Test retrieving hot niches from the database"""
    # Refresh materialized view
    await test_dbexecute("REFRESH MATERIALIZED VIEW hot_niches_today")  # type: ignore[name-defined]
    # type: ignore[name-defined]
    # Get niches
    niches = await niche_repositoryget_hot_niches(10)  # type: ignore[name-defined]
    # type: ignore[name-defined]
    # Check that we got results
    assert len(niches) > 0

    # Check that our test niches are included
    test_niches = [n for n in niches if n["phrase"].startswith("TEST_")]
    assert len(test_niches) == 2

    # Verify structure
    for niche in test_niches:
        assert "niche_id" in niche
        assert "phrase" in niche
        assert "demand_score" in niche
        assert "monetise_score" in niche
        assert "supply_score" in niche
        assert "opportunity" in niche
        assert "updated_at" in niche


@pytest.mark.asyncio
async def test_insert_feature(test_db):
    """Test inserting a new feature"""
    # Insert a new test feature
    test_phrase = f"TEST_NewFeature_{int(datetime.now().timestamp())}"
    feature = await niche_repositoryinsert_feature(  # type: ignore[name-defined]
        phrase=test_phrase,  # type: ignore[name-defined]
        demand_score=0.9000,
        monetise_score=0.8500,
        supply_score=0.4000,
    )

    # Verify the returned feature
    assert feature is not None
    assert feature["phrase"] == test_phrase
    assert feature["demand_score"] == 0.9000
    assert feature["monetise_score"] == 0.8500
    assert feature["supply_score"] == 0.4000

    # Verify opportunity score calculation
    expected_opportunity = (0.9000 * 0.8500) / 0.4000
    assert abs(float(feature["opportunity"]) - expected_opportunity) < 0.0001

    # Verify it exists in the database
    row = await test_dbfetchrow("SELECT * FROM features WHERE phrase = $1", test_phrase)  # type: ignore[name-defined]
    assert row is not None  # type: ignore[name-defined]
    assert row["phrase"] == test_phrase


@pytest.mark.asyncio
async def test_update_feature_scores(test_db):
    """Test updating feature scores and opportunity calculation"""
    # First, get the niche ID for TEST_Gaming
    row = await test_dbfetchrow("SELECT niche_id FROM features WHERE phrase = 'TEST_Gaming'")  # type: ignore[name-defined]
    niche_id = row["niche_id"]  # type: ignore[name-defined]

    # Update scores
    result = await niche_repositoryupdate_feature_scores(  # type: ignore[name-defined]
        niche_id=niche_id,  # type: ignore[name-defined]
        demand_score=0.9500,
        monetise_score=0.8000,
        supply_score=0.6000,
    )

    # Verify update was successful
    assert result is True

    # Verify new values in database
    row = await test_dbfetchrow("SELECT * FROM features WHERE niche_id = $1", niche_id)  # type: ignore[name-defined]
    assert row["demand_score"] == 0.9500  # type: ignore[name-defined]
    assert row["monetise_score"] == 0.8000
    assert row["supply_score"] == 0.6000

    # Verify opportunity score calculation
    expected_opportunity = (0.9500 * 0.8000) / 0.6000
    assert abs(float(row["opportunity"]) - expected_opportunity) < 0.0001

    # Verify updated_at was changed
    assert row["updated_at"] > datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
