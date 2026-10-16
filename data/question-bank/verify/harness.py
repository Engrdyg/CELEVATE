"""
CELEVATE question-bank verification harness.

Each subject module (mste.py, hge.py, psad.py) registers one function per
computational question with the @check decorator. A function must recompute
the answer *independently from the stated givens* (never by reading the
answer key) and return a float in the unit declared on the decorator.
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Callable, Dict

REGISTRY: Dict[str, "Check"] = {}


@dataclass
class Check:
    qid: str
    fn: Callable[[], float]
    unit: str
    tol: float  # relative tolerance


def check(qid: str, unit: str = "", tol: float = 0.005):
    """Register an independent recomputation for question `qid`."""

    def deco(fn: Callable[[], float]):
        if qid in REGISTRY:
            raise ValueError(f"duplicate check for {qid}")
        REGISTRY[qid] = Check(qid=qid, fn=fn, unit=unit, tol=tol)
        return fn

    return deco


def close(a: float, b: float, tol: float) -> bool:
    """Relative comparison with a small absolute floor for values near zero."""
    return math.isclose(a, b, rel_tol=tol, abs_tol=max(1e-9, tol * 1e-3))


# Small helpers commonly needed by checks -----------------------------------
def deg(x: float) -> float:
    return math.radians(x)


def dms(d: float, m: float = 0.0, s: float = 0.0) -> float:
    """Degrees-minutes-seconds to decimal degrees."""
    sign = -1 if d < 0 else 1
    return sign * (abs(d) + m / 60 + s / 3600)


G = 9.81  # m/s^2
GAMMA_W = 9.81  # kN/m^3
