# agent/utils/logger.py
"""
Logger & Pipeline Monitor untuk SkillBridge AI.
Mencatat setiap tahap pipeline, waktu eksekusi, dan error.
"""

import time
import logging
import functools
from datetime import datetime
from typing import Callable, Any

# ── Setup Logger ───────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger("skillbridge")


# ── Pipeline Step Timer ────────────────────────────────────────────────────────

class PipelineTrace:
    """
    Mencatat waktu eksekusi setiap step dalam pipeline.
    Digunakan untuk monitoring performa dan debugging.
    """
    def __init__(self, pipeline_name: str):
        self.name    = pipeline_name
        self.steps   = []
        self.started = time.time()

    def log_step(self, step_name: str, duration_ms: float, metadata: dict = None):
        self.steps.append({
            "step":        step_name,
            "duration_ms": round(duration_ms, 2),
            "timestamp":   datetime.now().isoformat(),
            "metadata":    metadata or {},
        })
        logger.info(f"[{self.name}] {step_name} — {duration_ms:.0f}ms")

    def finish(self) -> dict:
        total_ms = (time.time() - self.started) * 1000
        logger.info(f"[{self.name}] Pipeline selesai — total {total_ms:.0f}ms")
        return {
            "pipeline":   self.name,
            "total_ms":   round(total_ms, 2),
            "steps":      self.steps,
        }


def timed_step(step_name: str, trace: PipelineTrace = None):
    """
    Decorator untuk mengukur waktu eksekusi sebuah fungsi
    dan mencatatnya ke PipelineTrace.

    Usage:
        @timed_step("ocr_processing", trace=my_trace)
        def run_ocr(image): ...
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            start  = time.time()
            result = func(*args, **kwargs)
            elapsed_ms = (time.time() - start) * 1000
            if trace:
                trace.log_step(step_name, elapsed_ms)
            else:
                logger.info(f"{step_name} — {elapsed_ms:.0f}ms")
            return result
        return wrapper
    return decorator


# ── Error Logger ───────────────────────────────────────────────────────────────

def log_pipeline_error(pipeline: str, step: str, error: Exception, context: dict = None):
    """Log error dengan context lengkap untuk debugging."""
    logger.error(
        f"[{pipeline}] Error di step '{step}': {type(error).__name__}: {error}",
        extra={"context": context or {}}
    )


def log_ai_call(model: str, prompt_tokens: int, completion_tokens: int, step: str):
    """Log setiap API call ke Claude/Azure untuk monitoring cost."""
    total_tokens = prompt_tokens + completion_tokens
    logger.info(
        f"[AI Call] model={model} step={step} "
        f"tokens={total_tokens} (prompt={prompt_tokens} completion={completion_tokens})"
    )


# ── Smoke Test ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("✅ Logger SkillBridge AI berjalan dengan baik")
    trace = PipelineTrace("test_pipeline")

    @timed_step("dummy_step", trace=trace)
    def dummy():
        time.sleep(0.05)
        return "ok"

    dummy()
    result = trace.finish()
    print(f"Trace: {result}")
