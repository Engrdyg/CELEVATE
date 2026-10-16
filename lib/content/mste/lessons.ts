import type { Lesson } from "@/lib/content/types";

// ============================================================================
// Chapter 1 — Solution of Triangles
// ============================================================================
const solutionOfTriangles: Lesson = {
  id: "mste-l-solution-of-triangles",
  subjectId: "mste",
  chapterId: "mste-ch1",
  title: "Solution of Triangles",
  summary:
    "Right-triangle ratios, the sine and cosine laws, the ambiguous SSA case, triangle areas, and heights-and-distances problems.",
  minutes: 15,
  status: "available",
  topics: ["Right triangles", "Law of sines", "Law of cosines", "Ambiguous case", "Angles of elevation"],
  formulaIds: ["mste-f-sine-law", "mste-f-cosine-law", "mste-f-triangle-area-sas"],
  questionIds: ["mste-q01", "mste-q02", "mste-q03"],
  blocks: [
    { type: "heading", id: "why-triangles", text: "Why triangles show up everywhere" },
    {
      type: "paragraph",
      text: "Almost every problem in surveying and route geometry eventually reduces to a triangle: a baseline across a river, a tower sighted from two stations, a traverse course resolved into components, or the tangent and radius of a highway curve. Solving a triangle means finding all three sides and all three angles from the minimum information given. If you can choose the right law quickly and keep your calculator in degree mode, these become some of the fastest points in the MSTE paper.",
    },
    {
      type: "figure",
      figure: "right-triangle",
      caption: "Right triangle with legs a and b, hypotenuse c, and reference angle θ.",
    },
    {
      type: "paragraph",
      text: String.raw`For a **right triangle**, the basic ratios are enough. With angle $\theta$ opposite leg $a$ and adjacent to leg $b$: $\sin\theta = a/c$, $\cos\theta = b/c$, $\tan\theta = a/b$, and the Pythagorean theorem $c^2 = a^2 + b^2$ ties the sides together. Many oblique-triangle problems can also be split into two right triangles by dropping an altitude, but the sine and cosine laws are usually quicker.`,
    },

    { type: "heading", id: "law-of-sines", text: "The law of sines" },
    {
      type: "paragraph",
      text: String.raw`In any triangle, each side divided by the sine of its opposite angle gives the same ratio (equal to the diameter of the circumscribed circle). Use it whenever you know **a side and its opposite angle** plus one more piece of information: two angles and any side (AAS or ASA), or two sides and an angle opposite one of them (SSA).`,
    },
    {
      type: "math",
      tex: String.raw`\frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C} = 2R_{\text{circ}}`,
      label: "Law of sines",
    },
    {
      type: "callout",
      tone: "warning",
      title: "The ambiguous case (SSA)",
      text: String.raw`When two sides and a non-included angle are given, $\sin B$ comes out of the law of sines, but both $B$ and $180^\circ - B$ have the same sine. For example, with $a = 40$ m, $b = 55$ m and $A = 38^\circ$, $\sin B = 0.8465$ gives $B = 57.84^\circ$ **or** $B = 122.16^\circ$. Both are valid because each leaves a positive third angle, so two different triangles fit the data.`,
    },
    {
      type: "table",
      caption: "Number of triangles in the SSA case (angle A acute, sides a and b given, a opposite A)",
      head: ["Condition", "Result"],
      rows: [
        [String.raw`$a < b\sin A$`, "No triangle (side a cannot reach the base line)"],
        [String.raw`$a = b\sin A$`, "One right triangle"],
        [String.raw`$b\sin A < a < b$`, "Two triangles (ambiguous)"],
        [String.raw`$a \ge b$`, "One triangle"],
      ],
    },

    { type: "heading", id: "law-of-cosines", text: "The law of cosines and triangle area" },
    {
      type: "paragraph",
      text: String.raw`The law of sines fails when you do not know any side–opposite-angle pair. That happens with **two sides and the included angle (SAS)** or **three sides (SSS)**. The law of cosines handles both; it is the Pythagorean theorem with a correction term that vanishes when the angle is $90^\circ$.`,
    },
    {
      type: "math",
      tex: String.raw`c^2 = a^2 + b^2 - 2ab\cos C \qquad\Longleftrightarrow\qquad \cos C = \frac{a^2 + b^2 - c^2}{2ab}`,
      label: "Law of cosines",
    },
    {
      type: "paragraph",
      text: String.raw`Once two sides and their included angle are known, the area follows directly. If only the three sides are known, use Heron's formula with the semi-perimeter $s = (a+b+c)/2$.`,
    },
    {
      type: "math",
      tex: String.raw`A_{\triangle} = \tfrac{1}{2}\,ab\sin C = \sqrt{s(s-a)(s-b)(s-c)}`,
      label: "Area of a triangle",
    },
    {
      type: "example",
      title: "Distance across a river (ASA with the law of sines)",
      problem:
        "Points A and C are on the same bank of a river, 150.00 m apart. Point B is on the opposite bank. The angle BAC is measured as 72° and the angle BCA as 58°. Find the distance AB across the river.",
      given: ["AC = 150.00 m", String.raw`$A = 72^\circ$, $C = 58^\circ$`],
      steps: [
        {
          text: "Find the third angle from the angle sum of a triangle.",
          tex: String.raw`B = 180^\circ - 72^\circ - 58^\circ = 50^\circ`,
        },
        {
          text: String.raw`The side AB is opposite angle $C$; the known side AC is opposite angle $B$. Pair them in the law of sines.`,
          tex: String.raw`\frac{AB}{\sin 58^\circ} = \frac{150.00}{\sin 50^\circ}`,
        },
        {
          text: "Solve for AB.",
          tex: String.raw`AB = \frac{150.00\,\sin 58^\circ}{\sin 50^\circ} = \frac{150.00(0.84805)}{0.76604} = 166.06\text{ m}`,
        },
        {
          text: "As a check, the longest side should face the largest angle. BC (opposite 72°) is the longest at 186.23 m, then AB (opposite 58°), then AC (opposite 50°).",
          tex: String.raw`BC = \frac{150.00\,\sin 72^\circ}{\sin 50^\circ} = 186.23\text{ m}`,
        },
      ],
      answer: "AB ≈ 166.06 m",
    },
    {
      type: "example",
      title: "Third side and area of a triangular lot (SAS)",
      problem:
        "Two boundary lines of a triangular lot measure 85 m and 120 m and meet at an angle of 64°. Find the length of the third side and the area of the lot.",
      steps: [
        {
          text: "Apply the law of cosines with the included angle.",
          tex: String.raw`c^2 = 85^2 + 120^2 - 2(85)(120)\cos 64^\circ = 12\,682.2`,
        },
        {
          text: "Take the square root.",
          tex: String.raw`c = 112.62\text{ m}`,
        },
        {
          text: "Compute the area from two sides and the included angle.",
          tex: String.raw`A = \tfrac{1}{2}(85)(120)\sin 64^\circ = 4583.8\text{ m}^2 \approx 0.458\text{ ha}`,
        },
      ],
      answer: String.raw`Third side ≈ 112.62 m; area ≈ 4,584 m²`,
    },
    { type: "check", questionId: "mste-q01" },
    { type: "check", questionId: "mste-q02" },

    { type: "heading", id: "heights-and-distances", text: "Heights and distances" },
    {
      type: "paragraph",
      text: String.raw`The **angle of elevation** is measured upward from the horizontal to a point above the observer; the **angle of depression** is measured downward to a point below. A classic problem gives two angles of elevation to the top of a tower taken from two points on a straight line toward it, a distance $d$ apart, with $\alpha$ at the farther point and $\beta$ at the nearer point. The triangle formed by the two stations and the top has an angle of $\beta - \alpha$ at the top, so the law of sines gives the slant distance and then the height. Equivalently:`,
    },
    {
      type: "math",
      tex: String.raw`h = \frac{d}{\cot\alpha - \cot\beta} = \frac{d\,\sin\alpha\,\sin\beta}{\sin(\beta - \alpha)}`,
      label: "Height from two angles of elevation",
    },
    {
      type: "callout",
      tone: "exam",
      title: "Calculator discipline",
      text: String.raw`Set the calculator to **degree mode** before the exam starts and convert minutes and seconds properly: $35^\circ 20'$ is $35.3333^\circ$, not $35.20^\circ$. These two slips account for many wrong answers that still look like one of the choices.`,
    },
    { type: "heading", id: "strategy", text: "Choosing the right tool" },
    {
      type: "list",
      items: [
        "Right angle present: use sine, cosine, tangent and the Pythagorean theorem.",
        String.raw`A side and its opposite angle known: use the **law of sines** (watch the SSA ambiguity).`,
        String.raw`Two sides with the included angle, or three sides: use the **law of cosines** first, then switch to the law of sines for the remaining angles.`,
        String.raw`Area needed: $\tfrac{1}{2}ab\sin C$ with SAS data, Heron's formula with SSS data.`,
        "Sanity check: the largest side is always opposite the largest angle, and the angles must sum to 180°.",
      ],
    },
  ],
};

// ============================================================================
// Chapter 2 — Derivatives and Optimization
// ============================================================================
const derivativesOptimization: Lesson = {
  id: "mste-l-derivatives-optimization",
  subjectId: "mste",
  chapterId: "mste-ch2",
  title: "Derivatives and Optimization",
  summary:
    "Differentiation rules, critical points, the first- and second-derivative tests, and a reliable procedure for maxima–minima word problems.",
  minutes: 14,
  status: "available",
  topics: ["Differentiation rules", "Critical points", "Maxima and minima", "Related rates"],
  formulaIds: ["mste-f-critical-point-test"],
  questionIds: ["mste-q04", "mste-q05"],
  blocks: [
    { type: "heading", id: "derivative-review", text: "The derivative as a rate of change" },
    {
      type: "paragraph",
      text: String.raw`The derivative $f'(x)$ is the instantaneous rate of change of $f$ with respect to $x$, and geometrically the slope of the tangent line to $y = f(x)$. In engineering problems it answers questions such as "how fast does the volume change as the depth changes?" or "at what dimension does the cost stop decreasing?". You need a handful of rules at your fingertips.`,
    },
    {
      type: "list",
      items: [
        String.raw`Power rule: $\dfrac{d}{dx}x^n = n x^{n-1}$`,
        String.raw`Product rule: $(uv)' = u'v + uv'$`,
        String.raw`Quotient rule: $\left(\dfrac{u}{v}\right)' = \dfrac{u'v - uv'}{v^2}$`,
        String.raw`Chain rule: $\dfrac{d}{dx}f(g(x)) = f'(g(x))\,g'(x)$`,
        String.raw`Trigonometric: $(\sin x)' = \cos x$, $(\cos x)' = -\sin x$, with $x$ in **radians**`,
        String.raw`Exponential and log: $(e^x)' = e^x$, $(\ln x)' = 1/x$`,
      ],
    },

    { type: "heading", id: "critical-points", text: "Critical points and how to classify them" },
    {
      type: "paragraph",
      text: String.raw`A **critical point** is a value $x_0$ in the domain where $f'(x_0) = 0$ or where $f'$ does not exist. Every interior maximum or minimum of a smooth function occurs at a critical point, so solving $f'(x) = 0$ narrows the search to a few candidates. To classify a candidate, look at the curvature.`,
    },
    {
      type: "math",
      tex: String.raw`f'(x_0) = 0, \quad f''(x_0) < 0 \;\Rightarrow\; \text{maximum}; \qquad f''(x_0) > 0 \;\Rightarrow\; \text{minimum}`,
      label: "Second-derivative test",
    },
    {
      type: "paragraph",
      text: String.raw`If $f''(x_0) = 0$ the second-derivative test is silent; use the **first-derivative test** instead: if $f'$ changes from positive to negative across $x_0$ the point is a maximum, from negative to positive a minimum. A point where $f''$ changes sign is a **point of inflection**, which is where the curve switches from concave up to concave down.`,
    },

    { type: "heading", id: "optimization-procedure", text: "A procedure for maxima–minima problems" },
    {
      type: "paragraph",
      text: "Word problems on maxima and minima are rarely difficult calculus; the derivative is usually a polynomial. What costs time is setting up the objective function correctly. The procedure below keeps you from differentiating the wrong expression, which is the most common way to lose these items.",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Draw a sketch and name every dimension with a variable.",
        "Write the quantity to be maximized or minimized (the objective) in terms of those variables.",
        "Use the constraint (fixed perimeter, fixed volume, fixed material) to eliminate all but one variable.",
        String.raw`Differentiate, set the derivative equal to zero and solve for the critical value(s).`,
        "Keep only values inside the physical domain, confirm max or min, then compute what the question actually asks for.",
      ],
    },
    {
      type: "example",
      title: "Open box from a rectangular sheet",
      problem:
        "An open-top box is to be made from a 60 cm × 40 cm sheet of metal by cutting equal squares of side x from each corner and folding up the sides. Find x for maximum volume and the maximum volume.",
      given: [String.raw`Sheet: 60 cm × 40 cm`, String.raw`Domain: $0 < x < 20$ cm`],
      steps: [
        {
          text: "Write the volume in terms of the single variable x.",
          tex: String.raw`V = x(60 - 2x)(40 - 2x) = 4x^3 - 200x^2 + 2400x`,
        },
        {
          text: "Differentiate and set the derivative to zero.",
          tex: String.raw`\frac{dV}{dx} = 12x^2 - 400x + 2400 = 0`,
        },
        {
          text: "Solve the quadratic.",
          tex: String.raw`x = \frac{400 \pm \sqrt{400^2 - 4(12)(2400)}}{2(12)} = \frac{400 \pm 211.66}{24} = 7.847 \text{ or } 25.49\text{ cm}`,
        },
        {
          text: String.raw`Reject $x = 25.49$ cm because it exceeds half of the 40-cm width. Check the remaining root with the second derivative.`,
          tex: String.raw`\frac{d^2V}{dx^2} = 24x - 400 = 24(7.847) - 400 = -211.7 < 0 \;\Rightarrow\; \text{maximum}`,
        },
        {
          text: "Compute the maximum volume.",
          tex: String.raw`V_{\max} = 7.847(60 - 15.695)(40 - 15.695) \approx 8450\text{ cm}^3`,
        },
      ],
      answer: String.raw`x ≈ 7.85 cm; maximum volume ≈ 8,450 cm³`,
    },
    {
      type: "callout",
      tone: "warning",
      title: "Check the domain and the endpoints",
      text: "A critical point outside the physical range (negative length, a cut larger than the sheet) is meaningless. On a closed interval the absolute maximum or minimum may also occur at an endpoint, so evaluate the objective there as well when the problem allows it.",
    },
    { type: "check", questionId: "mste-q04" },

    { type: "heading", id: "classic-results", text: "Classic results worth remembering" },
    {
      type: "paragraph",
      text: "Several optimization problems recur so often that knowing the answer pattern lets you verify your work in seconds. Derive each one at least once so you trust it.",
    },
    {
      type: "table",
      caption: "Recurring optimization results",
      head: ["Situation", "Optimal shape"],
      rows: [
        ["Rectangle of fixed perimeter, maximum area", "Square"],
        [
          "Rectangular lot fenced on three sides (fourth side along a river), fixed fence length P",
          String.raw`Side parallel to river $= P/2$, each other side $= P/4$`,
        ],
        ["Closed cylinder of fixed volume, minimum surface area", String.raw`Height = diameter ($h = 2r$)`],
        ["Open-top cylinder of fixed volume, minimum surface area", String.raw`Height = radius ($h = r$)`],
        ["Rectangle inscribed in a circle, maximum area", "Square"],
      ],
    },
    {
      type: "paragraph",
      text: String.raw`To see where the river-lot result comes from: with $2x + y = P$, the area is $A = x(P - 2x)$, and $dA/dx = P - 4x = 0$ gives $x = P/4$ and $y = P/2$. The same three-line derivation, done once with symbols, produces every entry in the table and lets you answer a numerical version almost by inspection.`,
    },
    { type: "check", questionId: "mste-q05" },

    { type: "heading", id: "related-rates", text: "Related rates in one paragraph" },
    {
      type: "paragraph",
      text: String.raw`When two quantities linked by an equation both change with time, differentiate the equation with respect to $t$ using the chain rule, then substitute the instantaneous values **after** differentiating. For a circular ripple of radius $r$, $A = \pi r^2$ gives the relation below; if $r = 4$ m and $dr/dt = 0.5$ m/s, the area grows at $2\pi(4)(0.5) = 12.57$ m²/s at that instant.`,
    },
    {
      type: "math",
      tex: String.raw`\frac{dA}{dt} = 2\pi r\,\frac{dr}{dt}`,
      label: "Related rates: expanding circle",
    },
    {
      type: "callout",
      tone: "exam",
      title: "Exam habit",
      text: "Substituting numbers before differentiating turns a variable into a constant and gives a zero rate. Differentiate first, substitute second.",
    },
  ],
};

// ============================================================================
// Chapter 3 — Differential Leveling
// ============================================================================
const differentialLeveling: Lesson = {
  id: "mste-l-differential-leveling",
  subjectId: "mste",
  chapterId: "mste-ch3",
  title: "Differential Leveling",
  summary:
    "Height of instrument, backsights and foresights, reducing a level field book, the arithmetic check, curvature and refraction, and loop closure.",
  minutes: 14,
  status: "available",
  topics: ["Height of instrument", "Turning points", "Field notes", "Curvature and refraction", "Error of closure"],
  formulaIds: ["mste-f-height-of-instrument", "mste-f-curvature-refraction"],
  questionIds: ["mste-q07", "mste-q08"],
  blocks: [
    { type: "heading", id: "principle", text: "The principle of differential leveling" },
    {
      type: "paragraph",
      text: "Differential leveling finds the difference in elevation between two points by reading a graduated rod through a level whose line of sight is horizontal. Because the line of sight is the same for every reading taken from one setup, the instrument acts as a horizontal reference plane. A reading on a point of known elevation fixes the height of that plane; a reading on an unknown point then gives its elevation by subtraction.",
    },
    {
      type: "figure",
      figure: "differential-leveling",
      caption: "One setup: backsight on the benchmark, foresight on the turning point, with the height of instrument (HI) between them.",
    },
    {
      type: "math",
      tex: String.raw`HI = \text{Elev}_{BM} + BS, \qquad \text{Elev}_{TP} = HI - FS`,
      label: "Height of instrument method",
    },
    { type: "heading", id: "terms", text: "Terms you must use precisely" },
    {
      type: "list",
      items: [
        String.raw`**Benchmark (BM):** a permanent point of known elevation.`,
        String.raw`**Turning point (TP):** a temporary, stable point on which both a foresight and a backsight are taken so the level can be moved forward.`,
        String.raw`**Backsight (BS):** reading on a point of known elevation; it is a **plus** sight because it is added to get HI.`,
        String.raw`**Foresight (FS):** reading on a point whose elevation is to be found; it is a **minus** sight.`,
        String.raw`**Height of instrument (HI):** elevation of the line of sight, not the height of the tripod above the ground.`,
        String.raw`**Intermediate foresight (IFS):** a foresight on a point that is not used as a turning point, such as a profile station.`,
      ],
    },

    { type: "heading", id: "field-book", text: "Reducing a level field book" },
    {
      type: "paragraph",
      text: "Field notes are kept in a five-column table: station, BS, HI, FS and elevation. Work row by row. Each new HI is the previous elevation plus the backsight; each new elevation is the current HI minus the foresight. Every turning point therefore has both a foresight (closing the old setup) and a backsight (opening the new one).",
    },
    {
      type: "table",
      caption: "Level notes from BM-1 (elevation 45.250 m) to BM-2",
      head: ["Station", "BS (m)", "HI (m)", "FS (m)", "Elevation (m)"],
      rows: [
        ["BM-1", "1.234", "46.484", "", "45.250"],
        ["TP-1", "0.982", "44.899", "2.567", "43.917"],
        ["TP-2", "2.115", "45.138", "1.876", "43.023"],
        ["BM-2", "", "", "0.743", "44.395"],
        [String.raw`**Sum**`, "4.331", "", "5.186", ""],
      ],
    },
    {
      type: "example",
      title: "Reducing the notes and checking the arithmetic",
      problem:
        "Using the field notes in the table above, compute the elevation of BM-2 and verify the reduction with the arithmetic check.",
      given: ["Elevation of BM-1 = 45.250 m", "BS: 1.234, 0.982, 2.115 m", "FS: 2.567, 1.876, 0.743 m"],
      steps: [
        {
          text: "First setup: HI from the backsight on BM-1, then the elevation of TP-1.",
          tex: String.raw`HI_1 = 45.250 + 1.234 = 46.484, \quad \text{Elev}_{TP1} = 46.484 - 2.567 = 43.917\text{ m}`,
        },
        {
          text: "Second setup: backsight on TP-1, foresight on TP-2.",
          tex: String.raw`HI_2 = 43.917 + 0.982 = 44.899, \quad \text{Elev}_{TP2} = 44.899 - 1.876 = 43.023\text{ m}`,
        },
        {
          text: "Third setup: backsight on TP-2, foresight on BM-2.",
          tex: String.raw`HI_3 = 43.023 + 2.115 = 45.138, \quad \text{Elev}_{BM2} = 45.138 - 0.743 = 44.395\text{ m}`,
        },
        {
          text: "Arithmetic check: the total change in elevation must equal the sum of backsights minus the sum of foresights.",
          tex: String.raw`\textstyle\sum BS - \sum FS = 4.331 - 5.186 = -0.855 = 44.395 - 45.250 \;\checkmark`,
        },
      ],
      answer: "Elevation of BM-2 = 44.395 m (BM-2 is 0.855 m lower than BM-1)",
    },
    {
      type: "math",
      tex: String.raw`\text{Elev}_{\text{end}} = \text{Elev}_{\text{start}} + \textstyle\sum BS - \sum FS`,
      label: "Arithmetic check",
    },
    {
      type: "callout",
      tone: "tip",
      title: "Balance your sight distances",
      text: "Keeping each backsight and foresight distance roughly equal cancels the error from a line of sight that is not perfectly horizontal (collimation error) and most of the curvature and refraction effect, because the same error appears in both readings and drops out in the difference.",
    },
    { type: "check", questionId: "mste-q07" },

    { type: "heading", id: "curvature-refraction", text: "Curvature and refraction" },
    {
      type: "paragraph",
      text: String.raw`A horizontal line of sight is tangent to the level surface at the instrument, so it rises above that surface with distance; this **curvature** effect makes the rod reading too large. Atmospheric **refraction** bends the ray slightly back toward the Earth and reduces the error by roughly one seventh. The combined correction, with $K$ in kilometers, is:`,
    },
    {
      type: "math",
      tex: String.raw`h_c = 0.0785K^2, \qquad h_r = 0.0110K^2, \qquad h_{cr} = h_c - h_r = 0.0675K^2\ \text{(m)}`,
      label: "Curvature and refraction",
    },
    {
      type: "paragraph",
      text: String.raw`For ordinary sights of 50 to 100 m the effect is well under a millimeter, which is why it is ignored in routine leveling. It matters in long sights, reciprocal leveling across rivers, and in problems that ask how far away an object of a given height is visible. For example, at $K = 2$ km, $h_{cr} = 0.0675(2)^2 = 0.270$ m.`,
    },
    { type: "check", questionId: "mste-q08" },

    {
      type: "paragraph",
      text: "Beyond curvature and refraction, leveling errors fall into three familiar groups. Knowing which ones cancel by procedure and which ones accumulate helps with both field work and the conceptual items in the exam.",
    },
    {
      type: "list",
      items: [
        String.raw`**Instrumental:** line of sight not parallel to the level tube (collimation), rod not of standard length, worn rod joints. Balanced sights remove the first.`,
        String.raw`**Natural:** heat shimmer, wind, settlement of the tripod or turning point between the foresight and the next backsight.`,
        String.raw`**Personal:** rod not held plumb (the reading is always too large), misreading the decimeter mark, bubble not centered at the moment of reading, recording errors.`,
      ],
    },
    { type: "heading", id: "closure", text: "Error of closure and its adjustment" },
    {
      type: "paragraph",
      text: String.raw`A level circuit that returns to its starting benchmark, or ends on a second benchmark of known elevation, reveals its **error of closure**: the computed elevation minus the known elevation. If the error is within the allowable limit for the order of accuracy specified for the job, it is distributed among the turning points, usually in proportion to the distance from the start (or equally per setup when sights are similar in length). For instance, a closure error of $+0.024$ m over four equal setups gives corrections of $-0.006$, $-0.012$, $-0.018$ and $-0.024$ m to the successive points.`,
    },
    {
      type: "callout",
      tone: "exam",
      title: "Signs make or break leveling problems",
      text: String.raw`Backsights are always **added** and foresights are always **subtracted**, regardless of whether the ground goes up or down. If the computed elevation of a point is above the HI, you have swapped a sign.`,
    },
  ],
};

// ============================================================================
// Chapter 4 — Horizontal Simple Curves
// ============================================================================
const horizontalSimpleCurves: Lesson = {
  id: "mste-l-horizontal-simple-curves",
  subjectId: "mste",
  chapterId: "mste-ch4",
  title: "Horizontal Simple Curves",
  summary:
    "Elements of a simple circular curve, degree of curve on the 20-m arc basis, stationing of PC and PT, and deflection angles for layout.",
  minutes: 15,
  status: "available",
  topics: ["Curve elements", "Degree of curve", "Stationing", "Deflection angles"],
  formulaIds: [
    "mste-f-degree-of-curve-arc",
    "mste-f-tangent-distance",
    "mste-f-length-of-curve",
    "mste-f-curve-ordinates-chord",
  ],
  questionIds: ["mste-q11", "mste-q12"],
  blocks: [
    { type: "heading", id: "elements", text: "Elements of a simple curve" },
    {
      type: "paragraph",
      text: String.raw`A **simple curve** is a single circular arc joining two straight tangents of a highway or railway alignment. The tangents meet at the point of intersection (PI). The curve begins at the point of curvature (PC) and ends at the point of tangency (PT). The angle by which the alignment changes direction, the **intersection angle** $I$, is equal to the central angle subtended by the arc, because the radii at PC and PT are perpendicular to the tangents.`,
    },
    {
      type: "figure",
      figure: "simple-curve",
      caption: "Simple circular curve showing PC, PI, PT, radius R, central angle I, tangent T, external E, middle ordinate M and length L.",
    },
    {
      type: "table",
      caption: "Simple curve elements",
      head: ["Element", "Meaning", "Formula"],
      rows: [
        ["Tangent distance, T", "PI to PC, or PI to PT", String.raw`$T = R\tan(I/2)$`],
        ["Length of curve, L", "Arc length PC to PT", String.raw`$L = \pi R I/180^\circ$`],
        ["Long chord, C", "Straight distance PC to PT", String.raw`$C = 2R\sin(I/2)$`],
        ["External distance, E", "PI to midpoint of the arc", String.raw`$E = R[\sec(I/2) - 1]$`],
        ["Middle ordinate, M", "Midpoint of arc to midpoint of long chord", String.raw`$M = R[1 - \cos(I/2)]$`],
      ],
    },

    { type: "heading", id: "degree-of-curve", text: "Degree of curve (arc basis)" },
    {
      type: "paragraph",
      text: String.raw`Sharpness of a curve is often expressed by its **degree of curve** $D$. On the arc basis used in Philippine practice with metric stations, $D$ is the central angle subtended by a **20-m arc**. Since arc length is proportional to central angle, $D/20 = 360^\circ/(2\pi R)$, which gives the constant 1145.916. A larger degree of curve means a smaller radius and a sharper curve.`,
    },
    {
      type: "math",
      tex: String.raw`D = \frac{20(360^\circ)}{2\pi R} = \frac{1145.916}{R}, \qquad L = \frac{20\,I}{D}`,
      label: "Degree of curve and length of curve (arc basis)",
    },
    {
      type: "callout",
      tone: "warning",
      title: "Arc basis versus chord basis",
      text: String.raw`On the **chord basis**, $D$ is subtended by a 20-m chord, so $\sin(D/2) = 10/R$. For a $4^\circ$ curve, the arc basis gives $R = 286.48$ m while the chord basis gives $R = 286.54$ m. The values are close, which is exactly why a wrong definition can land on a distractor. Use the arc basis unless the problem states otherwise.`,
    },

    { type: "heading", id: "stationing", text: "Stationing the PC and PT" },
    {
      type: "paragraph",
      text: String.raw`Stations are written as kilometers plus meters, so 2+450.00 means 2,450.00 m from the origin of the line. The PC is found by going back from the PI by the tangent distance. The PT, however, is reached by travelling **along the curve**, so its station is the PC station plus the arc length, never the PI station plus $T$. Because the arc is shorter than the two tangents combined ($L < 2T$), the PT station is always less than PI + T.`,
    },
    {
      type: "math",
      tex: String.raw`\text{Sta. PC} = \text{Sta. PI} - T, \qquad \text{Sta. PT} = \text{Sta. PC} + L`,
      label: "Stationing",
    },
    {
      type: "example",
      title: "Complete computation of a simple curve",
      problem:
        "Two tangents intersect at station 2+450.00 with an intersection angle of 40°. A 5° simple curve (arc basis, 20-m arc) is to connect them. Compute R, T, L, E, M, C and the stations of the PC and PT.",
      given: [String.raw`$I = 40^\circ$, $D = 5^\circ$`, "Sta. PI = 2+450.00"],
      steps: [
        {
          text: "Radius from the degree of curve.",
          tex: String.raw`R = \frac{1145.916}{5} = 229.183\text{ m}`,
        },
        {
          text: "Tangent distance and length of curve.",
          tex: String.raw`T = 229.183\tan 20^\circ = 83.416\text{ m}, \qquad L = \frac{20(40)}{5} = 160.000\text{ m}`,
        },
        {
          text: "External distance, middle ordinate and long chord.",
          tex: String.raw`E = 229.183(\sec 20^\circ - 1) = 14.708, \quad M = 229.183(1 - \cos 20^\circ) = 13.821, \quad C = 2(229.183)\sin 20^\circ = 156.771\text{ m}`,
        },
        {
          text: "Station of the PC.",
          tex: String.raw`\text{Sta. PC} = 2450.000 - 83.416 = 2366.584 \;\Rightarrow\; 2{+}366.584`,
        },
        {
          text: "Station of the PT, measured along the curve.",
          tex: String.raw`\text{Sta. PT} = 2366.584 + 160.000 = 2526.584 \;\Rightarrow\; 2{+}526.584`,
        },
      ],
      answer: "R = 229.18 m, T = 83.42 m, L = 160.00 m, E = 14.71 m, M = 13.82 m, C = 156.77 m; PC at 2+366.584, PT at 2+526.584",
    },
    {
      type: "paragraph",
      text: String.raw`Problems are often stated in reverse: a building near the PI must be cleared, so the external distance is fixed and the radius is unknown. Rearranging gives $R = E/[\sec(I/2) - 1]$. For instance, with $I = 40^\circ$ and a required $E = 15$ m, $R = 15/(\sec 20^\circ - 1) = 233.73$ m, which corresponds to $D = 1145.916/233.73 \approx 4.90^\circ$. In design you would round to a flatter standard curve that still satisfies the clearance, then recompute every element from the adopted radius.`,
    },
    { type: "check", questionId: "mste-q11" },

    { type: "heading", id: "deflection-angles", text: "Deflection angles for layout" },
    {
      type: "paragraph",
      text: String.raw`Curves are staked out from the PC by turning **deflection angles** from the back tangent and taping chords. The deflection angle to any point on the curve is half of the central angle subtended by the arc from the PC to that point. With the arc basis, an arc of length $s$ subtends $sD/20$ at the center, so the deflection is:`,
    },
    {
      type: "math",
      tex: String.raw`\delta = \frac{s\,D}{40} \quad (\delta \text{ in degrees, } s \text{ in m}), \qquad \delta_{PT} = \frac{I}{2}`,
      label: "Deflection angle from the PC",
    },
    {
      type: "paragraph",
      text: String.raw`In the example above, the first full 20-m station after the PC is 2+380, so the first subchord is $2380 - 2366.584 = 13.416$ m and its deflection is $13.416(5)/40 = 1.677^\circ \approx 1^\circ 40' 37''$. Each full 20-m station adds $D/2 = 2.5^\circ$, and the total deflection to the PT must come out to $I/2 = 20^\circ$, which is a built-in check.`,
    },
    {
      type: "callout",
      tone: "exam",
      title: "Fast checks under time pressure",
      text: String.raw`Confirm that $E > M$, that $C < L < 2T$, and that the PT station is less than PI + T. If any of these fail, recheck whether you used $I$ instead of $I/2$ inside the trigonometric functions.`,
    },
    { type: "check", questionId: "mste-q12" },
  ],
};

export const lessons: Lesson[] = [
  solutionOfTriangles,
  derivativesOptimization,
  differentialLeveling,
  horizontalSimpleCurves,
];
