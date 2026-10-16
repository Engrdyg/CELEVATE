"""
Independent recomputations for the Principles of Structural Analysis and Design bank
(data/question-bank/structural-analysis-design.json).

Every function re-types the givens from the question stem and recomputes the keyed answer
from first principles. Units: N, mm, MPa unless noted; returned values are in the unit
declared on the decorator.
"""
from harness import check, deg, G
import math


# --------------------------------------------------------------------------- migrated legacy
@check("psad-q001", unit="kN")
def psad_q001():
    L, P, a = 6.0, 30.0, 2.0
    return P * (L - a) / L


@check("psad-q002", unit="MPa")
def psad_q002():
    d, P = 20.0, 50e3
    return P / (math.pi * d ** 2 / 4)


@check("psad-q003", unit="MPa")
def psad_q003():
    L, gap, dT, alpha, E = 5000.0, 1.0, 50.0, 11.7e-6, 200e3
    free = alpha * L * dT
    restrained = max(free - gap, 0.0)
    return E * restrained / L


@check("psad-q004", unit="kN")
def psad_q004():
    w, Ltot, xB, Pc = 10.0, 8.0, 6.0, 20.0
    W = w * Ltot
    RB = (W * Ltot / 2 + Pc * Ltot) / xB
    return W + Pc - RB


@check("psad-q005", unit="kN·m")
def psad_q005():
    w, L = 12.0, 8.0
    return w * L ** 2 / 8


@check("psad-q006", unit="kN·m")
def psad_q006():
    L, w, P, a = 6.0, 10.0, 40.0, 2.0
    RA = (w * L * L / 2 + P * (L - a)) / L

    # scan the moment diagram numerically
    def M(x):
        m = RA * x - w * x ** 2 / 2
        if x > a:
            m -= P * (x - a)
        return m
    return max(M(i * L / 60000) for i in range(60001))


@check("psad-q007", unit="mm")
def psad_q007():
    P, L, E, I = 20e3, 3000.0, 200e3, 60e6
    return P * L ** 3 / (3 * E * I)


@check("psad-q008", unit="kN")
def psad_q008():
    span, rise, P = 8.0, 3.0, 60.0
    R = P / 2
    half = span / 2
    rafter = math.hypot(half, rise)
    F_rafter = R * rafter / rise
    return F_rafter * half / rafter


@check("psad-q009", unit="", tol=0.001)
def psad_q009():
    d, L, K = 40.0, 2000.0, 1.0
    r = math.sqrt((math.pi * d ** 4 / 64) / (math.pi * d ** 2 / 4))
    return K * L / r


@check("psad-q010", unit="kN·m")
def psad_q010():
    b, d, fc, fy = 300.0, 500.0, 28.0, 420.0
    As = 3 * math.pi * 25 ** 2 / 4
    a = As * fy / (0.85 * fc * b)
    return As * fy * (d - a / 2) / 1e6


@check("psad-q011", unit="mm²")
def psad_q011():
    b, d, Mu, fc, fy, phi = 300.0, 500.0, 250e6, 28.0, 420.0, 0.90
    Mn = Mu / phi
    # bisection on As for Mn(As) = required
    lo, hi = 1.0, 5000.0
    for _ in range(200):
        mid = (lo + hi) / 2
        a = mid * fy / (0.85 * fc * b)
        if mid * fy * (d - a / 2) < Mn:
            lo = mid
        else:
            hi = mid
    As = (lo + hi) / 2
    c = As * fy / (0.85 * fc * b) / 0.85
    assert 0.003 * (d - c) / c >= 0.005
    return As


@check("psad-q012", unit="kN")
def psad_q012():
    L, Ix, Iy, E = 5000.0, 80e6, 25e6, 200e3
    return math.pi ** 2 * E * min(Ix, Iy) / L ** 2 / 1e3


# --------------------------------------------------------------------------- engineering mechanics
@check("psad-q013", unit="N")
def psad_q013():
    W, theta, mu = 500.0, deg(25.0), 0.30
    # forces along incline: P - W sin - mu N = 0
    return W * math.sin(theta) + mu * W * math.cos(theta)


@check("psad-q014", unit="10^6 mm^4")
def psad_q014():
    parts = [  # (b, h, y_centroid from bottom)
        (200.0, 20.0, 180.0 + 10.0),
        (20.0, 180.0, 90.0),
    ]
    A = sum(b * h for b, h, _ in parts)
    yb = sum(b * h * y for b, h, y in parts) / A
    I = sum(b * h ** 3 / 12 + b * h * (y - yb) ** 2 for b, h, y in parts)
    return I / 1e6


@check("psad-q015", unit="m")
def psad_q015():
    v0 = 80 * 1000 / 3600
    theta = math.atan(0.04)
    mu = 0.55
    decel = G * (mu * math.cos(theta) - math.sin(theta))
    return v0 ** 2 / (2 * decel)


@check("psad-q016", unit="kN")
def psad_q016():
    W = 12.0
    a1, a2 = deg(25.0), deg(60.0)
    # [-cos a1, cos a2; sin a1, sin a2] [T_AC, T_BC] = [0, W]
    det = -math.cos(a1) * math.sin(a2) - math.cos(a2) * math.sin(a1)
    T_BC = (-math.cos(a1) * W - 0 * math.sin(a1)) / det
    return T_BC


# --------------------------------------------------------------------------- strength of materials
@check("psad-q017", unit="MPa")
def psad_q017():
    P, B = 1200e3, 300.0
    As = 4 * math.pi * 25.0 ** 2 / 4
    Es, Ec = 200e3, 25e3
    # equal strain eps: P = eps (Ec Ac + Es As)
    eps = P / (Ec * (B * B - As) + Es * As)
    return Es * eps


@check("psad-q018", unit="MPa")
def psad_q018():
    power, rpm, d = 150e3, 300.0, 70.0
    omega = rpm * 2 * math.pi / 60
    T = power / omega * 1e3  # N*mm
    J = math.pi * d ** 4 / 32
    return T * (d / 2) / J


@check("psad-q019", unit="deg", tol=0.005)
def psad_q019():
    L, Do, Di, T, Gm = 2000.0, 100.0, 80.0, 8e6, 80e3
    J = math.pi / 32 * (Do ** 4 - Di ** 4)
    return math.degrees(T * L / (Gm * J))


@check("psad-q020", unit="MPa")
def psad_q020():
    b, h, L, w = 150.0, 300.0, 4000.0, 15.0  # w in N/mm
    M = w * L ** 2 / 8
    I = b * h ** 3 / 12
    return M * (h / 2) / I


@check("psad-q021", unit="MPa")
def psad_q021():
    bf, tf, tw, hw, V = 200.0, 20.0, 10.0, 260.0, 150e3
    H = hw + 2 * tf
    I = 2 * (bf * tf ** 3 / 12 + bf * tf * (H / 2 - tf / 2) ** 2) + tw * hw ** 3 / 12
    Q = bf * tf * (H / 2 - tf / 2) + tw * (hw / 2) ** 2 / 2
    return V * Q / (I * tw)


@check("psad-q022", unit="mm")
def psad_q022():
    D, p, allow = 2000.0, 1.8, 140.0
    return p * (D / 2) / allow  # hoop: p r / t


@check("psad-q023", unit="MPa")
def psad_q023():
    sx, sy, txy = 80.0, -40.0, 30.0
    # eigenvalues of the stress tensor
    tr = sx + sy
    det = sx * sy - txy ** 2
    return (tr + math.sqrt(tr ** 2 - 4 * det)) / 2


@check("psad-q024", unit="MPa")
def psad_q024():
    P, xP = 50e3, 2500.0
    xa, La, Aa, Ea = 1500.0, 1500.0, 500.0, 70e3
    xs, Ls, As, Es = 3000.0, 2000.0, 300.0, 200e3
    # bar rotation phi: deltas = phi*x ; F = k*delta
    ka, ks = Aa * Ea / La, As * Es / Ls
    phi = P * xP / (ka * xa ** 2 + ks * xs ** 2)
    Fs = ks * phi * xs
    return Fs / As


# --------------------------------------------------------------------------- theory of structures
@check("psad-q025", unit="kN·m")
def psad_q025():
    w0, L = 30.0, 6.0
    RA = (0.5 * w0 * L) * (L / 3) / L
    n = 60000
    return max(RA * x - w0 * x ** 3 / (6 * L) for x in (i * L / n for i in range(n + 1)))


@check("psad-q026", unit="mm")
def psad_q026():
    L, w, P, E, I = 7500.0, 18.0, 60e3, 200e3, 350e6  # w N/mm
    return 5 * w * L ** 4 / (384 * E * I) + P * L ** 3 / (48 * E * I)


@check("psad-q027", unit="mm")
def psad_q027():
    L, w, P, a, E, I = 4000.0, 12.0, 15e3, 2500.0, 200e3, 120e6
    EI = E * I
    d_w = w * L ** 4 / (8 * EI)
    d_a = P * a ** 3 / (3 * EI)
    slope_a = P * a ** 2 / (2 * EI)
    return d_w + d_a + slope_a * (L - a)


@check("psad-q028", unit="kN")
def psad_q028():
    panel, h, load = 3.0, 4.0, 20.0
    R = 5 * load / 2
    # moments about L3 (x = 9) of left free body; F_top in compression
    M = R * 3 * panel - load * (2 * panel) - load * panel
    return M / h


@check("psad-q029", unit="kN·m")
def psad_q029():
    w, L = 24.0, 6.0
    RB = 3 * w * L / 8
    n = 60000
    return max(RB * x - w * x ** 2 / 2 for x in (i * L / n for i in range(n + 1)))


@check("psad-q030", unit="kN")
def psad_q030():
    w, L1, L2 = 20.0, 6.0, 4.0
    MB = -(w * L1 ** 3 + w * L2 ** 3) / 4 / (2 * (L1 + L2))
    # span AB: moments about A -> shear at B (left)
    VB1 = (w * L1 * L1 / 2 - MB) / L1
    VB2 = (w * L2 * L2 / 2 - MB) / L2
    return VB1 + VB2


# --------------------------------------------------------------------------- reinforced concrete
@check("psad-q031", unit="mm")
def psad_q031():
    b, As, fc, fy, beta1 = 250.0, 1500.0, 35.0, 415.0, 0.80
    return As * fy / (0.85 * fc * beta1 * b)


@check("psad-q032", unit="mm²")
def psad_q032():
    b, d, fc, fy, beta1 = 300.0, 520.0, 28.0, 420.0, 0.85
    c = d * 0.003 / (0.003 + 0.005)
    return 0.85 * fc * beta1 * c * b / fy


@check("psad-q033", unit="kN·m")
def psad_q033():
    b, d, fc, fy, Es, beta1 = 300.0, 450.0, 21.0, 415.0, 200e3, 0.85
    As = 4 * math.pi * 28.0 ** 2 / 4
    a = As * fy / (0.85 * fc * b)
    c = a / beta1
    et = 0.003 * (d - c) / c
    ey = fy / Es
    assert et > ey
    if et >= 0.005:
        phi = 0.90
    else:
        phi = 0.65 + 0.25 * (et - ey) / (0.005 - ey)
    return phi * As * fy * (d - a / 2) / 1e6


@check("psad-q034", unit="kN")
def psad_q034():
    fc, bw, d, lam = 28.0, 300.0, 500.0, 1.0
    return 0.17 * lam * fc ** 0.5 * bw * d / 1e3


@check("psad-q035", unit="mm")
def psad_q035():
    bw, d, Vu, fc, phi, fyt = 300.0, 450.0, 220e3, 21.0, 0.75, 275.0
    Vc = 0.17 * fc ** 0.5 * bw * d
    Vs = Vu / phi - Vc
    Av = 2 * math.pi * 10.0 ** 2 / 4
    return Av * fyt * d / Vs


@check("psad-q036", unit="kN")
def psad_q036():
    Ag = 400.0 * 400.0
    Ast = 8 * math.pi * 25.0 ** 2 / 4
    fc, fy = 28.0, 420.0
    Po = 0.85 * fc * (Ag - Ast) + fy * Ast
    return 0.65 * 0.80 * Po / 1e3


@check("psad-q037", unit="kN")
def psad_q037():
    col, D, Lv, B, d = 0.4, 800.0, 500.0, 2.6, 0.5
    qu = (1.2 * D + 1.6 * Lv) / (B * B)
    edge_strip = B / 2 - (col / 2 + d)
    return qu * B * edge_strip


# --------------------------------------------------------------------------- prestressed concrete
@check("psad-q038", unit="MPa")
def psad_q038():
    b, h, P, e = 300.0, 600.0, 1000e3, 150.0
    A = b * h
    I = b * h ** 3 / 12
    return P / A + P * e * (h / 2) / I


@check("psad-q039", unit="MPa")
def psad_q039():
    L, b, h, e, Pe, wsd, gamma = 12000.0, 400.0, 800.0, 250.0, 1600e3, 15.0, 24e-6  # N/mm3
    A = b * h
    I = b * h ** 3 / 12
    w = wsd + gamma * A  # N/mm
    M = w * L ** 2 / 8
    yb = h / 2
    return Pe / A + Pe * e * yb / I - M * yb / I


@check("psad-q040", unit="kN")
def psad_q040():
    L, b, h, e, wsd, gamma = 10000.0, 350.0, 700.0, 200.0, 20.0, 24e-6
    A = b * h
    I = b * h ** 3 / 12
    yb = h / 2
    M = (wsd + gamma * A) * L ** 2 / 8
    # P/A + P e yb / I = M yb / I
    return (M * yb / I) / (1 / A + e * yb / I) / 1e3


@check("psad-q041", unit="kN")
def psad_q041():
    L, sag, w = 14.0, 0.28, 18.0
    return w * L ** 2 / (8 * sag)


# --------------------------------------------------------------------------- steel
@check("psad-q042", unit="kN")
def psad_q042():
    W, t, hole, Fy, Fu = 220.0, 14.0, 23.0, 248.0, 400.0
    yield_ = 0.90 * Fy * W * t
    rupture = 0.75 * Fu * (W - 2 * hole) * t
    return min(yield_, rupture) / 1e3


@check("psad-q043", unit="kN")
def psad_q043():
    W, t, dh, s, g, Fy, Fu = 300.0, 12.0, 24.0, 50.0, 75.0, 345.0, 450.0
    paths = [
        W - 2 * dh,                          # straight through outer holes
        W - 3 * dh + 2 * s ** 2 / (4 * g),   # zigzag through all three
        W - 2 * dh + s ** 2 / (4 * g),       # outer -> middle -> edge
        W - dh,                              # middle hole alone
    ]
    An = min(paths) * t
    return min(0.90 * Fy * W * t, 0.75 * Fu * An) / 1e3


@check("psad-q044", unit="kN", tol=0.005)
def psad_q044():
    L, K, rx, ry, A, Fy, E = 4500.0, 1.0, 110.0, 64.0, 9300.0, 345.0, 200e3
    slender = max(K * L / rx, K * L / ry)
    Fe = math.pi ** 2 * E / slender ** 2
    if slender <= 4.71 * math.sqrt(E / Fy):
        Fcr = 0.658 ** (Fy / Fe) * Fy
    else:
        Fcr = 0.877 * Fe
    return 0.90 * Fcr * A / 1e3


@check("psad-q045", unit="kN/m")
def psad_q045():
    L, Zx, Fy, D = 8.0, 1.20e6, 345.0, 10.0
    phiMn = 0.90 * Fy * Zx / 1e6  # kN*m
    wu = 8 * phiMn / L ** 2
    return (wu - 1.2 * D) / 1.6


@check("psad-q046", unit="kN")
def psad_q046():
    n, d, Fnv, phi = 4, 20.0, 372.0, 0.75
    return phi * Fnv * (math.pi * d * d / 4) * n / 1e3


@check("psad-q047", unit="kN", tol=0.005)
def psad_q047():
    leg, length, FEXX, phi = 8.0, 2 * 150.0, 485.0, 0.75
    throat = 0.707 * leg
    return phi * 0.60 * FEXX * throat * length / 1e3


# --------------------------------------------------------------------------- timber
@check("psad-q048", unit="kN/m")
def psad_q048():
    b, d, L, Fb, Fv = 150.0, 300.0, 3600.0, 10.0, 0.80
    I = b * d ** 3 / 12
    w_bend = Fb * I / (d / 2) * 8 / L ** 2       # N/mm = kN/m
    w_shear = (Fv * 2 * b * d / 3) * 2 / L        # N/mm
    return min(w_bend, w_shear)


@check("psad-q049", unit="kN")
def psad_q049():
    b1, b2, Le, Fc, E = 150.0, 200.0, 4000.0, 11.0, 9000.0
    dmin = min(b1, b2)
    ratio = Le / dmin
    K = 0.671 * math.sqrt(E / Fc)
    if ratio <= 11:
        Fcp = Fc
    elif ratio <= K:
        Fcp = Fc * (1 - (ratio / K) ** 4 / 3)
    else:
        assert ratio <= 50
        Fcp = 0.30 * E / ratio ** 2
    return Fcp * b1 * b2 / 1e3


@check("psad-q050", unit="m")
def psad_q050():
    b, d, spacing, q, E, Fb = 50.0, 200.0, 400.0, 4.8e-3, 10000.0, 12.0  # q in N/mm2
    w = q * spacing  # N/mm
    I = b * d ** 3 / 12
    L_bend = math.sqrt(8 * Fb * I / (d / 2) / w)
    L_defl = (384 * E * I / (5 * 360 * w)) ** (1 / 3)
    return min(L_bend, L_defl) / 1000
