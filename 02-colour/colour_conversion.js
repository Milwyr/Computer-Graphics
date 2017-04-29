function hueToRgb(m1, m2, h) {
    if (h < 0) h = h + 1;
    if (h > 1) h = h - 1;
    if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
    if (h * 2 < 1) return m2;
    if (h * 3 < 2) return m1 + (m2 - m1) * (2/3 - h) * 6;
    return m1;
}

function hslToRgb(h, s, l) {
    var m1, m2;
    if (l <= 0.5)
        m2 = l * (s + 1);
    else
        m2 = l + s - l * s;
    m1 = l * 2 - m2;
    var r = hueToRgb(m1, m2, h + 1/3)
    var g = hueToRgb(m1, m2, h)
    var b = hueToRgb(m1, m2, h - 1/3)
    return {"r": r, "g": g, "b": b};
}