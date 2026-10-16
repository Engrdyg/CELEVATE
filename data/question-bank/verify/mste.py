"""
Independent recomputation checks for the MSTE question bank
(Applied Mathematics, Surveying, Transportation and Highway Engineering,
Construction Management and Methods).

Every function re-types its givens from the question stem and recomputes
the keyed answer from first principles. Nothing is imported from the JSON.
"""
from harness import check, deg, dms
import math


# --------------------------------------------------------------- trigonometry (migrated)
@check("mste-q001", unit="m")
def mste_q001():
    A, B, a = 40.0, 65.0, 12.0
    return a * math.sin(deg(B)) / math.sin(deg(A))


@check("mste-q002", unit="m")
def mste_q002():
    a, b, C = 25.0, 40.0, 110.0
    return math.sqrt(a * a + b * b - 2 * a * b * math.cos(deg(C)))


@check("mste-q003", unit="m")
def mste_q003():
    alpha, beta, d = 32.0, 47.0, 50.0
    # tower foot at x = 0, Q at distance x, P at x + d:  h = x tan(beta) = (x + d) tan(alpha)
    ta, tb = math.tan(deg(alpha)), math.tan(deg(beta))
    x = d * ta / (tb - ta)
    return x * tb


# --------------------------------------------------------------- calculus (migrated)
@check("mste-q004", unit="m^2")
def mste_q004():
    fence = 240.0
    # brute-force search over x (perpendicular side) as an independent check of the optimum
    best = 0.0
    n = 240000
    for i in range(1, n):
        x = fence / 2 * i / n
        best = max(best, x * (fence - 2 * x))
    return best


@check("mste-q005", unit="m")
def mste_q005():
    V = 10.0

    def S(r):
        h = V / (math.pi * r * r)
        return math.pi * r * r + 2 * math.pi * r * h

    # golden-section search for the minimum of S(r)
    lo, hi = 0.1, 5.0
    g = (math.sqrt(5) - 1) / 2
    for _ in range(200):
        c1 = hi - g * (hi - lo)
        c2 = lo + g * (hi - lo)
        if S(c1) < S(c2):
            hi = c2
        else:
            lo = c1
    return (lo + hi) / 2


@check("mste-q006", unit="")
def mste_q006():
    n, p, x = 10, 0.05, 2
    return math.comb(n, x) * p**x * (1 - p) ** (n - x)


# --------------------------------------------------------------- surveying (migrated)
@check("mste-q007", unit="m", tol=1e-4)
def mste_q007():
    elev = 125.430
    readings = [("BS", 1.425), ("FS", 2.310), ("BS", 0.875), ("FS", 1.940)]
    hi = None
    for kind, r in readings:
        if kind == "BS":
            hi = elev + r
        else:
            elev = hi - r
    return elev


@check("mste-q008", unit="m")
def mste_q008():
    K = 1.5  # km
    return 0.0675 * K**2


@check("mste-q009", unit="m", tol=0.002)
def mste_q009():
    L = 120.50
    bearing = dms(35, 20)  # N .. E -> departure positive
    return +L * math.sin(deg(bearing))


@check("mste-q010", unit="m^2")
def mste_q010():
    pts = [(1000.0, 1000.0), (1120.0, 1015.0), (1150.0, 1095.0), (1030.0, 1110.0)]
    s = 0.0
    for i in range(len(pts)):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % len(pts)]
        s += x1 * y2 - x2 * y1
    return abs(s) / 2


# --------------------------------------------------------------- transportation (migrated)
@check("mste-q011", unit="m", tol=1e-4)
def mste_q011():
    D, arc = 4.0, 20.0
    # arc of 20 m subtends D degrees: arc = R * D(rad)
    return arc / deg(D)


@check("mste-q012", unit="m", tol=1e-5)
def mste_q012():
    R, I, sta_pi = 300.0, 36.0, 10250.000
    T = R * math.tan(deg(I / 2))
    L = R * deg(I)
    return sta_pi - T + L


@check("mste-q013", unit="m", tol=1e-4)
def mste_q013():
    L, g1, g2 = 200.0, 0.03, -0.02
    sta_pvi, elev_pvi = 5100.0, 150.00
    elev_pvc = elev_pvi - g1 * L / 2

    def y(x):
        return elev_pvc + g1 * x + (g2 - g1) / (2 * L) * x * x

    # scan the curve for the highest elevation
    return max(y(L * i / 200000) for i in range(200001))


@check("mste-q014", unit="m")
def mste_q014():
    V, t, f, G = 90.0, 2.5, 0.30, -0.04
    return 0.278 * V * t + V**2 / (254 * (f + G))


@check("mste-q015", unit="veh/h")
def mste_q015():
    k, vs = 40.0, 54.0
    return k * vs


# --------------------------------------------------------------- construction management (migrated from psad)
def _cpm(acts):
    """acts: dict name -> (duration, [preds]); returns (ES, EF, LS, LF, project duration)."""
    order = list(acts)
    ES, EF = {}, {}
    while len(EF) < len(order):
        for a in order:
            if a in EF:
                continue
            d, preds = acts[a]
            if all(p in EF for p in preds):
                ES[a] = max([EF[p] for p in preds], default=0)
                EF[a] = ES[a] + d
    T = max(EF.values())
    succ = {a: [b for b in order if a in acts[b][1]] for a in order}
    LS, LF = {}, {}
    while len(LS) < len(order):
        for a in order:
            if a in LS:
                continue
            if all(s in LS for s in succ[a]):
                LF[a] = min([LS[s] for s in succ[a]], default=T)
                LS[a] = LF[a] - acts[a][0]
    return ES, EF, LS, LF, T


@check("mste-q016", unit="days", tol=0.001)
def mste_q016():
    acts = {"P": (4, []), "Q": (3, []), "R": (5, ["P"]), "S": (2, ["Q"]), "T": (4, ["R", "S"])}
    ES, EF, LS, LF, T = _cpm(acts)
    return LS["S"] - ES["S"]


@check("mste-q017", unit="days", tol=0.001)
def mste_q017():
    acts = {"A": (3, []), "B": (5 + 4, []), "C": (4, ["A"]), "D": (6, ["A"]),
            "E": (2, ["B", "C"]), "F": (4, ["D", "E"])}
    return _cpm(acts)[4]


@check("mste-q018", unit="bags", tol=0.001)
def mste_q018():
    footings = 4 * 1.5 * 1.5 * 0.40
    columns = 4 * 0.35 * 0.35 * 3.2
    return math.ceil(9.0 * (footings + columns))


# --------------------------------------------------------------- algebra
@check("mste-q019", unit="blocks", tol=0.001)
def mste_q019():
    day, inc, total = 120, 15, 0
    for _ in range(12):
        total += day
        day += inc
    return total


@check("mste-q020", unit="h")
def mste_q020():
    rate = 1 / 6 + 1 / 9 - 1 / 12
    return 1 / rate


@check("mste-q021", unit="years")
def mste_q021():
    P0, P, r = 1.80, 2.50, 0.021
    return math.log(P / P0) / math.log(1 + r)


@check("mste-q022", unit="m")
def mste_q022():
    # w(2w + 3) = 180
    a, b, c = 2.0, 3.0, -180.0
    return (-b + math.sqrt(b * b - 4 * a * c)) / (2 * a)


# --------------------------------------------------------------- trigonometry and geometry
@check("mste-q023", unit="m^2")
def mste_q023():
    n, s = 8, 0.25
    # area of a regular polygon: n s^2 / (4 tan(pi/n))
    return n * s * s / (4 * math.tan(math.pi / n))


@check("mste-q024", unit="m^3")
def mste_q024():
    R1, R2, h = 6.0, 3.0, 4.0
    # volume of full cone minus removed tip (similar cones)
    H = h * R1 / (R1 - R2)
    return math.pi / 3 * (R1**2 * H - R2**2 * (H - h))


@check("mste-q025", unit="km")
def mste_q025():
    R = 6371.0
    lat1, lon1 = 14.60, 120.98
    lat2, lon2 = 35.68, 139.69

    # unit vectors in Earth-centred coordinates; central angle from the dot product
    def vec(lat, lon):
        return (math.cos(deg(lat)) * math.cos(deg(lon)), math.cos(deg(lat)) * math.sin(deg(lon)), math.sin(deg(lat)))

    a, b = vec(lat1, lon1), vec(lat2, lon2)
    dot = sum(x * y for x, y in zip(a, b))
    return R * math.acos(dot)


# --------------------------------------------------------------- analytic geometry
@check("mste-q026", unit="m")
def mste_q026():
    A, B, C = 5.0, 12.0, -20.0
    x1, y1 = 7.0, 4.0
    return abs(A * x1 + B * y1 + C) / math.hypot(A, B)


@check("mste-q027", unit="m")
def mste_q027():
    span, rise, from_springing = 20.0, 6.0, 3.0
    a = span / 2
    x = a - from_springing
    return rise * math.sqrt(1 - (x / a) ** 2)


@check("mste-q028", unit="m")
def mste_q028():
    diameter, depth = 3.0, 0.40
    x = diameter / 2
    return x * x / (4 * depth)


# --------------------------------------------------------------- calculus and differential equations
@check("mste-q029", unit="")
def mste_q029():
    # numerical integration (Simpson) of (6x - x^2) - x between the intersections 0 and 5
    f = lambda x: (6 * x - x * x) - x  # noqa: E731
    a, b, n = 0.0, 5.0, 1000
    h = (b - a) / n
    s = f(a) + f(b) + sum((4 if i % 2 else 2) * f(a + i * h) for i in range(1, n))
    return s * h / 3


@check("mste-q030", unit="m^3")
def mste_q030():
    depth = 2.0
    # shell method about the y-axis as an independent route: V = int_0^r 2 pi x (depth - 0.5 x^2) dx
    r = math.sqrt(depth / 0.5)
    n = 2000
    h = r / n
    f = lambda x: 2 * math.pi * x * (depth - 0.5 * x * x)  # noqa: E731
    s = f(0) + f(r) + sum((4 if i % 2 else 2) * f(i * h) for i in range(1, n))
    return s * h / 3


@check("mste-q031", unit="deg C")
def mste_q031():
    T0, Ta, T2, t1, t = 70.0, 30.0, 55.0, 2.0, 5.0
    k = math.log((T0 - Ta) / (T2 - Ta)) / t1
    return Ta + (T0 - Ta) * math.exp(-k * t)


@check("mste-q032", unit="m/min")
def mste_q032():
    Q, H, Rtop, h = 0.80, 5.0, 2.0, 3.0
    r = Rtop * h / H
    return Q / (math.pi * r * r)  # dh/dt = Q / free-surface area


# --------------------------------------------------------------- probability, statistics, engineering economy
@check("mste-q033", unit="")
def mste_q033():
    mu, sigma, x = 28.0, 3.2, 24.0
    z = (x - mu) / sigma
    return 0.5 * math.erfc(-z / math.sqrt(2))


@check("mste-q034", unit="PHP")
def mste_q034():
    P, r, m, n = 500000.0, 0.06, 4, 5
    F = P
    for _ in range(m * n):
        F *= 1 + r / m
    return F


@check("mste-q035", unit="million PHP")
def mste_q035():
    cost, salvage, life, years = 4500000.0, 500000.0, 8, 3
    bv = cost
    for _ in range(years):
        bv = max(bv - bv * 2 / life, salvage)
    return bv / 1e6


# --------------------------------------------------------------- surveying
@check("mste-q036", unit="m")
def mste_q036():
    L, Ts, T, alpha = 846.25, 20.0, 33.0, 11.6e-6
    return alpha * L * (T - Ts)


@check("mste-q037", unit="m")
def mste_q037():
    L, n = 30.0, 12
    alpha, T, Ts = 11.6e-6, 31.0, 20.0
    P, Ps, A, E = 90.0, 50.0, 3.0e-6, 200e9
    w = 0.30
    ct = alpha * L * (T - Ts)
    cp = (P - Ps) * L / (A * E)
    cs = -(w * L) ** 2 * L / (24 * P**2)  # W^2 L / (24 P^2) with W = wL
    return n * (ct + cp + cs)


@check("mste-q038", unit="m")
def mste_q038():
    a1, b1 = 1.523, 1.087
    a2 = 1.402
    true_diff = a1 - b1
    return a2 - true_diff


@check("mste-q039", unit="m")
def mste_q039():
    K, C, s, theta = 100.0, 0.30, 1.850, 12.5
    # inclined distance along the line of sight, then reduce to horizontal
    D = K * s * math.cos(deg(theta)) + C
    return D * math.cos(deg(theta))


@check("mste-q040", unit="m")
def mste_q040():
    K, s, theta, hi, rr = 100.0, 2.360, 8.25, 1.52, 2.85
    D = K * s * math.cos(deg(theta))  # inclined distance (C = 0)
    V = D * math.sin(deg(theta))
    return hi + V - rr


@check("mste-q041", unit="m")
def mste_q041():
    # (length, azimuth from north, clockwise)
    courses = [
        (186.40, dms(32, 15)),          # N 32 15 E
        (142.75, 180 - dms(68, 40)),    # S 68 40 E
        (214.30, 180 + dms(21, 10)),    # S 21 10 W
    ]
    N = sum(L * math.cos(deg(az)) for L, az in courses)
    E = sum(L * math.sin(deg(az)) for L, az in courses)
    return math.hypot(N, E)


# --------------------------------------------------------------- transportation and highway engineering
@check("mste-q042", unit="m")
def mste_q042():
    D, I = 3.0, 40.0
    R = 20.0 / deg(D)
    return R / math.cos(deg(I / 2)) - R


@check("mste-q043", unit="m")
def mste_q043():
    R, V, t, f = 250.0, 80.0, 2.5, 0.35
    S = 0.278 * V * t + V**2 / (254 * f)
    return R * (1 - math.cos(S / (2 * R)))


@check("mste-q044", unit="m")
def mste_q044():
    g1, g2, S, h1, h2 = 2.5, -3.0, 160.0, 1.08, 0.60
    A = abs(g1 - g2)
    L = A * S**2 / (200 * (math.sqrt(h1) + math.sqrt(h2)) ** 2)
    assert L > S
    return L


@check("mste-q045", unit="km/h")
def mste_q045():
    d = 100.0
    times = [3.6, 5.4, 4.5, 6.0, 4.0]
    # harmonic mean of individual speeds = space-mean speed
    speeds = [d / t for t in times]
    vs = len(speeds) / sum(1 / v for v in speeds)
    return vs * 3.6


@check("mste-q046", unit="m^3")
def mste_q046():
    A1, A2, sta1, sta2 = 42.6, 58.2, 1020.0, 1040.0
    return (A1 + A2) / 2 * (sta2 - sta1)


@check("mste-q047", unit="million ESAL")
def mste_q047():
    trucks, axles, std = 400, [50.0, 110.0], 80.0
    r, years = 0.03, 10
    tf = sum((p / std) ** 4 for p in axles)
    total = 0.0
    for yr in range(years):
        total += trucks * (1 + r) ** yr * tf * 365
    return total / 1e6


# --------------------------------------------------------------- construction management
@check("mste-q048", unit="m^3/h")
def mste_q048():
    q, F, tc, E, swell = 1.20, 0.90, 20.0, 50 / 60, 0.25
    loose = q * F * (3600 / tc) * E
    return loose / (1 + swell)


@check("mste-q049", unit="per million h")
def mste_q049():
    workers, hpw, weeks, injuries = 420, 48, 50, 6
    return injuries * 1e6 / (workers * hpw * weeks)


@check("mste-q050", unit="m^3")
def mste_q050():
    n = 12
    pit = 2.2 * 2.2 * 1.8
    concrete = 1.6 * 1.6 * 0.40 + 0.40 * 0.40 * 1.4
    fill_compacted = n * (pit - concrete)
    bank_for_fill = fill_compacted / 0.90
    surplus_bank = n * pit - bank_for_fill
    return surplus_bank * 1.25
