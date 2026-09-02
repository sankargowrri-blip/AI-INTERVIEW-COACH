"""
connection.py

SQLAlchemy engine configuration tuned for Render + Neon PostgreSQL.

Key settings explained:
  pool_pre_ping=True      — test every connection before using it; discards
                            stale connections that were dropped by the server
                            or a firewall during the idle period.  Without
                            this, the first query after a cold-start often
                            hits a "connection reset by peer" error, causing
                            SQLAlchemy to retry with a brand-new connection
                            and wasting 2–5 extra seconds.

  pool_recycle=300        — force-recycle connections older than 5 minutes.
                            Render's free PostgreSQL disconnects idle clients
                            after roughly 5 minutes; recycling just before
                            that window avoids the stale-connection error
                            entirely.

  pool_size=5             — keep up to 5 idle connections warm.  Enough for
                            a low-traffic free-tier app without exhausting
                            the Render Postgres connection limit (~10).

  max_overflow=5          — allow 5 extra connections under burst load before
                            blocking.

  pool_timeout=30         — wait up to 30 s for a connection from the pool
                            before raising OperationalError. Prevents
                            indefinite hangs if the DB is briefly unavailable.

  connect_timeout=10      — TCP-level timeout for establishing a new
                            PostgreSQL connection (passed via connect_args).
                            If the DB host is unreachable the error surfaces
                            in 10 s rather than the OS default ~2 min.

  sslmode=require         — Render/Neon PostgreSQL requires SSL.  Without
                            this, connections may silently fall back to
                            plaintext and be rejected, causing confusing
                            authentication errors.
"""

import logging
from sqlalchemy import create_engine, event
from app.core.config import settings

logger = logging.getLogger(__name__)

_url = settings.DATABASE_URL
_is_sqlite = "sqlite" in _url

if _is_sqlite:
    # SQLite (local development) — minimal config, no pooling needed
    engine = create_engine(
        _url,
        connect_args={"check_same_thread": False},
    )
    logger.warning("[DB] Using SQLite — for development only.")
else:
    # PostgreSQL (Render / Neon production)
    engine = create_engine(
        _url,
        # ── connection pool ──────────────────────────────────────────────
        pool_pre_ping=True,     # discard stale connections immediately
        pool_recycle=300,       # recycle before Render's 5-min idle timeout
        pool_size=5,
        max_overflow=5,
        pool_timeout=30,
        # ── connect_args ─────────────────────────────────────────────────
        connect_args={
            "connect_timeout": 10,   # fail fast if DB is unreachable
            "sslmode": "require",    # Render/Neon requires SSL
            "options": "-c statement_timeout=30000",  # 30 s query timeout
        },
    )
    logger.info("[DB] PostgreSQL engine created (pool_pre_ping=True, pool_recycle=300s).")


# Log slow queries (> 1 s) in development for diagnostics
@event.listens_for(engine, "before_cursor_execute")
def _before_execute(conn, cursor, statement, parameters, context, executemany):
    import time
    context._query_start = time.monotonic()


@event.listens_for(engine, "after_cursor_execute")
def _after_execute(conn, cursor, statement, parameters, context, executemany):
    import time
    elapsed_ms = (time.monotonic() - context._query_start) * 1000
    if elapsed_ms > 1000:
        logger.warning("[DB] Slow query (%.0f ms): %.120s", elapsed_ms, statement)
