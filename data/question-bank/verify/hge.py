"""
Independent recomputations for the HGE question bank
(Hydraulics and Principles of Geotechnical Engineering).

Every function re-types the givens from the question stem and returns the
answer in the unit declared on its @check decorator.
"""
import math

from harness import check, deg, G, GAMMA_W


# ----------------------------------------------------------------- Hydrostatics
@check("hge-q001", unit="kPa")
def hge_q001():
    sg_oil, h_oil, h_w = 0.85, 2.5, 1.5
    return sg_oil * GAMMA_W * h_oil + GAMMA_W * h_w


@check("hge-q002", unit="kPa")
def hge_q002():
    h_water, h_hg, sg_hg = 0.40, 0.25, 13.6
    # p_A + gw*0.40 - sg*gw*0.25 = 0
    return sg_hg * GAMMA_W * h_hg - GAMMA_W * h_water


@check("hge-q003", unit="kN")
def hge_q003():
    b, h, top = 2.0, 3.0, 1.5
    return GAMMA_W * (top + h / 2) * (b * h)


@check("hge-q004", unit="kN")
def hge_q004():
    b, L, theta, h_hinge = 1.5, 2.4, deg(60), 1.2
    y_top = h_hinge / math.sin(theta)
    y_bar = y_top + L / 2
    A = b * L
    F = GAMMA_W * (y_bar * math.sin(theta)) * A
    Ig = b * L ** 3 / 12
    e = Ig / (A * y_bar)
    return F * (L / 2 + e) / L


@check("hge-q019", unit="kN")
def hge_q019():
    R, w = 2.0, 3.0
    FH = GAMMA_W * (R / 2) * (R * w)
    FV = GAMMA_W * (math.pi * R ** 2 / 4) * w
    return math.hypot(FH, FV)


@check("hge-q020", unit="N")
def hge_q020():
    w_air, w_water, sg_oil = 420.0, 260.0, 0.82
    vol = (w_air - w_water) / (GAMMA_W * 1000)  # m^3
    return w_air - sg_oil * GAMMA_W * 1000 * vol


@check("hge-q021", unit="kN·m")
def hge_q021():
    L, B, W, KG, heel = 12.0, 6.0, 1400.0, 1.80, deg(4)
    Vd = W / GAMMA_W
    D = Vd / (L * B)
    I = L * B ** 3 / 12
    GM = D / 2 + I / Vd - KG
    return W * GM * math.sin(heel)


@check("hge-q022", unit="rpm")
def hge_q022():
    D, H_tank, depth = 0.80, 1.50, 1.10
    r = D / 2
    h_par = 2 * (H_tank - depth)
    assert depth - h_par / 2 > 0  # bottom not exposed
    omega = math.sqrt(2 * G * h_par) / r
    return omega * 60 / (2 * math.pi)


@check("hge-q023", unit="")
def hge_q023():
    top, base, H, h, gc = 2.0, 8.0, 12.0, 11.0, 23.5
    # take moments about the toe (x measured from the toe)
    W1 = top * H * gc
    x1 = base - top / 2
    W2 = 0.5 * (base - top) * H * gc
    x2 = (base - top) * 2 / 3  # triangle centroid measured from the toe
    MR = W1 * x1 + W2 * x2
    P = 0.5 * GAMMA_W * h ** 2
    U = 0.5 * GAMMA_W * h * base
    MO = P * h / 3 + U * (2 * base / 3)
    return MR / MO


# ----------------------------------------------------------------- Fluid properties
@check("hge-q016", unit="mm")
def hge_q016():
    d, sigma, theta = 0.002, 0.0728, 0.0
    return 4 * sigma * math.cos(theta) / (GAMMA_W * 1000 * d) * 1000


@check("hge-q017", unit="cSt")
def hge_q017():
    mu, sg = 0.048, 0.92
    return mu / (sg * 1000) / 1e-6


@check("hge-q018", unit="m/s")
def hge_q018():
    a, b, W, ang, t, mu = 0.50, 0.80, 120.0, deg(20), 0.0012, 0.15
    return W * math.sin(ang) * t / (mu * a * b)


# ----------------------------------------------------------------- Pipe flow
@check("hge-q005", unit="m/s")
def hge_q005():
    D1, D2, V1 = 0.300, 0.150, 1.2
    return V1 * (math.pi * D1 ** 2 / 4) / (math.pi * D2 ** 2 / 4)


@check("hge-q006", unit="kPa")
def hge_q006():
    D1, D2, Q, p1 = 0.30, 0.15, 0.10, 150.0
    V1 = Q / (math.pi * D1 ** 2 / 4)
    V2 = Q / (math.pi * D2 ** 2 / 4)
    return p1 + GAMMA_W * (V1 ** 2 - V2 ** 2) / (2 * G)


@check("hge-q007", unit="m")
def hge_q007():
    Q, L, D, f = 0.06, 800.0, 0.25, 0.02
    V = Q / (math.pi * D ** 2 / 4)
    return f * L / D * V ** 2 / (2 * G)


@check("hge-q008", unit="m3/s")
def hge_q008():
    D, L, f, H = 0.30, 400.0, 0.02, 30.0
    V = math.sqrt(2 * G * H / (1 + f * L / D))
    return math.pi * D ** 2 / 4 * V


@check("hge-q024", unit="L/s")
def hge_q024():
    L1, D1, f1 = 600.0, 0.30, 0.020
    L2, D2, f2 = 800.0, 0.20, 0.025
    Q = 0.20
    k1 = 8 * f1 * L1 / (math.pi ** 2 * G * D1 ** 5)
    k2 = 8 * f2 * L2 / (math.pi ** 2 * G * D2 ** 5)
    # solve k1 Q1^2 = k2 Q2^2 with Q1 + Q2 = Q by bisection on Q2
    lo, hi = 0.0, Q
    for _ in range(200):
        q2 = (lo + hi) / 2
        if k2 * q2 ** 2 > k1 * (Q - q2) ** 2:
            hi = q2
        else:
            lo = q2
    return q2 * 1000


@check("hge-q025", unit="L/s")
def hge_q025():
    d, H, Cc, Cv = 0.050, 4.0, 0.62, 0.98
    return Cc * Cv * math.pi * d ** 2 / 4 * math.sqrt(2 * G * H) * 1000


@check("hge-q026", unit="m3/s")
def hge_q026():
    L, n, H = 2.5, 2, 0.40
    return 1.84 * (L - 0.1 * n * H) * H ** 1.5


@check("hge-q027", unit="kN")
def hge_q027():
    D, V, rho = 0.075, 20.0, 1000.0
    Q = math.pi * D ** 2 / 4 * V
    return rho * Q * V / 1000


@check("hge-q028", unit="kW")
def hge_q028():
    Q, z1, z2, hL, eta = 0.12, 100.0, 145.0, 6.5, 0.78
    return GAMMA_W * Q * (z2 - z1 + hL) / eta


# ----------------------------------------------------------------- Open channels
@check("hge-q029", unit="m3/s")
def hge_q029():
    b, z, y, n, S = 3.0, 1.5, 1.2, 0.015, 0.0008
    A = b * y + z * y ** 2
    Pw = b + 2 * y * math.sqrt(1 + z ** 2)
    return A * (A / Pw) ** (2 / 3) * math.sqrt(S) / n


@check("hge-q030", unit="m")
def hge_q030():
    Q, n, S = 3.0, 0.013, 0.001

    def q_of(y):
        b = 2 * y
        A, Pw = b * y, b + 2 * y
        return A * (A / Pw) ** (2 / 3) * math.sqrt(S) / n

    lo, hi = 0.01, 10.0
    for _ in range(200):
        mid = (lo + hi) / 2
        if q_of(mid) > Q:
            hi = mid
        else:
            lo = mid
    return 2 * mid


@check("hge-q031", unit="m")
def hge_q031():
    b, Q = 4.0, 12.0
    return ((Q / b) ** 2 / G) ** (1 / 3)


@check("hge-q032", unit="m")
def hge_q032():
    b, Q, y1 = 3.0, 15.0, 0.50
    q = Q / b
    Fr1 = (q / y1) / math.sqrt(G * y1)
    y2 = y1 / 2 * (math.sqrt(1 + 8 * Fr1 ** 2) - 1)
    E1 = y1 + (q / y1) ** 2 / (2 * G)
    E2 = y2 + (q / y2) ** 2 / (2 * G)
    return E1 - E2


# ----------------------------------------------------------------- Soil properties
@check("hge-q009", unit="")
def hge_q009():
    e = 0.65
    return e / (1 + e)


@check("hge-q010", unit="kN/m3")
def hge_q010():
    w, Gs, S = 0.18, 2.70, 0.80
    e = w * Gs / S
    return (Gs + S * e) * GAMMA_W / (1 + e)


@check("hge-q011", unit="%")
def hge_q011():
    gamma, w, Gs = 18.5, 0.15, 2.68
    gd = gamma / (1 + w)
    e = Gs * GAMMA_W / gd - 1
    return w * Gs / e * 100


@check("hge-q033", unit="")
def hge_q033():
    LL, PL, m_wet, m_dry = 48.0, 22.0, 182.4, 139.0
    w = (m_wet - m_dry) / m_dry * 100
    return (w - PL) / (LL - PL)


@check("hge-q034", unit="%")
def hge_q034():
    V, m, w, gd_max = 950e-6, 1.89, 0.115, 18.6
    gamma = m * G / V / 1000
    return gamma / (1 + w) / gd_max * 100


@check("hge-q035", unit="%")
def hge_q035():
    emax, emin, Gs, gd = 0.85, 0.45, 2.66, 16.2
    e = Gs * GAMMA_W / gd - 1
    return (emax - e) / (emax - emin) * 100


# ----------------------------------------------------------------- Seepage
@check("hge-q036", unit="cm/s")
def hge_q036():
    L, D, h, V, t = 25.0, 10.0, 60.0, 450.0, 3 * 60.0  # cm, cm, cm, cm^3, s
    A = math.pi * D ** 2 / 4
    return V * L / (A * h * t)


@check("hge-q037", unit="1e-6 m/s")
def hge_q037():
    L, A, a, h1, h2, t = 15.0, 30.0, 1.2, 90.0, 45.0, 8 * 60.0
    k_cm_s = a * L / (A * t) * math.log(h1 / h2)
    return k_cm_s / 100 / 1e-6


@check("hge-q038", unit="m3/day")
def hge_q038():
    Nf, Nd, H, k, length = 4, 12, 6.0, 2.5e-5, 30.0
    return k * H * Nf / Nd * length * 86400


@check("hge-q039", unit="kPa")
def hge_q039():
    z, gsat, dh = 2.0, 19.8, 1.4
    # ponded water above the sand adds equally to sigma and u, so measure from the sand surface
    sigma = gsat * z
    u = GAMMA_W * (z + dh)  # piezometric level at the base is dh above the ponded surface
    return sigma - u


# ----------------------------------------------------------------- Stresses in soil
@check("hge-q012", unit="kPa")
def hge_q012():
    sigma = 17 * 3 + 19 * (8 - 3)
    u = GAMMA_W * (8 - 3)
    return sigma - u


@check("hge-q013", unit="kPa")
def hge_q013():
    gsat, gm, z, wt = 19.5, 17.5, 6.0, 2.0
    before = gsat * z - GAMMA_W * z
    after = gm * wt + gsat * (z - wt) - GAMMA_W * (z - wt)
    return after - before


@check("hge-q040", unit="kPa")
def hge_q040():
    B, L, Q, z = 2.0, 2.0, 800.0, 3.0
    return Q / ((B + z) * (L + z))


@check("hge-q041", unit="kPa")
def hge_q041():
    Q, z, r = 500.0, 4.0, 3.0
    R = math.hypot(r, z)
    return 3 * Q * z ** 3 / (2 * math.pi * R ** 5)


# ----------------------------------------------------------------- Consolidation
@check("hge-q015", unit="mm")
def hge_q015():
    s0 = 17 * 2 + (19 - GAMMA_W) * 3 + (18.5 - GAMMA_W) * 2
    Cc, H, e0, dsig = 0.35, 4.0, 1.10, 60.0
    return Cc * H / (1 + e0) * math.log10((s0 + dsig) / s0) * 1000


@check("hge-q042", unit="days")
def hge_q042():
    lab_thk, t_lab_min, field_thk = 0.025, 4.5, 5.0
    Hdr_lab = lab_thk / 2  # double drainage
    Hdr_field = field_thk  # single drainage
    return t_lab_min * (Hdr_field / Hdr_lab) ** 2 / (60 * 24)


@check("hge-q043", unit="mm")
def hge_q043():
    H, gsat, e0, Cc, Cs, sc, dsig = 5.0, 17.8, 0.95, 0.40, 0.06, 120.0, 80.0
    s0 = 18 * 3.0 + (gsat - GAMMA_W) * H / 2
    sf = s0 + dsig
    assert s0 < sc < sf
    S = Cs * H / (1 + e0) * math.log10(sc / s0) + Cc * H / (1 + e0) * math.log10(sf / sc)
    return S * 1000


# ----------------------------------------------------------------- Shear strength
@check("hge-q014", unit="deg")
def hge_q014():
    s3, dev = 100.0, 180.0
    s1 = s3 + dev
    return math.degrees(math.asin((s1 - s3) / (s1 + s3)))


@check("hge-q044", unit="deg")
def hge_q044():
    area = 0.060 * 0.060
    s1, t1 = 360 / area / 1000, 270 / area / 1000
    s2, t2 = 720 / area / 1000, 420 / area / 1000
    return math.degrees(math.atan2(t2 - t1, s2 - s1))


@check("hge-q045", unit="kPa")
def hge_q045():
    c, phi, s3 = 12.0, deg(30), 150.0
    # Mohr circle tangent to tau = c + sigma tan(phi): radius = (centre + c cot phi) sin phi
    # => s1 - s3 = 2 sin(phi) (s3 + c cot phi) / (1 - sin phi)
    return 2 * math.sin(phi) * (s3 + c / math.tan(phi)) / (1 - math.sin(phi))


# ----------------------------------------------------------------- Foundations
@check("hge-q046", unit="kN/m")
def hge_q046():
    B, Df, gamma, c = 1.5, 1.2, 18.0, 15.0
    Nc, Nq, Ng, FS = 25.13, 12.72, 8.34, 3.0
    qu = c * Nc + gamma * Df * Nq + 0.5 * gamma * B * Ng
    return qu / FS * B


@check("hge-q047", unit="kN")
def hge_q047():
    B, Df, dw, gm, gsat = 2.0, 1.5, 1.0, 17.5, 20.0
    Nq, Ng, FS = 28.52, 26.87, 3.0
    q = gm * dw + (gsat - GAMMA_W) * (Df - dw)
    qu = q * Nq + 0.4 * (gsat - GAMMA_W) * B * Ng
    return qu / FS * B * B


@check("hge-q048", unit="kN/m")
def hge_q048():
    H, gamma, phi, qs = 6.0, 18.0, deg(32), 15.0
    Ka = (1 - math.sin(phi)) / (1 + math.sin(phi))  # equivalent to tan^2(45 - phi/2)
    return Ka * qs * H + 0.5 * Ka * gamma * H ** 2


@check("hge-q049", unit="kN")
def hge_q049():
    D, L, cu, alpha, Nc, FS = 0.40, 15.0, 50.0, 0.75, 9.0, 2.5
    Qs = alpha * cu * math.pi * D * L
    Qb = Nc * cu * math.pi * D ** 2 / 4
    return (Qs + Qb) / FS


@check("hge-q050", unit="")
def hge_q050():
    beta, H, c, phi, gsat = deg(25), 3.0, 8.0, deg(30), 19.5
    # forces on a slice of unit plan width: normal stress and pore pressure on the slip plane
    sigma_n = gsat * H * math.cos(beta) ** 2
    tau = gsat * H * math.cos(beta) * math.sin(beta)
    u = GAMMA_W * H * math.cos(beta) ** 2
    return (c + (sigma_n - u) * math.tan(phi)) / tau
