import type { Question } from "@/lib/content/types";

export const questions: Question[] = [
  // ============================================================ Chapter 1
  {
    id: "hge-q01",
    subjectId: "hge",
    chapterId: "hge-ch1",
    topic: "Hydrostatic pressure in layered liquids",
    difficulty: "easy",
    stem: String.raw`An open tank contains a 2.5 m layer of oil ($SG = 0.85$) floating on 1.5 m of water. What is the gauge pressure at the bottom of the tank? Use $\gamma_w = 9.81\text{ kN/m}^3$.`,
    choices: [
      { id: "A", text: "33.35 kPa" },
      { id: "B", text: "35.56 kPa" },
      { id: "C", text: "37.03 kPa" },
      { id: "D", text: "39.24 kPa" },
    ],
    answer: "B",
    solution: {
      summary: String.raw`Add the $\gamma h$ contribution of each layer from the free surface down.`,
      steps: [
        { text: "Pressure due to the oil layer.", tex: String.raw`p_{oil} = 0.85(9.81)(2.5) = 20.85\text{ kPa}` },
        { text: "Pressure due to the water layer.", tex: String.raw`p_{w} = 9.81(1.5) = 14.72\text{ kPa}` },
        { text: "Sum the layers.", tex: String.raw`p = 20.85 + 14.72 = 35.56\text{ kPa}` },
      ],
      formulaIds: ["hge-f-specific-gravity", "hge-f-hydrostatic-pressure"],
      commonErrors: [
        "Treating the full 4.0 m as water gives 39.24 kPa.",
        "Swapping the layer thicknesses (oil 1.5 m, water 2.5 m) gives 37.03 kPa.",
      ],
    },
    relatedLessonIds: ["hge-l-fluid-pressure"],
  },
  {
    id: "hge-q02",
    subjectId: "hge",
    chapterId: "hge-ch1",
    topic: "Open mercury manometer",
    difficulty: "medium",
    stem: String.raw`A pipe carrying water is connected to an open U-tube mercury manometer ($SG = 13.6$). The centre of the pipe, point A, is 0.40 m above the mercury surface in the leg attached to the pipe. The mercury in the open leg stands 0.25 m above the mercury surface in the pipe leg. Find the gauge pressure at A.`,
    choices: [
      { id: "A", text: "37.28 kPa" },
      { id: "B", text: "33.35 kPa" },
      { id: "C", text: "86.72 kPa" },
      { id: "D", text: "29.43 kPa" },
    ],
    answer: "D",
    solution: {
      summary: "Walk from A down through the water, up through the mercury to the open surface, and set the sum to zero.",
      steps: [
        {
          text: "Start at A, go down 0.40 m of water, then up 0.25 m of mercury to the open end.",
          tex: String.raw`p_A + 9.81(0.40) - 13.6(9.81)(0.25) = 0`,
        },
        { text: "Evaluate the columns.", tex: String.raw`p_A = 33.354 - 3.924` },
        { text: "Result.", tex: String.raw`p_A = 29.43\text{ kPa}` },
      ],
      formulaIds: ["hge-f-manometer-rule", "hge-f-specific-gravity"],
      commonErrors: [
        "Ignoring the 0.40 m water column gives 33.35 kPa.",
        "Adding the water column instead of subtracting it (sign error) gives 37.28 kPa.",
        "Treating the whole 0.65 m as mercury gives 86.72 kPa.",
      ],
    },
    relatedLessonIds: ["hge-l-fluid-pressure"],
  },
  {
    id: "hge-q03",
    subjectId: "hge",
    chapterId: "hge-ch1",
    topic: "Force on a vertical rectangular gate",
    difficulty: "easy",
    stem: String.raw`A vertical rectangular gate 2 m wide and 3 m high holds back water. Its top edge is 1.5 m below the water surface. What is the total hydrostatic force on the gate?`,
    figure: "hydrostatic-plane",
    choices: [
      { id: "A", text: "176.58 kN" },
      { id: "B", text: "88.29 kN" },
      { id: "C", text: "191.30 kN" },
      { id: "D", text: "264.87 kN" },
    ],
    answer: "A",
    solution: {
      summary: String.raw`Use $F = \gamma\bar{h}A$ with the depth of the centroid, not the top or bottom edge.`,
      steps: [
        { text: "Depth of the centroid.", tex: String.raw`\bar{h} = 1.5 + \frac{3}{2} = 3.0\text{ m}` },
        { text: "Area of the gate.", tex: String.raw`A = 2(3) = 6\text{ m}^2` },
        { text: "Total force.", tex: String.raw`F = 9.81(3.0)(6) = 176.58\text{ kN}` },
      ],
      formulaIds: ["hge-f-hydrostatic-force-plane"],
      commonErrors: [
        "Using the depth of the top edge (1.5 m) gives 88.29 kN.",
        "Using the depth of the center of pressure (3.25 m) instead of the centroid gives 191.30 kN.",
        "Using the depth of the bottom edge (4.5 m) gives 264.87 kN.",
      ],
    },
    relatedLessonIds: ["hge-l-hydrostatic-force-plane"],
  },
  {
    id: "hge-q04",
    subjectId: "hge",
    chapterId: "hge-ch1",
    topic: "Hinged inclined gate",
    difficulty: "hard",
    stem: String.raw`A rectangular gate 1.5 m wide and 2.4 m long (measured along its slope) is inclined at $60^\circ$ to the horizontal and holds back water on one side. It is hinged along its top edge, which is 1.2 m vertically below the water surface. What force, applied normal to the gate at its bottom edge, is needed to keep it closed? Neglect the weight of the gate.`,
    figure: "hydrostatic-plane",
    choices: [
      { id: "A", text: "35.32 kN" },
      { id: "B", text: "39.54 kN" },
      { id: "C", text: "45.66 kN" },
      { id: "D", text: "49.44 kN" },
    ],
    answer: "C",
    solution: {
      summary: "Find the resultant and its center of pressure along the incline, then take moments about the hinge.",
      steps: [
        {
          text: "Inclined distance from the free-surface line to the top edge and to the centroid.",
          tex: String.raw`y_{top} = \frac{1.2}{\sin 60^\circ} = 1.3856\text{ m} \qquad \bar{y} = 1.3856 + 1.2 = 2.5856\text{ m}`,
        },
        {
          text: "Vertical depth of the centroid and the resultant force.",
          tex: String.raw`\bar{h} = 2.5856\sin 60^\circ = 2.2392\text{ m} \qquad F = 9.81(2.2392)(1.5 \times 2.4) = 79.08\text{ kN}`,
        },
        {
          text: "Eccentricity of the center of pressure.",
          tex: String.raw`e = \frac{I_g}{A\bar{y}} = \frac{1.5(2.4)^3/12}{3.6(2.5856)} = \frac{1.728}{9.308} = 0.1856\text{ m}`,
        },
        {
          text: "Moments about the hinge (arm of F is 1.2 + e from the hinge).",
          tex: String.raw`P(2.4) = 79.08(1.2 + 0.1856) \quad\Rightarrow\quad P = 45.66\text{ kN}`,
        },
      ],
      formulaIds: ["hge-f-hydrostatic-force-plane", "hge-f-center-of-pressure"],
      commonErrors: [
        "Placing F at the centroid (ignoring e) gives F/2 = 39.54 kN.",
        String.raw`Using the vertical depth $\bar{h} = 1.2 + 1.2 = 2.4$ m (forgetting to resolve the gate length) gives 49.44 kN.`,
        String.raw`Using $\cos 60^\circ$ instead of $\sin 60^\circ$ for an angle measured from the horizontal gives 35.32 kN.`,
      ],
    },
    relatedLessonIds: ["hge-l-hydrostatic-force-plane"],
  },

  // ============================================================ Chapter 2
  {
    id: "hge-q05",
    subjectId: "hge",
    chapterId: "hge-ch2",
    topic: "Continuity equation",
    difficulty: "easy",
    stem: "Water flows through a pipe that reduces from 300 mm to 150 mm in diameter. The velocity in the 300 mm section is 1.2 m/s. What is the velocity in the 150 mm section?",
    choices: [
      { id: "A", text: "2.40 m/s" },
      { id: "B", text: "0.30 m/s" },
      { id: "C", text: "4.80 m/s" },
      { id: "D", text: "9.60 m/s" },
    ],
    answer: "C",
    solution: {
      summary: String.raw`By continuity, velocity varies inversely with area, i.e. with $D^2$.`,
      steps: [
        { text: "Continuity for a circular pipe.", tex: String.raw`V_2 = V_1\left(\frac{D_1}{D_2}\right)^2` },
        { text: "Substitute.", tex: String.raw`V_2 = 1.2\left(\frac{300}{150}\right)^2 = 1.2(4) = 4.80\text{ m/s}` },
      ],
      formulaIds: ["hge-f-continuity"],
      commonErrors: [
        "Using the diameter ratio without squaring gives 2.40 m/s.",
        "Inverting the ratio (thinking velocity drops in the smaller pipe) gives 0.30 m/s.",
      ],
    },
    relatedLessonIds: ["hge-l-energy-equation"],
  },
  {
    id: "hge-q06",
    subjectId: "hge",
    chapterId: "hge-ch2",
    topic: "Bernoulli's equation at a contraction",
    difficulty: "medium",
    stem: String.raw`A horizontal pipe reduces from 300 mm to 150 mm in diameter and carries water at $0.10\text{ m}^3/\text{s}$. The pressure in the 300 mm section is 150 kPa. Neglecting losses, what is the pressure in the 150 mm section?`,
    choices: [
      { id: "A", text: "134.99 kPa" },
      { id: "B", text: "165.01 kPa" },
      { id: "C", text: "133.99 kPa" },
      { id: "D", text: "148.47 kPa" },
    ],
    answer: "A",
    solution: {
      summary: "Velocity increases at the contraction, so pressure must drop by the gain in velocity head.",
      steps: [
        {
          text: "Velocities from continuity.",
          tex: String.raw`V_1 = \frac{0.10}{\pi(0.30)^2/4} = 1.415\text{ m/s} \qquad V_2 = \frac{0.10}{\pi(0.15)^2/4} = 5.659\text{ m/s}`,
        },
        {
          text: String.raw`Bernoulli with $z_1 = z_2$.`,
          tex: String.raw`\frac{p_2}{\gamma} = \frac{p_1}{\gamma} - \frac{V_2^2 - V_1^2}{2g}`,
        },
        {
          text: "Change in velocity head.",
          tex: String.raw`\frac{5.659^2 - 1.415^2}{2(9.81)} = 1.530\text{ m}`,
        },
        { text: "Convert to pressure.", tex: String.raw`p_2 = 150 - 9.81(1.530) = 134.99\text{ kPa}` },
      ],
      formulaIds: ["hge-f-continuity", "hge-f-energy-equation"],
      commonErrors: [
        "Adding the velocity-head change instead of subtracting it gives 165.01 kPa.",
        String.raw`Ignoring the upstream velocity head $V_1^2/2g$ gives 133.99 kPa.`,
        "Subtracting the velocity-head change in metres directly from kPa (no conversion) gives 148.47 kPa.",
      ],
    },
    relatedLessonIds: ["hge-l-energy-equation"],
  },
  {
    id: "hge-q07",
    subjectId: "hge",
    chapterId: "hge-ch2",
    topic: "Darcy–Weisbach friction loss",
    difficulty: "medium",
    stem: String.raw`Water flows at $0.06\text{ m}^3/\text{s}$ through an 800 m long, 250 mm diameter pipe with friction factor $f = 0.02$. What is the head loss due to friction?`,
    choices: [
      { id: "A", text: "0.30 m" },
      { id: "B", text: "3.99 m" },
      { id: "C", text: "9.75 m" },
      { id: "D", text: "4.87 m" },
    ],
    answer: "D",
    solution: {
      summary: String.raw`Apply $h_f = fLV^2/(2gD)$ after getting the velocity from continuity.`,
      steps: [
        { text: "Mean velocity.", tex: String.raw`V = \frac{0.06}{\pi(0.25)^2/4} = 1.2223\text{ m/s}` },
        {
          text: "Darcy–Weisbach.",
          tex: String.raw`h_f = 0.02\left(\frac{800}{0.25}\right)\frac{(1.2223)^2}{2(9.81)} = 4.87\text{ m}`,
        },
        {
          text: "Check with the discharge form.",
          tex: String.raw`h_f = \frac{0.0826(0.02)(800)(0.06)^2}{(0.25)^5} = 4.87\text{ m}`,
        },
      ],
      formulaIds: ["hge-f-darcy-weisbach", "hge-f-darcy-weisbach-q"],
      commonErrors: [
        String.raw`Dropping the 2 in $2g$ doubles the answer to 9.75 m.`,
        "Using V instead of V² gives 3.99 m.",
        String.raw`Using $A = \pi D^2$ (omitting the 1/4) for the velocity gives 0.30 m.`,
      ],
    },
    relatedLessonIds: ["hge-l-energy-equation", "hge-l-pipes-series-parallel"],
  },
  {
    id: "hge-q08",
    subjectId: "hge",
    chapterId: "hge-ch2",
    topic: "Reservoir draining through a pipe",
    difficulty: "hard",
    stem: String.raw`A 300 mm pipe, 400 m long, draws water from a reservoir and discharges freely into the air at a point 30 m below the reservoir water surface. Take $f = 0.02$ and neglect minor losses. What is the discharge?`,
    figure: "pipe-flow",
    choices: [
      { id: "A", text: String.raw`$0.332\text{ m}^3/\text{s}$` },
      { id: "B", text: String.raw`$0.326\text{ m}^3/\text{s}$` },
      { id: "C", text: String.raw`$1.304\text{ m}^3/\text{s}$` },
      { id: "D", text: String.raw`$1.715\text{ m}^3/\text{s}$` },
    ],
    answer: "B",
    solution: {
      summary: "The 30 m head supplies both the exit velocity head and the friction loss.",
      steps: [
        {
          text: String.raw`Energy equation from the reservoir surface (1) to the free jet (2): $p_1 = p_2 = 0$, $V_1 = 0$.`,
          tex: String.raw`30 = \frac{V^2}{2g} + f\frac{L}{D}\frac{V^2}{2g} = \frac{V^2}{2g}\left(1 + \frac{0.02(400)}{0.30}\right)`,
        },
        { text: "Solve for velocity.", tex: String.raw`V = \sqrt{\frac{2(9.81)(30)}{27.667}} = 4.612\text{ m/s}` },
        { text: "Discharge.", tex: String.raw`Q = \frac{\pi(0.30)^2}{4}(4.612) = 0.326\text{ m}^3/\text{s}` },
      ],
      formulaIds: ["hge-f-energy-equation", "hge-f-darcy-weisbach", "hge-f-continuity"],
      commonErrors: [
        String.raw`Omitting the exit velocity head (setting $30 = h_f$ only) gives $0.332\text{ m}^3/\text{s}$.`,
        String.raw`Using $A = \pi D^2$ instead of $\pi D^2/4$ gives $1.304\text{ m}^3/\text{s}$.`,
        String.raw`Ignoring friction entirely ($V = \sqrt{2gH}$) gives $1.715\text{ m}^3/\text{s}$.`,
      ],
    },
    relatedLessonIds: ["hge-l-energy-equation"],
  },

  // ============================================================ Chapter 3
  {
    id: "hge-q09",
    subjectId: "hge",
    chapterId: "hge-ch3",
    topic: "Void ratio and porosity",
    difficulty: "easy",
    stem: "A soil has a void ratio of 0.65. What is its porosity?",
    choices: [
      { id: "A", text: "0.394" },
      { id: "B", text: "0.606" },
      { id: "C", text: "0.650" },
      { id: "D", text: "1.857" },
    ],
    answer: "A",
    solution: {
      summary: String.raw`Porosity is $n = e/(1+e)$.`,
      steps: [{ text: "Apply the relationship.", tex: String.raw`n = \frac{0.65}{1 + 0.65} = 0.394` }],
      formulaIds: ["hge-f-void-ratio-porosity"],
      commonErrors: [
        String.raw`Computing $1/(1+e)$, which is the solids fraction $V_s/V$, gives 0.606.`,
        String.raw`Using $e/(1-e)$ gives 1.857, which is impossible since $n < 1$.`,
      ],
    },
    relatedLessonIds: ["hge-l-soil-phase-relationships"],
  },
  {
    id: "hge-q10",
    subjectId: "hge",
    chapterId: "hge-ch3",
    topic: "Moist unit weight from phase relationships",
    difficulty: "medium",
    stem: String.raw`A soil has water content $w = 18\%$, specific gravity of solids $G_s = 2.70$, and degree of saturation $S = 80\%$. What is its moist unit weight?`,
    choices: [
      { id: "A", text: String.raw`$16.48\text{ kN/m}^3$` },
      { id: "B", text: String.raw`$20.18\text{ kN/m}^3$` },
      { id: "C", text: String.raw`$19.44\text{ kN/m}^3$` },
      { id: "D", text: String.raw`$21.03\text{ kN/m}^3$` },
    ],
    answer: "C",
    solution: {
      summary: String.raw`Find $e$ from $Se = wG_s$, then use the moist unit weight formula.`,
      steps: [
        { text: "Void ratio.", tex: String.raw`e = \frac{wG_s}{S} = \frac{0.18(2.70)}{0.80} = 0.6075` },
        {
          text: "Moist unit weight.",
          tex: String.raw`\gamma = \frac{(G_s + Se)\gamma_w}{1+e} = \frac{(2.70 + 0.80 \times 0.6075)(9.81)}{1.6075} = 19.44\text{ kN/m}^3`,
        },
      ],
      formulaIds: ["hge-f-se-wgs", "hge-f-moist-unit-weight"],
      commonErrors: [
        String.raw`Computing the dry unit weight $G_s\gamma_w/(1+e)$ gives 16.48.`,
        String.raw`Using $S = 1$ in the numerator (saturated unit weight) gives 20.18.`,
        String.raw`Assuming saturation so that $e = wG_s = 0.486$ gives 21.03.`,
      ],
    },
    relatedLessonIds: ["hge-l-soil-phase-relationships"],
  },
  {
    id: "hge-q11",
    subjectId: "hge",
    chapterId: "hge-ch3",
    topic: "Degree of saturation from field data",
    difficulty: "hard",
    stem: String.raw`A field density test gives a moist unit weight of $18.5\text{ kN/m}^3$ and a water content of 15%. The specific gravity of solids is 2.68. What is the degree of saturation? Use $\gamma_w = 9.81\text{ kN/m}^3$.`,
    choices: [
      { id: "A", text: "95.5%" },
      { id: "B", text: "59.8%" },
      { id: "C", text: "60.4%" },
      { id: "D", text: "63.4%" },
    ],
    answer: "D",
    solution: {
      summary: String.raw`Convert to dry unit weight, find $e$, then $S = wG_s/e$.`,
      steps: [
        { text: "Dry unit weight.", tex: String.raw`\gamma_d = \frac{18.5}{1.15} = 16.087\text{ kN/m}^3` },
        { text: "Void ratio.", tex: String.raw`e = \frac{2.68(9.81)}{16.087} - 1 = 0.6343` },
        { text: "Degree of saturation.", tex: String.raw`S = \frac{0.15(2.68)}{0.6343} = 0.634 = 63.4\%` },
      ],
      formulaIds: ["hge-f-dry-unit-weight", "hge-f-se-wgs"],
      commonErrors: [
        String.raw`Using the moist unit weight in $e = G_s\gamma_w/\gamma - 1$ gives $e = 0.421$ and $S = 95.5\%$.`,
        String.raw`Using $\gamma_d = \gamma(1 - w)$ gives $S = 59.8\%$.`,
        String.raw`Using $\gamma_w = 10\text{ kN/m}^3$ gives $S = 60.4\%$.`,
      ],
    },
    relatedLessonIds: ["hge-l-soil-phase-relationships"],
  },

  // ============================================================ Chapter 4
  {
    id: "hge-q12",
    subjectId: "hge",
    chapterId: "hge-ch4",
    topic: "Effective stress in a layered profile",
    difficulty: "easy",
    stem: String.raw`A soil profile has 3 m of sand ($\gamma = 17\text{ kN/m}^3$) over clay ($\gamma_{sat} = 19\text{ kN/m}^3$). The water table is at the top of the clay. What is the effective vertical stress at a depth of 8 m below the ground surface?`,
    choices: [
      { id: "A", text: "146.00 kPa" },
      { id: "B", text: "96.95 kPa" },
      { id: "C", text: "67.52 kPa" },
      { id: "D", text: "49.05 kPa" },
    ],
    answer: "B",
    solution: {
      summary: String.raw`Compute total stress and pore pressure, then $\sigma' = \sigma - u$.`,
      steps: [
        { text: "Total stress at 8 m.", tex: String.raw`\sigma = 17(3) + 19(5) = 146.00\text{ kPa}` },
        { text: "Pore pressure (5 m below the water table).", tex: String.raw`u = 9.81(5) = 49.05\text{ kPa}` },
        { text: "Effective stress.", tex: String.raw`\sigma' = 146.00 - 49.05 = 96.95\text{ kPa}` },
      ],
      formulaIds: ["hge-f-effective-stress"],
      commonErrors: [
        "Reporting the total stress (146.00 kPa) instead of the effective stress.",
        "Measuring pore pressure from the ground surface instead of the water table gives 67.52 kPa.",
      ],
    },
    relatedLessonIds: ["hge-l-effective-stress"],
  },
  {
    id: "hge-q13",
    subjectId: "hge",
    chapterId: "hge-ch4",
    topic: "Effect of lowering the water table",
    difficulty: "medium",
    stem: String.raw`The water table in a uniform soil is initially at the ground surface. The soil has $\gamma_{sat} = 19.5\text{ kN/m}^3$, and its moist unit weight when above the water table is $17.5\text{ kN/m}^3$. If the water table is lowered permanently to 2 m below the surface, by how much does the effective stress at a depth of 6 m change?`,
    choices: [
      { id: "A", text: "Increases by 15.62 kPa" },
      { id: "B", text: "Increases by 19.62 kPa" },
      { id: "C", text: "Increases by 73.76 kPa" },
      { id: "D", text: "Decreases by 58.14 kPa" },
    ],
    answer: "A",
    solution: {
      summary: "Compute the effective stress at 6 m before and after the drawdown and take the difference.",
      steps: [
        { text: "Initial effective stress (fully submerged).", tex: String.raw`\sigma'_i = (19.5 - 9.81)(6) = 58.14\text{ kPa}` },
        {
          text: "Final effective stress: 2 m of moist soil, 4 m submerged.",
          tex: String.raw`\sigma'_f = 17.5(2) + (19.5 - 9.81)(4) = 35.00 + 38.76 = 73.76\text{ kPa}`,
        },
        { text: "Change.", tex: String.raw`\Delta\sigma' = 73.76 - 58.14 = +15.62\text{ kPa}` },
      ],
      formulaIds: ["hge-f-effective-stress"],
      commonErrors: [
        String.raw`Assuming only the pore pressure changes ($2\gamma_w$) and ignoring the drop from $\gamma_{sat}$ to $\gamma$ gives 19.62 kPa.`,
        "Reporting the final effective stress (73.76 kPa) instead of the change.",
      ],
    },
    relatedLessonIds: ["hge-l-effective-stress"],
  },
  {
    id: "hge-q14",
    subjectId: "hge",
    chapterId: "hge-ch4",
    topic: "Friction angle from a drained triaxial test",
    difficulty: "medium",
    stem: String.raw`A consolidated-drained triaxial test on a normally consolidated clay ($c' = 0$) is run at a cell pressure of 100 kPa. Failure occurs at a deviator stress of 180 kPa. What is the effective angle of internal friction?`,
    choices: [
      { id: "A", text: String.raw`$25.35^\circ$` },
      { id: "B", text: String.raw`$40.01^\circ$` },
      { id: "C", text: String.raw`$28.27^\circ$` },
      { id: "D", text: String.raw`$16.60^\circ$` },
    ],
    answer: "C",
    solution: {
      summary: String.raw`With $c' = 0$, $\sin\phi' = (\sigma_1 - \sigma_3)/(\sigma_1 + \sigma_3)$.`,
      steps: [
        { text: "Major principal stress at failure.", tex: String.raw`\sigma_1 = \sigma_3 + \Delta\sigma_d = 100 + 180 = 280\text{ kPa}` },
        { text: "Mohr circle tangent to an envelope through the origin.", tex: String.raw`\sin\phi' = \frac{280 - 100}{280 + 100} = 0.4737` },
        { text: "Friction angle.", tex: String.raw`\phi' = \sin^{-1}(0.4737) = 28.27^\circ` },
      ],
      formulaIds: ["hge-f-principal-stress-failure", "hge-f-mohr-coulomb"],
      commonErrors: [
        String.raw`Using $\tan^{-1}$ instead of $\sin^{-1}$ gives $25.35^\circ$.`,
        String.raw`Using $(\sigma_1 - \sigma_3)/\sigma_1$ gives $40.01^\circ$.`,
        String.raw`Taking the deviator stress as $\sigma_1$ (180 kPa) gives $16.60^\circ$.`,
      ],
    },
    relatedLessonIds: ["hge-l-shear-strength-bearing", "hge-l-effective-stress"],
  },
  {
    id: "hge-q15",
    subjectId: "hge",
    chapterId: "hge-ch4",
    topic: "Consolidation settlement of NC clay",
    difficulty: "hard",
    stem: String.raw`A profile consists of 5 m of sand over a 4 m layer of normally consolidated clay. The water table is 2 m below the ground surface. Sand: $\gamma = 17\text{ kN/m}^3$ above the water table, $\gamma_{sat} = 19\text{ kN/m}^3$ below. Clay: $\gamma_{sat} = 18.5\text{ kN/m}^3$, $e_0 = 1.10$, $C_c = 0.35$. A wide fill adds a uniform 60 kPa at the clay. Estimate the primary consolidation settlement of the clay.`,
    choices: [
      { id: "A", text: "111.3 mm" },
      { id: "B", text: "163.7 mm" },
      { id: "C", text: "312.5 mm" },
      { id: "D", text: "376.9 mm" },
    ],
    answer: "B",
    solution: {
      summary: String.raw`Compute $\sigma'_0$ at mid-depth of the clay, then apply the NC consolidation equation.`,
      steps: [
        {
          text: "Effective stress at the middle of the clay (7 m depth).",
          tex: String.raw`\sigma'_0 = 17(2) + (19 - 9.81)(3) + (18.5 - 9.81)(2) = 34.00 + 27.57 + 17.38 = 78.95\text{ kPa}`,
        },
        { text: "Final effective stress.", tex: String.raw`\sigma'_f = 78.95 + 60 = 138.95\text{ kPa}` },
        {
          text: "Settlement.",
          tex: String.raw`S_c = \frac{0.35(4)}{1 + 1.10}\log_{10}\!\left(\frac{138.95}{78.95}\right) = 0.6667(0.2455) = 0.1637\text{ m}`,
        },
      ],
      formulaIds: ["hge-f-effective-stress", "hge-f-consolidation-nc"],
      commonErrors: [
        String.raw`Using total stress (128 kPa) instead of effective stress gives 111.3 mm.`,
        String.raw`Dividing by $e_0$ instead of $1 + e_0$ gives 312.5 mm.`,
        String.raw`Using $\ln$ instead of $\log_{10}$ gives 376.9 mm.`,
      ],
    },
    relatedLessonIds: ["hge-l-consolidation-settlement", "hge-l-effective-stress"],
  },
];
