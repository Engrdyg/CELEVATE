import type { Lesson } from "@/lib/content/types";

// ============================================================================
// Chapter 1 — Lesson 1: Fluid properties, pressure and manometry
// ============================================================================
const fluidPressure: Lesson = {
  id: "hge-l-fluid-pressure",
  subjectId: "hge",
  chapterId: "hge-ch1",
  title: "Fluid Properties, Pressure & Manometers",
  summary:
    "Unit weight, specific gravity, hydrostatic pressure in single and layered liquids, gauge vs absolute pressure, and the step-by-step manometer rule.",
  minutes: 14,
  status: "available",
  topics: ["Unit weight & specific gravity", "Hydrostatic pressure", "Gauge vs absolute pressure", "Manometers"],
  formulaIds: ["hge-f-specific-gravity", "hge-f-hydrostatic-pressure", "hge-f-manometer-rule"],
  questionIds: ["hge-q001", "hge-q002"],
  blocks: [
    {
      type: "paragraph",
      text: "Nearly every hydraulics problem in the board exam starts with the same few fluid properties. If you can move confidently between density, unit weight and specific gravity, and you can write the pressure at any point in a static liquid, you already have the tools for manometers, gates, dams and buoyancy.",
    },
    { type: "heading", id: "fluid-properties", text: "Density, unit weight and specific gravity" },
    {
      type: "paragraph",
      text: String.raw`**Mass density** $\rho$ is mass per unit volume (kg/m³). **Unit weight** $\gamma$ (also called specific weight) is weight per unit volume (kN/m³). The two are linked by gravity: $\gamma = \rho g$. Water at ordinary temperatures has $\rho_w \approx 1000\text{ kg/m}^3$, so $\gamma_w = 9.81\text{ kN/m}^3$.`,
    },
    {
      type: "paragraph",
      text: String.raw`**Specific gravity** $SG$ is the ratio of a liquid's unit weight (or density) to that of water. It is dimensionless, which makes it the most convenient way to describe a liquid in a problem statement.`,
    },
    { type: "math", tex: String.raw`\gamma = SG \cdot \gamma_w = \rho g`, label: "Unit weight" },
    {
      type: "table",
      caption: "Specific gravities commonly used in review problems",
      head: ["Fluid", "SG", String.raw`Unit weight (kN/m³)`],
      rows: [
        ["Fresh water", "1.00", "9.81"],
        ["Seawater", "1.03", "10.10"],
        ["Light oil (typical)", "0.80 – 0.90", "7.85 – 8.83"],
        ["Mercury", "13.6", "133.4"],
      ],
    },
    {
      type: "callout",
      tone: "warning",
      title: "Watch the units of density",
      text: String.raw`$\rho g$ with $\rho$ in kg/m³ gives N/m³. Divide by 1000 before mixing it with depths in metres to get kPa. Writing $1000 \times 9.81 \times h$ and calling the result kPa is a classic factor-of-1000 slip.`,
    },
    { type: "heading", id: "hydrostatic-pressure", text: "Pressure in a static liquid" },
    {
      type: "paragraph",
      text: String.raw`In a liquid at rest, pressure acts equally in all directions at a point and increases linearly with vertical depth. Only the vertical depth $h$ below the free surface matters; the width or shape of the container does not.`,
    },
    { type: "math", tex: String.raw`p = \gamma h \qquad p_{abs} = p_{gauge} + p_{atm}`, label: "Hydrostatic pressure" },
    {
      type: "paragraph",
      text: String.raw`Gauge pressure is measured relative to the local atmosphere, so it is zero at an open free surface. Absolute pressure adds the atmospheric pressure (standard value $101.325\text{ kPa}$). Unless a problem says "absolute", report gauge pressure.`,
    },
    {
      type: "paragraph",
      text: String.raw`For **layered liquids** (for example oil floating on water), add the contribution of each layer: $p = \gamma_1 h_1 + \gamma_2 h_2 + \cdots$. The lighter liquid always sits on top. A pressure can also be expressed as an equivalent **pressure head** $h = p/\gamma$, which is the height of a column of a stated liquid that produces that pressure.`,
    },
    { type: "check", questionId: "hge-q001" },
    {
      type: "paragraph",
      text: String.raw`The simplest pressure-measuring device is a **piezometer**, an open vertical tube tapped into a pipe or tank. The liquid rises in the tube until its column balances the pressure at the tap, so the pressure head is read directly as $p/\gamma$. Piezometers are limited to small positive pressures and cannot measure a vacuum, because a negative gauge pressure would draw air into the tube. Gauge pressures below zero are often called vacuum or suction pressures; the absolute pressure can never fall below zero, so the largest possible vacuum at sea level is about 101.3 kPa (roughly 10.3 m of water). For higher pressures or for vacuums, a manometer with a heavy gauge liquid such as mercury is used instead.`,
    },
    { type: "heading", id: "manometers", text: "Manometers: the walk-through method" },
    {
      type: "paragraph",
      text: "A manometer is a tube containing one or more liquids used to measure pressure or a pressure difference. Rather than memorising a formula for each manometer shape, use one rule that works for all of them.",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Start at a point whose pressure you want (or know) and write its pressure.",
        String.raw`Move through each continuous fluid column. Moving **down** adds $\gamma h$; moving **up** subtracts $\gamma h$.`,
        "Horizontal moves within the same continuous fluid change nothing.",
        String.raw`Stop at the other point and set the running sum equal to its pressure (zero gauge at an open end).`,
      ],
    },
    { type: "math", tex: String.raw`p_A + \sum \gamma_i h_i\big|_{\text{down}} - \sum \gamma_j h_j\big|_{\text{up}} = p_B`, label: "Manometer rule" },
    {
      type: "callout",
      tone: "tip",
      title: "Differential manometer shortcut",
      text: String.raw`If points A and B are at the same elevation and both pipes carry the same fluid of specific gravity $SG_f$, the walk-through collapses to $p_A - p_B = (SG_m - SG_f)\,\gamma_w\,h$, where $h$ is the manometer deflection and $SG_m$ is the gauge liquid. Check the elevations before using it.`,
    },
    {
      type: "example",
      title: "Differential mercury manometer between two water pipes",
      problem: String.raw`Pipes A and B carry water and are connected by a mercury differential manometer ($SG = 13.6$). The centre of A is 0.50 m above the mercury surface in the left leg. The mercury in the right leg stands 0.30 m higher than in the left leg, and the centre of B is 0.20 m above the right mercury surface. Find $p_A - p_B$.`,
      given: [
        String.raw`$\gamma_w = 9.81\text{ kN/m}^3$, $\gamma_{Hg} = 13.6(9.81) = 133.42\text{ kN/m}^3$`,
        "Deflection h = 0.30 m",
      ],
      steps: [
        {
          text: "Start at A and walk down 0.50 m of water to the left mercury surface.",
          tex: String.raw`p_A + 9.81(0.50)`,
        },
        {
          text: "Walk up 0.30 m of mercury to the level of the right mercury surface, then up 0.20 m of water to B.",
          tex: String.raw`p_A + 9.81(0.50) - 133.42(0.30) - 9.81(0.20) = p_B`,
        },
        {
          text: "Collect terms.",
          tex: String.raw`p_A - p_B = 40.025 + 1.962 - 4.905 = 37.08\text{ kPa}`,
        },
        {
          text: String.raw`Check with the shortcut: A is $0.50$ m above the left mercury, B is $0.30 + 0.20 = 0.50$ m above it, so A and B are level.`,
          tex: String.raw`p_A - p_B = (13.6 - 1.0)(9.81)(0.30) = 37.08\text{ kPa}`,
        },
      ],
      answer: String.raw`$p_A - p_B = 37.08\text{ kPa}$ (pressure at A is higher)`,
    },
    { type: "check", questionId: "hge-q002" },
    {
      type: "callout",
      tone: "exam",
      title: "Exam habit",
      text: "Sketch the manometer, label every interface with its elevation, and write the walk-through as a single equation before substituting numbers. Most wrong answers come from a sign error on one column, not from arithmetic.",
    },
  ],
};

// ============================================================================
// Chapter 1 — Lesson 2: Hydrostatic force on plane surfaces
// ============================================================================
const hydrostaticPlane: Lesson = {
  id: "hge-l-hydrostatic-force-plane",
  subjectId: "hge",
  chapterId: "hge-ch1",
  title: "Hydrostatic Force on Plane Surfaces",
  summary:
    "Magnitude and location of the resultant water force on vertical and inclined gates, the center of pressure, and moment equilibrium of hinged gates.",
  minutes: 16,
  status: "available",
  topics: ["Total hydrostatic force", "Center of pressure", "Inclined surfaces", "Hinged gates"],
  formulaIds: ["hge-f-hydrostatic-force-plane", "hge-f-center-of-pressure", "hge-f-hydrostatic-pressure"],
  questionIds: ["hge-q003", "hge-q004"],
  blocks: [
    {
      type: "paragraph",
      text: "Gates, dam faces, tank walls and sluices all carry water pressure that grows with depth. Design and analysis need two numbers: how large the total force is, and where it acts. This lesson builds both from the pressure distribution and shows how to use them in the hinged-gate problems that appear often in review.",
    },
    { type: "heading", id: "total-force", text: "Magnitude of the resultant force" },
    {
      type: "paragraph",
      text: String.raw`On a submerged plane area $A$, the pressure at each point is $\gamma h$, where $h$ is that point's vertical depth. Integrating over the area gives a remarkably simple result: the total force equals the pressure at the **centroid** of the area multiplied by the area.`,
    },
    { type: "math", tex: String.raw`F = \gamma \bar{h} A`, label: "Total hydrostatic force" },
    {
      type: "paragraph",
      text: String.raw`Here $\bar{h}$ is the **vertical** depth of the centroid below the free surface. The force acts normal to the surface. The formula holds for any shape and any angle of inclination, as long as the surface is plane and the liquid has a single free surface.`,
    },
    {
      type: "figure",
      figure: "hydrostatic-plane",
      caption: String.raw`Submerged plane surface: the resultant $F$ acts at the center of pressure, which lies below the centroid at depth $\bar{h}$.`,
    },
    { type: "heading", id: "center-of-pressure", text: "Where the force acts: center of pressure" },
    {
      type: "paragraph",
      text: String.raw`Because pressure increases with depth, the lower part of the gate carries more load, so the resultant acts **below** the centroid. Measure distances along the plane of the surface, starting from the line where that plane (extended if necessary) meets the free surface. Call the inclined distance to the centroid $\bar{y}$ and to the center of pressure $y_p$.`,
    },
    { type: "math", tex: String.raw`y_p = \bar{y} + \frac{I_g}{A\bar{y}} \qquad e = \frac{I_g}{A\bar{y}}`, label: "Center of pressure" },
    {
      type: "paragraph",
      text: String.raw`For a vertical surface $\bar{y} = \bar{h}$. For a surface inclined at angle $\theta$ to the horizontal, $\bar{h} = \bar{y}\sin\theta$. The eccentricity $e$ shrinks as the gate goes deeper, so a deeply submerged gate has its center of pressure very close to its centroid.`,
    },
    {
      type: "table",
      caption: "Centroidal moments of inertia about the horizontal axis",
      head: ["Shape", "Area A", String.raw`$I_g$`],
      rows: [
        [String.raw`Rectangle, width $b$, height $h$`, String.raw`$bh$`, String.raw`$bh^3/12$`],
        [String.raw`Triangle, base $b$ horizontal, height $h$`, String.raw`$bh/2$`, String.raw`$bh^3/36$`],
        [String.raw`Circle, radius $r$`, String.raw`$\pi r^2$`, String.raw`$\pi r^4/4$`],
      ],
    },
    {
      type: "callout",
      tone: "warning",
      title: "Vertical depth vs inclined distance",
      text: String.raw`Use the vertical depth $\bar{h}$ in $F = \gamma\bar{h}A$, but the inclined distance $\bar{y}$ in $I_g/(A\bar{y})$. Mixing them up on an inclined gate is the most common error in this topic.`,
    },
    {
      type: "example",
      title: "Circular gate in a vertical wall",
      problem: String.raw`A circular gate 1.2 m in diameter is set in the vertical wall of a water tank. Its centre is 3.0 m below the water surface. Find the total force on the gate and the depth of its center of pressure.`,
      given: [String.raw`$r = 0.6\text{ m}$, $\bar{h} = \bar{y} = 3.0\text{ m}$`, String.raw`$\gamma_w = 9.81\text{ kN/m}^3$`],
      steps: [
        { text: "Compute the area of the gate.", tex: String.raw`A = \pi(0.6)^2 = 1.1310\text{ m}^2` },
        { text: "Total force from the centroid pressure.", tex: String.raw`F = 9.81(3.0)(1.1310) = 33.28\text{ kN}` },
        { text: "Centroidal moment of inertia of a circle.", tex: String.raw`I_g = \frac{\pi(0.6)^4}{4} = 0.10179\text{ m}^4` },
        {
          text: "Eccentricity and location of the center of pressure.",
          tex: String.raw`e = \frac{0.10179}{1.1310(3.0)} = 0.0300\text{ m} \quad\Rightarrow\quad y_p = 3.03\text{ m}`,
        },
      ],
      answer: String.raw`$F = 33.28\text{ kN}$ acting 3.03 m below the water surface`,
    },
    { type: "check", questionId: "hge-q003" },
    {
      type: "paragraph",
      text: String.raw`A useful special case is a vertical rectangular wall of width $b$ with water standing to depth $h$ against it, starting at the free surface. The pressure diagram is a triangle from zero at the top to $\gamma h$ at the bottom, so the force is the area of that triangle times the width, $F = \gamma h^2 b/2$, acting at $h/3$ above the base (the centroid of the triangle). This "pressure prism" view gives the same answer as $F = \gamma\bar{h}A$ with $\bar{h} = h/2$, and it is the fastest way to handle retaining walls, dam faces, and walls with water on both sides, where you simply subtract the two triangular diagrams.`,
    },
    { type: "heading", id: "hinged-gates", text: "Hinged gates and moment equilibrium" },
    {
      type: "paragraph",
      text: String.raw`Many problems ask for the force needed to hold a gate closed, or the water depth at which a gate opens. Treat the gate as a free body: the water resultant $F$ acts at the center of pressure, and you take moments about the hinge. The moment arm of $F$ is the distance from the hinge to the center of pressure, measured along the gate.`,
    },
    {
      type: "math",
      tex: String.raw`\sum M_{\text{hinge}} = 0: \quad P \cdot L_P = F\left(d_{\text{hinge}\to\bar{y}} + e\right)`,
      label: "Hinged gate equilibrium",
    },
    {
      type: "list",
      items: [
        String.raw`Locate the line where the plane of the gate meets the free surface; measure $\bar{y}$ from it along the incline.`,
        String.raw`Find $F = \gamma\bar{h}A$ with $\bar{h} = \bar{y}\sin\theta$.`,
        String.raw`Find $e = I_g/(A\bar{y})$; the arm of $F$ from a top hinge is (distance to centroid) $+\ e$.`,
        "Take moments about the hinge to solve for the unknown force or reaction.",
      ],
    },
    { type: "check", questionId: "hge-q004" },
    {
      type: "callout",
      tone: "exam",
      title: "Quick sanity checks",
      text: String.raw`The center of pressure must lie within the gate and below its centroid. If your force to hold a top-hinged gate is exactly $F/2$, you probably placed $F$ at the centroid and forgot $e$.`,
    },
  ],
};

// ============================================================================
// Chapter 2 — Lesson 1: Continuity, Bernoulli and the energy equation
// ============================================================================
const energyEquation: Lesson = {
  id: "hge-l-energy-equation",
  subjectId: "hge",
  chapterId: "hge-ch2",
  title: "Continuity, Bernoulli & the Energy Equation",
  summary:
    "Conservation of mass and energy in pipe flow: velocity changes at contractions, the three heads, energy and hydraulic grade lines, and Darcy–Weisbach friction loss.",
  minutes: 18,
  status: "available",
  topics: ["Continuity equation", "Bernoulli's equation", "Energy & hydraulic grade lines", "Darcy–Weisbach head loss"],
  formulaIds: ["hge-f-continuity", "hge-f-energy-equation", "hge-f-darcy-weisbach", "hge-f-darcy-weisbach-q"],
  questionIds: ["hge-q005", "hge-q006", "hge-q007", "hge-q008"],
  blocks: [
    {
      type: "paragraph",
      text: "Almost every pipe and reservoir problem is solved with two equations used together: continuity (what goes in must come out) and the energy equation (total head is conserved except for what is added, extracted or lost). This lesson sets up both and adds the Darcy–Weisbach equation for friction losses.",
    },
    { type: "heading", id: "continuity", text: "Continuity: conservation of mass" },
    {
      type: "paragraph",
      text: String.raw`For steady flow of an incompressible liquid, the discharge $Q$ (m³/s) passing every section of a single pipe is the same. Since $Q = AV$, velocity rises where the area shrinks.`,
    },
    { type: "math", tex: String.raw`Q = A_1V_1 = A_2V_2 \qquad \frac{V_2}{V_1} = \left(\frac{D_1}{D_2}\right)^2`, label: "Continuity" },
    {
      type: "callout",
      tone: "warning",
      title: "Square the diameter ratio",
      text: String.raw`Area goes with $D^2$, so a 300 mm to 150 mm reduction makes the velocity four times larger, not two. Also make sure you use $A = \pi D^2/4$ and not $\pi D^2$.`,
    },
    {
      type: "paragraph",
      text: String.raw`Continuity also governs branching systems. At a junction the inflows must equal the outflows, $\sum Q_{in} = \sum Q_{out}$, which is the starting point for pipes in parallel and three-reservoir problems. Always confirm that you are working with the inside diameter and with discharge in m³/s; litres per second must be divided by 1000 first.`,
    },
    { type: "heading", id: "energy-equation", text: "Bernoulli and the energy equation" },
    {
      type: "paragraph",
      text: String.raw`Every point in a flowing liquid carries energy per unit weight, expressed as a **head** in metres: pressure head $p/\gamma$, velocity head $V^2/2g$, and elevation head $z$ above a chosen datum. For an ideal fluid with no pumps or losses, the sum is constant along the flow (Bernoulli). Real pipes lose head to friction and fittings, and pumps or turbines add or remove head.`,
    },
    {
      type: "math",
      tex: String.raw`\frac{p_1}{\gamma} + \frac{V_1^2}{2g} + z_1 + h_A = \frac{p_2}{\gamma} + \frac{V_2^2}{2g} + z_2 + h_E + h_L`,
      label: "Energy equation",
    },
    {
      type: "list",
      items: [
        String.raw`At the surface of a large reservoir: $p = 0$ (gauge) and $V \approx 0$.`,
        String.raw`At a free jet discharging to air: $p = 0$, but the velocity head is not zero.`,
        String.raw`Section 1 is always upstream, so $h_L$ is positive on the downstream side.`,
        "Choose the datum through the lowest point to keep elevations positive.",
      ],
    },
    {
      type: "figure",
      figure: "pipe-flow",
      caption: String.raw`Reservoir feeding a pipe: the energy grade line (EGL) drops by the head loss $h_L$; the hydraulic grade line (HGL) sits one velocity head below the EGL.`,
    },
    {
      type: "paragraph",
      text: String.raw`The **energy grade line** (EGL) plots the total head $p/\gamma + V^2/2g + z$ along the pipe. The **hydraulic grade line** (HGL) plots $p/\gamma + z$, so it lies $V^2/2g$ below the EGL. The EGL can only slope downward in the direction of flow unless a pump adds energy. Where the HGL falls below the pipe, the pressure there is negative (below atmospheric).`,
    },
    { type: "check", questionId: "hge-q006" },
    { type: "heading", id: "head-loss", text: "Friction loss: Darcy–Weisbach" },
    {
      type: "paragraph",
      text: String.raw`The head lost to wall friction in a full circular pipe is given by the Darcy–Weisbach equation. The friction factor $f$ depends on the Reynolds number and the relative roughness and is usually given in board problems. In terms of discharge, the equation shows a very strong dependence on diameter: $h_f \propto Q^2/D^5$.`,
    },
    {
      type: "math",
      tex: String.raw`h_f = f\,\frac{L}{D}\,\frac{V^2}{2g} = \frac{8fLQ^2}{\pi^2 g D^5} \approx \frac{0.0826\,fLQ^2}{D^5}`,
      label: "Darcy–Weisbach",
    },
    {
      type: "example",
      title: "Pressure at the downstream end of a rising pipe",
      problem: String.raw`Water flows at $0.05\text{ m}^3/\text{s}$ through a 200 mm pipe, 300 m long, with $f = 0.022$. Point 1 is at elevation 20 m with pressure 250 kPa; point 2 is at elevation 28 m. Neglect minor losses. Find the pressure at point 2.`,
      given: [String.raw`$D = 0.20\text{ m}$, $L = 300\text{ m}$, $f = 0.022$`, String.raw`$z_1 = 20\text{ m}$, $z_2 = 28\text{ m}$, $p_1 = 250\text{ kPa}$`],
      steps: [
        { text: "Mean velocity from continuity.", tex: String.raw`V = \frac{0.05}{\pi(0.20)^2/4} = 1.592\text{ m/s}` },
        {
          text: "Friction loss from Darcy–Weisbach.",
          tex: String.raw`h_f = 0.022\left(\frac{300}{0.20}\right)\frac{(1.592)^2}{2(9.81)} = 4.260\text{ m}`,
        },
        {
          text: "The diameter is constant, so the velocity heads cancel in the energy equation.",
          tex: String.raw`\frac{p_2}{\gamma} = \frac{p_1}{\gamma} + z_1 - z_2 - h_f`,
        },
        {
          text: "Substitute and convert back to pressure.",
          tex: String.raw`p_2 = 250 - 9.81(8 + 4.260) = 129.73\text{ kPa}`,
        },
      ],
      answer: String.raw`$p_2 \approx 129.7\text{ kPa}$`,
    },
    { type: "check", questionId: "hge-q007" },
    {
      type: "paragraph",
      text: String.raw`Fittings, valves, bends, entrances and exits cause additional **minor losses**, written as a multiple of the velocity head: $h_m = K V^2/2g$. A sharp-edged entrance from a reservoir is commonly taken as $K = 0.5$, and a submerged exit into a reservoir as $K = 1.0$ because the whole velocity head is dissipated. In long pipelines minor losses are often small compared with friction and problems may say to neglect them; in short pipes with many fittings they can dominate. The total head loss is $h_L = h_f + \sum h_m$.`,
    },
    {
      type: "paragraph",
      text: String.raw`When a pump lifts water between two reservoirs, the energy equation gives the head the pump must add: $h_A = (z_2 - z_1) + h_L$. The power delivered to the water is $P = \gamma Q h_A$ (kW when $\gamma$ is in kN/m³ and $Q$ in m³/s), and the input power is that value divided by the pump efficiency. A turbine works the other way: it extracts $h_E$, and the power it can produce is $\gamma Q h_E$ times its efficiency.`,
    },
    {
      type: "callout",
      tone: "exam",
      title: "Reservoir-to-outlet problems",
      text: String.raw`When a pipe drains a reservoir to a free jet, the available head $H$ supplies both the exit velocity head and the friction loss: $H = \dfrac{V^2}{2g}\left(1 + f\dfrac{L}{D}\right)$ when minor losses are neglected. Dropping the "1" (the exit velocity head) is a frequent, small but costly error.`,
    },
  ],
};

// ============================================================================
// Chapter 3 — Lesson 1: Soil phase relationships
// ============================================================================
const soilPhase: Lesson = {
  id: "hge-l-soil-phase-relationships",
  subjectId: "hge",
  chapterId: "hge-ch3",
  title: "Soil Phase Relationships",
  summary:
    "The three-phase model of soil: void ratio, porosity, water content, degree of saturation, specific gravity and the family of unit weights that connect them.",
  minutes: 16,
  status: "available",
  topics: ["Three-phase diagram", "Void ratio & porosity", "Water content & saturation", "Unit weights"],
  formulaIds: ["hge-f-void-ratio-porosity", "hge-f-se-wgs", "hge-f-moist-unit-weight", "hge-f-dry-unit-weight"],
  questionIds: ["hge-q009", "hge-q010", "hge-q011"],
  blocks: [
    {
      type: "paragraph",
      text: "Soil is a mixture of solid particles, water and air. Nearly every geotechnical calculation, from compaction control to settlement, starts by describing how much of each phase a sample contains. Board problems in this area are pure bookkeeping, and they are some of the most reliable points in the exam if you set them up systematically.",
    },
    { type: "heading", id: "phase-diagram", text: "The three-phase diagram" },
    {
      type: "paragraph",
      text: String.raw`Imagine separating a soil sample into three stacked blocks: air on top, water in the middle, solids at the bottom. Volumes go on one side ($V_a$, $V_w$, $V_s$, with $V_v = V_a + V_w$) and weights on the other ($W_w$, $W_s$, with the weight of air taken as zero).`,
    },
    {
      type: "figure",
      figure: "soil-phase-diagram",
      caption: "Three-phase block: volumes on the left, weights on the right. The voids consist of air and water.",
    },
    {
      type: "table",
      caption: "Basic definitions",
      head: ["Quantity", "Definition", "Notes"],
      rows: [
        [String.raw`Void ratio $e$`, String.raw`$V_v/V_s$`, "Can exceed 1"],
        [String.raw`Porosity $n$`, String.raw`$V_v/V$`, "Always less than 1"],
        [String.raw`Water content $w$`, String.raw`$W_w/W_s$`, "Based on dry weight; can exceed 100%"],
        [String.raw`Degree of saturation $S$`, String.raw`$V_w/V_v$`, "0 for dry, 1 for saturated"],
        [String.raw`Specific gravity $G_s$`, String.raw`$\gamma_s/\gamma_w$`, "Typically 2.60 to 2.80"],
      ],
    },
    {
      type: "callout",
      tone: "warning",
      title: "Water content uses the dry weight",
      text: String.raw`$w = W_w/W_s$, not $W_w/W$. If a sample has a moist mass of 1.82 kg and a dry mass of 1.58 kg, $w = 0.24/1.58 = 15.2\%$, not $0.24/1.82$.`,
    },
    { type: "heading", id: "key-identities", text: "The key identities" },
    {
      type: "paragraph",
      text: String.raw`Setting $V_s = 1$ in the phase diagram makes $V_v = e$ and $V = 1 + e$. From there, every relationship below follows in one or two lines. Learn to derive them; then you never have to worry about remembering the wrong version.`,
    },
    { type: "math", tex: String.raw`n = \frac{e}{1+e} \qquad e = \frac{n}{1-n} \qquad Se = wG_s`, label: "Volume relationships" },
    {
      type: "math",
      tex: String.raw`\gamma = \frac{(G_s + Se)\gamma_w}{1+e} \qquad \gamma_d = \frac{G_s\gamma_w}{1+e} = \frac{\gamma}{1+w} \qquad \gamma_{sat} = \frac{(G_s + e)\gamma_w}{1+e}`,
      label: "Unit weights",
    },
    {
      type: "paragraph",
      text: String.raw`To see where the moist unit weight comes from, take $V_s = 1$. Then the weight of solids is $W_s = G_s\gamma_w$, the volume of water is $V_w = Se$, and its weight is $W_w = Se\gamma_w$. Dividing the total weight $(G_s + Se)\gamma_w$ by the total volume $1 + e$ gives the formula directly. Setting $S = 0$ gives the dry unit weight and setting $S = 1$ gives the saturated unit weight, so one expression covers all three cases. The same bookkeeping shows why $w = W_w/W_s = Se/G_s$, which rearranges to the identity $Se = wG_s$.`,
    },
    {
      type: "paragraph",
      text: String.raw`The **submerged** (buoyant) unit weight $\gamma' = \gamma_{sat} - \gamma_w$ is used for soil below the water table and will be central to effective stress calculations in Chapter 4.`,
    },
    { type: "check", questionId: "hge-q009" },
    { type: "heading", id: "solving-strategy", text: "A reliable solving strategy" },
    {
      type: "list",
      ordered: true,
      items: [
        String.raw`Write down every given quantity, converting percentages to decimals.`,
        String.raw`If masses and a volume are given, compute $w$, $\gamma$ and $\gamma_d$ directly from the definitions first.`,
        String.raw`Get $e$ from $\gamma_d = G_s\gamma_w/(1+e)$.`,
        String.raw`Get $S$ from $Se = wG_s$, and $n$ from $e/(1+e)$.`,
        String.raw`Sanity check: $S$ must lie between 0 and 1, and $\gamma_d < \gamma < \gamma_{sat}$ for a partially saturated soil.`,
      ],
    },
    {
      type: "example",
      title: "Complete phase analysis of a tube sample",
      problem: String.raw`An undisturbed sample with a volume of $1000\text{ cm}^3$ has a moist mass of 1.82 kg. After oven-drying its mass is 1.58 kg. Take $G_s = 2.70$. Find the water content, moist and dry unit weights, void ratio, porosity and degree of saturation.`,
      given: [String.raw`$V = 0.001\text{ m}^3$, $M = 1.82\text{ kg}$, $M_s = 1.58\text{ kg}$, $G_s = 2.70$`],
      steps: [
        { text: "Water content from the masses.", tex: String.raw`w = \frac{1.82 - 1.58}{1.58} = 0.1519 = 15.19\%` },
        {
          text: "Moist and dry unit weights (mass times g over volume, converted to kN).",
          tex: String.raw`\gamma = \frac{1.82(9.81)}{0.001} = 17.85\text{ kN/m}^3 \qquad \gamma_d = \frac{1.58(9.81)}{0.001} = 15.50\text{ kN/m}^3`,
        },
        { text: "Void ratio from the dry unit weight.", tex: String.raw`e = \frac{G_s\gamma_w}{\gamma_d} - 1 = \frac{2.70(9.81)}{15.50} - 1 = 0.709` },
        { text: "Porosity.", tex: String.raw`n = \frac{0.709}{1.709} = 0.415` },
        { text: "Degree of saturation from the phase identity.", tex: String.raw`S = \frac{wG_s}{e} = \frac{0.1519(2.70)}{0.709} = 0.579 = 57.9\%` },
      ],
      answer: String.raw`$w = 15.2\%$, $\gamma = 17.85\text{ kN/m}^3$, $\gamma_d = 15.50\text{ kN/m}^3$, $e = 0.709$, $n = 0.415$, $S = 57.9\%$`,
    },
    { type: "check", questionId: "hge-q010" },
    {
      type: "paragraph",
      text: String.raw`For granular soils, the void ratio is also used to describe how dense the deposit is relative to its loosest and densest possible states. The **relative density** is $D_r = (e_{max} - e)/(e_{max} - e_{min})$, expressed as a percentage. A $D_r$ near 0% indicates a very loose sand that may densify or liquefy under shaking, while a value near 100% indicates a very dense sand. Because $e$ can be expressed through the dry unit weight, $D_r$ problems are really phase-relationship problems in disguise: convert each given dry unit weight to a void ratio first, then substitute.`,
    },
    {
      type: "callout",
      tone: "exam",
      title: "Do not assume saturation",
      text: String.raw`Use $e = wG_s$ only when the problem says the soil is saturated (or is below the water table). For a partially saturated soil you must find $e$ from a unit weight first.`,
    },
  ],
};

// ============================================================================
// Chapter 4 — Lesson 1: Effective stress
// ============================================================================
const effectiveStress: Lesson = {
  id: "hge-l-effective-stress",
  subjectId: "hge",
  chapterId: "hge-ch4",
  title: "Effective Stress & Pore Water Pressure",
  summary:
    "Terzaghi's effective stress principle, stress profiles in layered soil, the effect of water-table changes and seepage, and why effective stress drives settlement.",
  minutes: 17,
  status: "available",
  topics: ["Total stress & pore pressure", "Effective stress profiles", "Water-table changes", "Seepage & quick condition"],
  formulaIds: ["hge-f-effective-stress", "hge-f-moist-unit-weight", "hge-f-consolidation-nc"],
  questionIds: ["hge-q012", "hge-q013", "hge-q015"],
  blocks: [
    {
      type: "paragraph",
      text: "The single most important idea in soil mechanics is that soil responds to the stress carried by its particle skeleton, not to the total stress. Water in the pores pushes back equally in all directions and carries no shear. Strength, compression and settlement are all governed by what is left after the water pressure is subtracted: the effective stress.",
    },
    { type: "heading", id: "principle", text: "The effective stress principle" },
    {
      type: "paragraph",
      text: String.raw`At a depth $z$, the **total vertical stress** $\sigma$ is the weight of everything above a unit area: soil, water and any surcharge. The **pore water pressure** $u$ is the water pressure at that point; under hydrostatic conditions it equals $\gamma_w$ times the depth below the water table. The difference is the **effective stress** $\sigma'$.`,
    },
    { type: "math", tex: String.raw`\sigma' = \sigma - u \qquad \sigma = \sum \gamma_i H_i \qquad u = \gamma_w h_w`, label: "Effective stress" },
    {
      type: "paragraph",
      text: String.raw`Above the water table use the moist unit weight $\gamma$ of each layer; below it use $\gamma_{sat}$. Equivalently, below the water table you may skip $u$ altogether and accumulate the submerged unit weight $\gamma' = \gamma_{sat} - \gamma_w$, which gives $\sigma'$ directly.`,
    },
    {
      type: "callout",
      tone: "concept",
      title: "Why the submerged unit weight works",
      text: String.raw`For a layer of thickness $H$ below the water table, total stress increases by $\gamma_{sat}H$ and pore pressure by $\gamma_w H$. The net effective increase is $(\gamma_{sat} - \gamma_w)H = \gamma' H$.`,
    },
    { type: "heading", id: "stress-profiles", text: "Stress profiles in layered soil" },
    {
      type: "example",
      title: "Sand over clay",
      problem: String.raw`A deposit consists of 6 m of sand over a thick clay layer. The water table is 2 m below the ground surface. Sand above the water table has $\gamma = 16.5\text{ kN/m}^3$; below it $\gamma_{sat} = 19.2\text{ kN/m}^3$. The clay has $\gamma_{sat} = 18.0\text{ kN/m}^3$. Find $\sigma$, $u$ and $\sigma'$ at the sand–clay interface (6 m) and at 8.5 m depth.`,
      given: [String.raw`Water table at 2 m; $\gamma_w = 9.81\text{ kN/m}^3$`],
      steps: [
        { text: "Total stress at 6 m.", tex: String.raw`\sigma_6 = 16.5(2) + 19.2(4) = 109.80\text{ kPa}` },
        {
          text: "Pore pressure and effective stress at 6 m (4 m below the water table).",
          tex: String.raw`u_6 = 9.81(4) = 39.24\text{ kPa} \qquad \sigma'_6 = 109.80 - 39.24 = 70.56\text{ kPa}`,
        },
        { text: "Total stress at 8.5 m adds 2.5 m of clay.", tex: String.raw`\sigma_{8.5} = 109.80 + 18.0(2.5) = 154.80\text{ kPa}` },
        {
          text: "Pore pressure and effective stress at 8.5 m (6.5 m below the water table).",
          tex: String.raw`u_{8.5} = 9.81(6.5) = 63.77\text{ kPa} \qquad \sigma'_{8.5} = 154.80 - 63.77 = 91.03\text{ kPa}`,
        },
        {
          text: "Check with submerged unit weights.",
          tex: String.raw`\sigma'_{8.5} = 16.5(2) + (19.2 - 9.81)(4) + (18.0 - 9.81)(2.5) = 91.04\text{ kPa}`,
        },
      ],
      answer: String.raw`At 6 m: $\sigma' = 70.56\text{ kPa}$. At 8.5 m: $\sigma' \approx 91.0\text{ kPa}$ (the 0.01 difference is rounding of $u$).`,
    },
    { type: "check", questionId: "hge-q012" },
    {
      type: "paragraph",
      text: String.raw`Above the water table, fine-grained soils can hold water by **capillary rise**. Within a fully saturated capillary zone the pore water is in tension, so $u = -\gamma_w h_c$ at a height $h_c$ above the water table. Negative pore pressure increases effective stress, which is one reason moist fine sands can stand in a near-vertical cut for a short time. Unless a problem specifically describes a capillary zone, take $u = 0$ everywhere above the water table.`,
    },
    { type: "heading", id: "water-table-changes", text: "Raising or lowering the water table" },
    {
      type: "paragraph",
      text: String.raw`Lowering the water table (for example by pumping from wells) reduces pore pressure more than it reduces total stress, so effective stress **increases**. For the zone that drains, the unit weight changes from $\gamma_{sat}$ to the moist $\gamma$, but the pore pressure drop of $\gamma_w$ per metre dominates. This increase in $\sigma'$ is why groundwater drawdown causes ground subsidence in soft clay areas. Raising the water table does the opposite and reduces effective stress and strength.`,
    },
    {
      type: "table",
      caption: "Effect of common changes on stresses at a point below the water table",
      head: ["Change", String.raw`$\sigma$`, String.raw`$u$`, String.raw`$\sigma'$`],
      rows: [
        ["Water table lowered", "Decreases slightly", "Decreases", "Increases"],
        ["Water table raised", "Increases slightly", "Increases", "Decreases"],
        ["Flood water rises above ground", "Increases", "Increases equally", "No change"],
        ["Surcharge placed (long term)", "Increases", "Returns to hydrostatic", "Increases"],
      ],
    },
    { type: "check", questionId: "hge-q013" },
    { type: "heading", id: "seepage-and-settlement", text: "Seepage, quick condition and settlement" },
    {
      type: "paragraph",
      text: String.raw`When water seeps **upward** under a hydraulic gradient $i$, the seepage force reduces effective stress; downward seepage increases it. If the upward gradient reaches the critical value $i_c$, effective stress drops to zero and a cohesionless soil loses all strength: the quick (boiling) condition.`,
    },
    {
      type: "math",
      tex: String.raw`\sigma' = \gamma' z - i\gamma_w z \qquad i_c = \frac{\gamma'}{\gamma_w} = \frac{G_s - 1}{1+e}`,
      label: "Upward seepage",
    },
    {
      type: "paragraph",
      text: String.raw`A new load on the ground surface first raises pore pressure in a saturated clay. As water slowly drains, the excess pore pressure dissipates and the load transfers to the soil skeleton, increasing $\sigma'$ and compressing the clay. For a normally consolidated clay the resulting primary consolidation settlement is computed from the effective stress at mid-depth of the layer:`,
    },
    {
      type: "math",
      tex: String.raw`S_c = \frac{C_c H}{1+e_0}\log_{10}\!\left(\frac{\sigma'_0 + \Delta\sigma}{\sigma'_0}\right)`,
      label: "Consolidation settlement (NC clay)",
    },
    {
      type: "callout",
      tone: "exam",
      title: "Settlement problems are effective stress problems",
      text: String.raw`Most of the work in a consolidation question is computing $\sigma'_0$ at the middle of the clay correctly. Use effective, not total, stress; use $\log_{10}$, not $\ln$; and divide by $1 + e_0$, not $e_0$.`,
    },
  ],
};

export const lessons: Lesson[] = [fluidPressure, hydrostaticPlane, energyEquation, soilPhase, effectiveStress];
