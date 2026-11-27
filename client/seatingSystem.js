// =========================================================
// Gather Space - 4-Directional Pixel-Art Seating & Table System
// Crisp 4-orientation (down, up, left, right) sofas, chairs,
// 2-person wooden street benches, and matching coffee/park tables
// arranged into facing conversation groups and clean room corners.
// =========================================================

class SeatingSystem {
  constructor() {
    this.furniture = [];
    this.tables = [];
    this.seats = [];
    this.spriteCache = new Map();
    this.initSprites();
    this.initLayout();
  }

  px(ctx, gx, gy, gw, gh, color, scale = 2.75) {
    ctx.fillStyle = color;
    ctx.fillRect(
      Math.round(gx * scale),
      Math.round(gy * scale),
      Math.max(1, Math.round((gx + gw) * scale) - Math.round(gx * scale)),
      Math.max(1, Math.round((gy + gh) * scale) - Math.round(gy * scale))
    );
  }

  makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { c, ctx };
  }

  mirrorCanvasX(srcCanvas) {
    const { c, ctx } = this.makeCanvas(srcCanvas.width, srcCanvas.height);
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(srcCanvas, 0, 0);
    return c;
  }

  initSprites() {
    const sofaThemes = {
      sofa_beige: {
        outline: '#1e1b24', main: '#cbb494', light: '#e2d2ba',
        dark: '#9e8564', seam: '#7d6649', legs: '#2c221e', trim: null, pillows: false, tufted: false
      },
      sofa_navy: {
        outline: '#171929', main: '#5c6088', light: '#7b80ab',
        dark: '#414568', seam: '#313452', legs: '#a83333', trim: null, pillows: false, tufted: true
      },
      sofa_crimson: {
        outline: '#26060b', main: '#a51222', light: '#c81e30',
        dark: '#7d0c18', seam: '#6e0a15', legs: '#1f0b0d', trim: null, pillows: true, tufted: false
      },
      sofa_sage: {
        outline: '#2d312c', main: '#9cb08f', light: '#b8caa9',
        dark: '#8fa382', seam: '#3d423b', legs: '#2d312c', trim: '#eab965', pillows: false, tufted: true
      },
      sofa_blue: {
        outline: '#111b36', main: '#3b82c4', light: '#7bc0f7',
        dark: '#1a4282', seam: '#193b75', legs: '#8b2932', trim: '#d98c3a', pillows: false, tufted: false
      },
      sofa_teal: {
        outline: '#0d262b', main: '#2c8a8c', light: '#54b4b0',
        dark: '#1a5a60', seam: '#134247', legs: '#2b1b14', trim: null, pillows: false, tufted: true
      },
      sofa_plum: {
        outline: '#271533', main: '#824d8d', light: '#a774b3',
        dark: '#5b3364', seam: '#45244d', legs: '#2b1b14', trim: null, pillows: false, tufted: true
      }
    };

    for (const [key, pal] of Object.entries(sofaThemes)) {
      this.spriteCache.set(`${key}_down`, this.createSofaDown(pal));
      this.spriteCache.set(`${key}_up`, this.createSofaUp(pal));
      const rightSpr = this.createSofaRight(pal);
      this.spriteCache.set(`${key}_right`, rightSpr);
      this.spriteCache.set(`${key}_left`, this.mirrorCanvasX(rightSpr));
    }

    // 1-Seater Plush Lounge Armchairs (Teal & Plum matching Central Lounge)
    const armchairThemes = {
      armchair_teal: { outline: '#0d262b', main: '#2c8a8c', light: '#54b4b0', dark: '#1a5a60', legs: '#2b1b14' },
      armchair_plum: { outline: '#271533', main: '#824d8d', light: '#a774b3', dark: '#5b3364', legs: '#2b1b14' }
    };
    for (const [key, pal] of Object.entries(armchairThemes)) {
      this.spriteCache.set(`${key}_down`, this.createArmchairDown(pal));
      this.spriteCache.set(`${key}_up`, this.createArmchairUp(pal));
      const armRight = this.createArmchairRight(pal);
      this.spriteCache.set(`${key}_right`, armRight);
      this.spriteCache.set(`${key}_left`, this.mirrorCanvasX(armRight));
    }

    // Outdoor 2-Person Wooden Park Bench (4 directions)
    this.spriteCache.set('wood_bench_down', this.createWoodBenchDown());
    this.spriteCache.set('wood_bench_up', this.createWoodBenchUp());
    const benchRight = this.createWoodBenchRight();
    this.spriteCache.set('wood_bench_right', benchRight);
    this.spriteCache.set('wood_bench_left', this.mirrorCanvasX(benchRight));

    // Office Swivel Chair (4 directions)
    this.spriteCache.set('office_chair_down', this.createOfficeChairDown());
    this.spriteCache.set('office_chair_up', this.createOfficeChairUp());
    const offRight = this.createOfficeChairRight();
    this.spriteCache.set('office_chair_right', offRight);
    this.spriteCache.set('office_chair_left', this.mirrorCanvasX(offRight));

    // Cafe / Bistro Chair (4 directions)
    this.spriteCache.set('cafe_chair_down', this.createCafeChairDown());
    this.spriteCache.set('cafe_chair_up', this.createCafeChairUp());
    const cafeRight = this.createCafeChairRight();
    this.spriteCache.set('cafe_chair_right', cafeRight);
    this.spriteCache.set('cafe_chair_left', this.mirrorCanvasX(cafeRight));

    // Matching Tables
    this.spriteCache.set('coffee_table_wood', this.createWoodCoffeeTableSprite());
    this.spriteCache.set('coffee_table_glass', this.createGlassCoffeeTableSprite());
    this.spriteCache.set('park_table_wood', this.createParkWoodTableSprite());
    this.spriteCache.set('bistro_table', this.createBistroTableSprite());
  }

  // --- SOFAS (Down, Up, Right/Left) ---
  createSofaDown(pal) {
    const { c, ctx } = this.makeCanvas(88, 52);
    const p = (x, y, w, h, col) => this.px(ctx, x, y, w, h, col, 2.75);

    p(3, 16, 26, 2, 'rgba(0,0,0,0.24)');
    p(4, 1, 24, 15, pal.outline);
    p(1, 5, 30, 11, pal.outline);

    p(5, 2, 22, 7, pal.main);
    p(5, 2, 22, 1, pal.light);
    if (pal.tufted) {
      [[8, 4], [13, 4], [18, 4], [23, 4], [10, 6], [16, 6], [21, 6]].forEach(([dx, dy]) => p(dx, dy, 1, 1, pal.seam));
    } else {
      p(15, 2, 2, 7, pal.seam);
      p(6, 3, 9, 4, pal.light);
      p(17, 3, 9, 4, pal.light);
    }

    // Armrests (with optional oak pillars for blue sofa)
    if (pal.trim && pal.trim === '#d98c3a') {
      p(2, 5, 3, 3, pal.main); p(2, 8, 3, 7, '#d98c3a'); p(3, 8, 1, 6, '#f2b263');
      p(27, 5, 3, 3, pal.main); p(27, 8, 3, 7, '#d98c3a'); p(28, 8, 1, 6, '#f2b263');
    } else {
      p(2, 6, 4, 9, pal.main); p(2, 6, 3, 2, pal.light); p(5, 7, 1, 7, pal.dark);
      p(26, 6, 4, 9, pal.main); p(27, 6, 3, 2, pal.light); p(26, 7, 1, 7, pal.dark);
    }

    p(6, 9, 20, 4, pal.light);
    p(15, 9, 2, 4, pal.seam);
    p(6, 13, 20, 2, pal.trim === '#eab965' ? '#eab965' : pal.dark);
    p(5, 14, 22, 1, pal.seam);

    if (pal.pillows) {
      p(6, 5, 5, 5, '#468a73'); p(7, 5, 3, 4, '#5eb095'); p(8, 7, 1, 1, '#f48fb1');
      p(21, 6, 5, 4, '#1b479e'); p(22, 6, 3, 3, '#2d63cc');
    }

    p(4, 16, 3, 2, pal.legs);
    p(25, 16, 3, 2, pal.legs);
    return c;
  }

  createSofaUp(pal) {
    const { c, ctx } = this.makeCanvas(88, 52);
    const p = (x, y, w, h, col) => this.px(ctx, x, y, w, h, col, 2.75);

    p(3, 16, 26, 2, 'rgba(0,0,0,0.24)');
    p(1, 3, 30, 13, pal.outline);
    p(4, 1, 24, 15, pal.outline);

    // Upper seat cushion peeking forward (facing UP)
    p(5, 2, 22, 6, pal.light);
    p(15, 2, 2, 6, pal.seam);
    p(6, 3, 8, 3, pal.main);
    p(18, 3, 8, 3, pal.main);

    if (pal.pillows) {
      p(6, 4, 4, 3, '#468a73'); p(22, 4, 4, 3, '#1b479e');
    }

    // Armrests flanking left/right
    p(2, 4, 4, 10, pal.trim === '#d98c3a' ? '#d98c3a' : pal.main);
    p(2, 4, 3, 2, pal.light);
    p(26, 4, 4, 10, pal.trim === '#d98c3a' ? '#d98c3a' : pal.main);
    p(27, 4, 3, 2, pal.light);

    // Tall Backrest facing viewer (at bottom of sprite)
    p(4, 7, 24, 8, pal.main);
    p(4, 7, 24, 2, pal.light);
    p(4, 12, 24, 3, pal.trim === '#eab965' ? '#eab965' : pal.dark);
    if (pal.tufted) {
      [[8, 10], [14, 10], [18, 10], [23, 10]].forEach(([dx, dy]) => p(dx, dy, 1, 1, pal.seam));
    }

    p(4, 16, 3, 2, pal.legs);
    p(25, 16, 3, 2, pal.legs);
    return c;
  }

  createSofaRight(pal) {
    // Vertical sofa (52px wide x 88px tall), backrest on LEFT, cushions facing RIGHT
    const { c, ctx } = this.makeCanvas(52, 88);
    const p = (x, y, w, h, col) => this.px(ctx, x, y, w, h, col, 2.75);

    // Soft side drop shadow
    p(3, 30, 14, 2, 'rgba(0,0,0,0.22)');

    // Outline
    p(1, 2, 16, 28, pal.outline);
    p(2, 1, 14, 30, pal.outline);

    // Left Backrest spine (tall vertical cushion on left)
    p(2, 4, 6, 24, pal.main);
    p(2, 4, 2, 24, pal.light);
    p(7, 5, 1, 22, pal.seam);
    if (pal.tufted) {
      [[4, 8], [4, 13], [4, 18], [4, 23]].forEach(([dx, dy]) => p(dx, dy, 1, 1, pal.seam));
    }

    // Seat cushions extending RIGHT
    p(8, 5, 8, 22, pal.light);
    p(8, 15, 8, 2, pal.seam);
    p(14, 5, 2, 22, pal.dark);
    p(8, 26, 8, 2, pal.trim === '#eab965' ? '#eab965' : pal.dark);

    // Top and Bottom rolled armrests
    p(2, 2, 14, 4, pal.trim === '#d98c3a' ? '#d98c3a' : pal.main);
    p(3, 2, 12, 2, pal.light);
    p(2, 26, 14, 4, pal.trim === '#d98c3a' ? '#d98c3a' : pal.main);
    p(3, 26, 12, 2, pal.light);

    if (pal.pillows) {
      p(6, 6, 4, 4, '#468a73'); p(7, 7, 2, 2, '#5eb095');
      p(6, 21, 4, 4, '#1b479e'); p(7, 22, 2, 2, '#2d63cc');
    }

    // Feet
    p(3, 30, 3, 2, pal.legs);
    p(12, 30, 3, 2, pal.legs);
    return c;
  }

  // --- OUTDOOR WOODEN PARK BENCH (Down, Up, Right/Left) ---
  createWoodBenchDown() {
    const { c, ctx } = this.makeCanvas(88, 50);
    const p = (x, y, w, h, col) => this.px(ctx, x, y, w, h, col, 2.75);

    p(3, 15, 26, 2, 'rgba(0,0,0,0.24)');
    p(3, 2, 2, 14, '#2b1b14'); p(27, 2, 2, 14, '#2b1b14');
    p(4, 2, 24, 3, '#a86028'); p(4, 2, 24, 1, '#d88d48'); p(5, 3, 22, 1, '#c07436');
    p(4, 6, 24, 3, '#9a5420'); p(4, 6, 24, 1, '#cb803e'); p(5, 7, 22, 1, '#b56a2f');
    p(5, 3, 1, 1, '#d1d5db'); p(26, 3, 1, 1, '#d1d5db');
    p(5, 7, 1, 1, '#d1d5db'); p(26, 7, 1, 1, '#d1d5db');

    p(2, 10, 28, 4, '#8b471b'); p(2, 10, 28, 2, '#d88d48'); p(3, 11, 26, 1, '#e6a560');
    p(1, 8, 3, 3, '#3b2419'); p(1, 8, 3, 1, '#b56a2f');
    p(28, 8, 3, 3, '#3b2419'); p(28, 8, 3, 1, '#b56a2f');
    p(4, 14, 3, 3, '#2b1b14'); p(25, 14, 3, 3, '#2b1b14');
    return c;
  }

  createWoodBenchUp() {
    const { c, ctx } = this.makeCanvas(88, 50);
    const p = (x, y, w, h, col) => this.px(ctx, x, y, w, h, col, 2.75);

    p(3, 15, 26, 2, 'rgba(0,0,0,0.24)');
    // Seat planks facing UP
    p(2, 2, 28, 5, '#b56a2f'); p(2, 2, 28, 2, '#e6a560'); p(2, 6, 28, 1, '#6b3612');
    // Iron side armrests
    p(1, 4, 3, 4, '#3b2419'); p(28, 4, 3, 4, '#3b2419');
    // Backrest facing camera at bottom
    p(3, 7, 2, 9, '#2b1b14'); p(27, 7, 2, 9, '#2b1b14');
    p(4, 7, 24, 3, '#a86028'); p(4, 7, 24, 1, '#d88d48');
    p(4, 11, 24, 3, '#8b471b'); p(4, 11, 24, 1, '#cb803e');
    p(4, 14, 3, 3, '#2b1b14'); p(25, 14, 3, 3, '#2b1b14');
    return c;
  }

  createWoodBenchRight() {
    const { c, ctx } = this.makeCanvas(50, 88);
    const p = (x, y, w, h, col) => this.px(ctx, x, y, w, h, col, 2.75);

    p(3, 30, 12, 2, 'rgba(0,0,0,0.22)');
    // Iron frame posts & legs
    p(2, 2, 13, 3, '#2b1b14');
    p(2, 26, 13, 3, '#2b1b14');
    // Left vertical slatted wooden backrest
    p(2, 3, 3, 25, '#8b471b'); p(2, 3, 2, 25, '#d88d48');
    p(5, 3, 3, 25, '#9a5420'); p(5, 3, 1, 25, '#cb803e');
    p(3, 5, 1, 1, '#d1d5db'); p(3, 25, 1, 1, '#d1d5db');
    // Wooden bench planks extending RIGHT
    p(8, 3, 7, 25, '#a86028');
    p(9, 3, 4, 25, '#e6a560');
    p(14, 3, 2, 25, '#542a12');
    // Top & Bottom armrests
    p(3, 2, 11, 3, '#b56a2f'); p(3, 4, 11, 1, '#3b2419');
    p(3, 26, 11, 3, '#b56a2f'); p(3, 28, 11, 1, '#3b2419');
    p(3, 29, 3, 2, '#2b1b14'); p(11, 29, 3, 2, '#2b1b14');
    return c;
  }

  // --- SINGLE OFFICE SWIVEL CHAIR (Down, Up, Right/Left) ---
  createOfficeChairDown() {
    const { c, ctx } = this.makeCanvas(44, 46);
    const p = (x, y, w, h, col) => this.px(ctx, x, y, w, h, col, 2.75);
    p(3, 14, 10, 2, 'rgba(0,0,0,0.24)');
    p(4, 1, 8, 7, '#0f172a'); p(5, 2, 6, 5, '#334155'); p(6, 3, 4, 1, '#38bdf8');
    p(2, 7, 2, 5, '#1e293b'); p(12, 7, 2, 5, '#1e293b');
    p(4, 8, 8, 4, '#1e293b'); p(5, 8, 6, 3, '#475569');
    p(7, 12, 2, 3, '#64748b'); p(4, 14, 8, 1, '#1e293b');
    p(4, 15, 2, 1, '#0f172a'); p(10, 15, 2, 1, '#0f172a');
    return c;
  }

  createOfficeChairUp() {
    const { c, ctx } = this.makeCanvas(44, 46);
    const p = (x, y, w, h, col) => this.px(ctx, x, y, w, h, col, 2.75);
    p(3, 14, 10, 2, 'rgba(0,0,0,0.24)');
    p(4, 2, 8, 4, '#475569');
    p(2, 5, 2, 5, '#1e293b'); p(12, 5, 2, 5, '#1e293b');
    p(4, 5, 8, 8, '#0f172a'); p(5, 6, 6, 6, '#334155'); p(6, 8, 4, 1, '#38bdf8');
    p(7, 13, 2, 2, '#64748b'); p(4, 14, 8, 1, '#1e293b');
    return c;
  }

  createOfficeChairRight() {
    const { c, ctx } = this.makeCanvas(44, 46);
    const p = (x, y, w, h, col) => this.px(ctx, x, y, w, h, col, 2.75);
    p(3, 14, 10, 2, 'rgba(0,0,0,0.24)');
    p(3, 2, 3, 9, '#0f172a'); p(4, 3, 2, 6, '#334155'); p(4, 5, 1, 2, '#38bdf8');
    p(6, 8, 7, 3, '#1e293b'); p(6, 8, 6, 2, '#475569');
    p(6, 6, 5, 2, '#334155');
    p(7, 11, 2, 3, '#64748b'); p(4, 14, 8, 1, '#1e293b');
    p(4, 15, 2, 1, '#0f172a'); p(10, 15, 2, 1, '#0f172a');
    return c;
  }

  // --- SINGLE BISTRO / CAFE CHAIR (Down, Up, Right/Left) ---
  createCafeChairDown() {
    const { c, ctx } = this.makeCanvas(42, 44);
    const p = (x, y, w, h, col) => this.px(ctx, x, y, w, h, col, 2.75);
    p(3, 13, 9, 2, 'rgba(0,0,0,0.22)');
    p(3, 1, 9, 6, '#5c3317'); p(4, 2, 7, 3, '#b87338'); p(4, 2, 7, 1, '#d99658');
    p(3, 7, 9, 4, '#3d2210'); p(4, 7, 7, 3, '#e2d2ba'); p(4, 7, 7, 1, '#f5ebd9');
    p(3, 11, 2, 3, '#4a2812'); p(10, 11, 2, 3, '#4a2812');
    return c;
  }

  createCafeChairUp() {
    const { c, ctx } = this.makeCanvas(42, 44);
    const p = (x, y, w, h, col) => this.px(ctx, x, y, w, h, col, 2.75);
    p(3, 13, 9, 2, 'rgba(0,0,0,0.22)');
    p(4, 3, 7, 3, '#e2d2ba');
    p(3, 5, 9, 7, '#5c3317'); p(4, 6, 7, 4, '#b87338'); p(4, 6, 7, 1, '#d99658');
    p(3, 11, 2, 3, '#4a2812'); p(10, 11, 2, 3, '#4a2812');
    return c;
  }

  createCafeChairRight() {
    const { c, ctx } = this.makeCanvas(42, 44);
    const p = (x, y, w, h, col) => this.px(ctx, x, y, w, h, col, 2.75);
    p(3, 13, 9, 2, 'rgba(0,0,0,0.22)');
    p(3, 2, 3, 9, '#5c3317'); p(4, 2, 2, 7, '#b87338');
    p(6, 7, 6, 4, '#3d2210'); p(6, 7, 5, 3, '#e2d2ba'); p(6, 7, 5, 1, '#f5ebd9');
    p(3, 11, 2, 3, '#4a2812'); p(10, 11, 2, 3, '#4a2812');
    return c;
  }

  // --- SINGLE PLUSH ARMCHAIR (Down, Up, Right/Left) ---
  createArmchairDown(pal) {
    const { c, ctx } = this.makeCanvas(44, 44);
    const p = (x, y, w, h, col) => this.px(ctx, x, y, w, h, col, 2.75);
    p(2, 13, 12, 2, 'rgba(0,0,0,0.24)');
    p(3, 1, 10, 12, pal.outline); p(1, 5, 14, 9, pal.outline);
    p(4, 2, 8, 6, pal.main); p(4, 2, 8, 2, pal.light);
    p(2, 6, 3, 7, pal.main); p(2, 6, 2, 2, pal.light);
    p(11, 6, 3, 7, pal.main); p(12, 6, 2, 2, pal.light);
    p(4, 8, 8, 4, pal.light); p(4, 12, 8, 1, pal.dark);
    p(2, 14, 3, 2, pal.legs); p(11, 14, 3, 2, pal.legs);
    return c;
  }

  createArmchairUp(pal) {
    const { c, ctx } = this.makeCanvas(44, 44);
    const p = (x, y, w, h, col) => this.px(ctx, x, y, w, h, col, 2.75);
    p(2, 13, 12, 2, 'rgba(0,0,0,0.24)');
    p(3, 2, 10, 4, pal.dark); p(4, 2, 8, 2, pal.light);
    p(1, 5, 14, 9, pal.outline); p(3, 4, 10, 10, pal.outline);
    p(2, 6, 3, 7, pal.main); p(11, 6, 3, 7, pal.main);
    p(4, 5, 8, 8, pal.main); p(4, 5, 8, 2, pal.light); p(4, 12, 8, 1, pal.dark);
    p(2, 14, 3, 2, pal.legs); p(11, 14, 3, 2, pal.legs);
    return c;
  }

  createArmchairRight(pal) {
    const { c, ctx } = this.makeCanvas(44, 44);
    const p = (x, y, w, h, col) => this.px(ctx, x, y, w, h, col, 2.75);
    p(2, 13, 12, 2, 'rgba(0,0,0,0.24)');
    // Backrest on left facing right
    p(2, 2, 5, 11, pal.outline);
    p(3, 3, 3, 9, pal.main); p(4, 3, 2, 9, pal.light);
    // Seat cushion extending RIGHT
    p(6, 7, 8, 6, pal.outline);
    p(7, 8, 6, 4, pal.light); p(7, 12, 6, 1, pal.dark);
    // Visible front armrest
    p(5, 5, 8, 3, pal.outline);
    p(6, 6, 6, 2, pal.main); p(6, 6, 5, 1, pal.light);
    p(3, 13, 3, 2, pal.legs); p(10, 13, 3, 2, pal.legs);
    return c;
  }

  // --- TABLES ---
  createWoodCoffeeTableSprite() {
    const { c, ctx } = this.makeCanvas(70, 34);
    const p = (x, y, w, h, col) => this.px(ctx, x, y, w, h, col, 2.5);
    p(2, 10, 24, 3, 'rgba(0,0,0,0.22)');
    p(3, 8, 2, 5, '#4a2711'); p(23, 8, 2, 5, '#4a2711');
    p(1, 2, 26, 8, '#3b1f0e'); p(2, 2, 24, 6, '#c77f3c'); p(2, 2, 24, 1, '#e3a25f'); p(2, 7, 24, 2, '#8a4c1d');
    p(5, 3, 6, 3, '#f8fafc'); p(7, 3, 1, 3, '#cbd5e1'); p(5, 4, 2, 1, '#64748b');
    p(19, 3, 3, 3, '#f1f5f9'); p(20, 4, 1, 1, '#6f4e37'); p(22, 4, 1, 1, '#cbd5e1');
    return c;
  }

  createGlassCoffeeTableSprite() {
    const { c, ctx } = this.makeCanvas(70, 34);
    const p = (x, y, w, h, col) => this.px(ctx, x, y, w, h, col, 2.5);
    p(2, 10, 24, 3, 'rgba(0,0,0,0.22)');
    p(3, 8, 2, 5, '#1e293b'); p(23, 8, 2, 5, '#1e293b');
    p(1, 2, 26, 8, '#0f172a'); p(2, 3, 24, 5, '#7dd3fc'); p(2, 3, 24, 4, '#bae6fd');
    p(5, 3, 2, 4, '#e0f2fe'); p(7, 3, 1, 4, '#ffffff');
    p(7, 3, 3, 3, '#d97706'); p(7, 2, 3, 2, '#22c55e');
    p(17, 4, 5, 3, '#334155'); p(18, 4, 3, 2, '#38bdf8');
    return c;
  }

  createParkWoodTableSprite() {
    const { c, ctx } = this.makeCanvas(60, 32);
    const p = (x, y, w, h, col) => this.px(ctx, x, y, w, h, col, 2.5);
    p(2, 9, 20, 3, 'rgba(0,0,0,0.24)');
    p(3, 7, 2, 5, '#2b1b14'); p(19, 7, 2, 5, '#2b1b14');
    p(1, 2, 22, 7, '#3b1f0e'); p(2, 2, 20, 5, '#b86c2f'); p(2, 2, 20, 1, '#de9350'); p(2, 4, 20, 1, '#8c4b1c'); p(2, 7, 20, 1, '#6b3612');
    p(5, 3, 2, 2, '#f8fafc'); p(17, 3, 2, 2, '#f8fafc');
    p(11, 2, 2, 3, '#1e293b'); p(11, 3, 2, 1, '#fbbf24');
    return c;
  }

  createBistroTableSprite() {
    const { c, ctx } = this.makeCanvas(44, 32);
    const p = (x, y, w, h, col) => this.px(ctx, x, y, w, h, col, 2.5);
    p(4, 10, 10, 2, 'rgba(0,0,0,0.22)');
    p(8, 7, 2, 4, '#334155'); p(6, 10, 6, 1, '#1e293b');
    p(3, 2, 12, 6, '#4a2711'); p(2, 3, 14, 4, '#4a2711');
    p(3, 3, 12, 4, '#d99658'); p(4, 3, 10, 2, '#ecc08a');
    p(8, 3, 2, 2, '#ffffff');
    return c;
  }

  getSpriteKey(type, facing) {
    const dir = facing || 'down';
    return `${type}_${dir}`;
  }

  addSeatingItem(config) {
    const TILE = 32;
    const cx = config.tx * TILE;
    const cy = config.ty * TILE;
    const facing = config.facing || 'down';
    const sprKey = this.getSpriteKey(config.type, facing);
    const sprite = this.spriteCache.get(sprKey);
    const w = sprite ? sprite.width : 88;
    const h = sprite ? sprite.height : 50;
    const isDouble = config.type.startsWith('sofa_') || config.type === 'wood_bench';
    const isVertical = (facing === 'left' || facing === 'right');

    const item = {
      id: config.id,
      groupId: config.groupId || config.id,
      type: config.type,
      spriteKey: sprKey,
      roomId: config.roomId || 'street',
      x: cx,
      y: cy,
      width: w,
      height: h,
      facing,
      isDouble
    };
    this.furniture.push(item);

    if (isDouble) {
      if (isVertical) {
        // Vertical 2-seater sofa/bench: two seats stacked top/bottom facing left or right
        const seatShiftX = facing === 'right' ? 4 : -4;
        this.seats.push({
          id: `${config.id}_T`,
          furnitureId: config.id,
          groupId: item.groupId,
          roomId: item.roomId,
          type: config.type,
          x: Math.round(cx + seatShiftX),
          y: Math.round(cy - 18),
          facing
        });
        this.seats.push({
          id: `${config.id}_B`,
          furnitureId: config.id,
          groupId: item.groupId,
          roomId: item.roomId,
          type: config.type,
          x: Math.round(cx + seatShiftX),
          y: Math.round(cy + 18),
          facing
        });
      } else {
        // Horizontal 2-seater sofa/bench: two seats side-by-side facing down or up
        const seatShiftY = facing === 'up' ? -2 : 4;
        this.seats.push({
          id: `${config.id}_L`,
          furnitureId: config.id,
          groupId: item.groupId,
          roomId: item.roomId,
          type: config.type,
          x: Math.round(cx - 20),
          y: Math.round(cy + seatShiftY),
          facing
        });
        this.seats.push({
          id: `${config.id}_R`,
          furnitureId: config.id,
          groupId: item.groupId,
          roomId: item.roomId,
          type: config.type,
          x: Math.round(cx + 20),
          y: Math.round(cy + seatShiftY),
          facing
        });
      }
    } else {
      this.seats.push({
        id: `${config.id}_S`,
        furnitureId: config.id,
        groupId: item.groupId,
        roomId: item.roomId,
        type: config.type,
        x: Math.round(cx),
        y: Math.round(cy + 3),
        facing
      });
    }
  }

  addTable(config) {
    const TILE = 32;
    const cx = config.tx * TILE;
    const cy = config.ty * TILE;
    const sprite = this.spriteCache.get(config.type);
    const w = sprite ? sprite.width : 68;
    const h = sprite ? sprite.height : 34;
    this.tables.push({
      id: config.id,
      type: config.type,
      roomId: config.roomId || 'street',
      x: Math.round(cx),
      y: Math.round(cy),
      width: w,
      height: h
    });
  }

  initLayout() {
    this.furniture = [];
    this.tables = [];
    this.seats = [];

    // Helper: place a symmetric FACING PAIR of seats across a centered table!
    // Horizontal pair (facing 'right' <-> 'left' across center table)
    const addFacingPairLR = (prefix, roomId, leftType, rightType, tableType, centerTx, centerTy, spanTx = 2.3) => {
      this.addSeatingItem({ id: `${prefix}_L`, groupId: prefix, type: leftType, roomId, tx: centerTx - spanTx, ty: centerTy, facing: 'right' });
      this.addTable({ id: `${prefix}_tbl`, type: tableType, roomId, tx: centerTx, ty: centerTy });
      this.addSeatingItem({ id: `${prefix}_R`, groupId: prefix, type: rightType, roomId, tx: centerTx + spanTx, ty: centerTy, facing: 'left' });
    };

    // Vertical pair (facing 'down' <-> 'up' across center table)
    const addFacingPairDU = (prefix, roomId, topType, bottomType, tableType, centerTx, centerTy, spanTy = 1.45) => {
      this.addSeatingItem({ id: `${prefix}_U`, groupId: prefix, type: topType, roomId, tx: centerTx, ty: centerTy - spanTy, facing: 'down' });
      this.addTable({ id: `${prefix}_tbl`, type: tableType, roomId, tx: centerTx, ty: centerTy });
      this.addSeatingItem({ id: `${prefix}_D`, groupId: prefix, type: bottomType, roomId, tx: centerTx, ty: centerTy + spanTy, facing: 'up' });
    };

    // === 1. RECEPTION (Sảnh Lễ Tân) ===
    // Corner Waiting Groups leaving center spawn floor (x: 50..58, y: 66..71) 100% open & clean!
    addFacingPairLR('rec_west_group', 'reception', 'sofa_beige', 'cafe_chair', 'coffee_table_glass', 47.4, 70.6, 2.0);
    addFacingPairDU('rec_east_group', 'reception', 'sofa_blue', 'sofa_navy', 'coffee_table_glass', 63.6, 72.2, 1.5);

    // === 2. CENTRAL LOUNGE ===
    // North-Center open hardwood reading group (left <-> right facing across table)
    addFacingPairLR('cl_north_group', 'central_lounge', 'sofa_beige', 'sofa_beige', 'coffee_table_wood', 54.6, 35.4, 2.4);
    // Center Persian Carpet Fireplace Lounge (All 4 pieces share conversation group cl_carpet_fireplace!)
    this.addSeatingItem({ id: 'cl_carpet_N', groupId: 'cl_carpet_fireplace', type: 'sofa_plum', roomId: 'central_lounge', tx: 54.5, ty: 39.4, facing: 'down' });
    this.addSeatingItem({ id: 'cl_carpet_S', groupId: 'cl_carpet_fireplace', type: 'sofa_teal', roomId: 'central_lounge', tx: 54.5, ty: 44.0, facing: 'up' });
    this.addSeatingItem({ id: 'cl_carpet_W', groupId: 'cl_carpet_fireplace', type: 'armchair_teal', roomId: 'central_lounge', tx: 51.5, ty: 41.8, facing: 'right' });
    this.addSeatingItem({ id: 'cl_carpet_E', groupId: 'cl_carpet_fireplace', type: 'armchair_plum', roomId: 'central_lounge', tx: 57.5, ty: 41.8, facing: 'left' });
    // West coffee-bar nook (two bistro chairs facing each other)
    addFacingPairLR('cl_west_bistro', 'central_lounge', 'cafe_chair', 'cafe_chair', 'bistro_table', 47.0, 41.2, 1.5);
    // East acoustic corner sofa + table tucked cleanly between piano and lower lounge
    addFacingPairLR('cl_east_group', 'central_lounge', 'cafe_chair', 'sofa_crimson', 'coffee_table_glass', 62.6, 40.6, 2.0);
    // South-East Round Boho Rug Tea Pair (two plush armchairs facing each other across cake table)
    this.addSeatingItem({ id: 'cl_boho_L', groupId: 'cl_boho', type: 'armchair_teal', roomId: 'central_lounge', tx: 61.1, ty: 46.5, facing: 'right' });
    this.addSeatingItem({ id: 'cl_boho_R', groupId: 'cl_boho', type: 'armchair_plum', roomId: 'central_lounge', tx: 63.9, ty: 46.5, facing: 'left' });

    // === 3. ZEN GARDEN ===
    // North stone terrace overlooking Koi Pond (two sage sofas facing each other across wood tea table)
    addFacingPairLR('zen_north_group', 'zen_garden', 'sofa_sage', 'sofa_sage', 'coffee_table_wood', 29.2, 35.0, 2.4);
    // South stone terrace facing benches beside bamboo grove
    addFacingPairLR('zen_south_group', 'zen_garden', 'wood_bench', 'wood_bench', 'park_table_wood', 29.5, 47.8, 2.3);

    // === 4. OPEN WORKSPACE (Coworking) ===
    // East Open Collaboration Lounge (centered in open floor 26..33, y: 66)
    addFacingPairLR('cw_east_lounge', 'open_workspace', 'sofa_blue', 'sofa_blue', 'coffee_table_glass', 29.2, 66.2, 2.4);
    // South-Center Lounge Group (centered below central workstations 15..22, y: 73.2)
    addFacingPairLR('cw_south_lounge', 'open_workspace', 'sofa_beige', 'sofa_sage', 'coffee_table_wood', 18.5, 73.2, 2.4);
    // Workstation swivel chairs facing inward toward central blueprint bench
    this.addSeatingItem({ id: 'cw_chair_1', groupId: 'cw_bench', type: 'office_chair', roomId: 'open_workspace', tx: 16.0, ty: 65.2, facing: 'down' });
    this.addSeatingItem({ id: 'cw_chair_2', groupId: 'cw_bench', type: 'office_chair', roomId: 'open_workspace', tx: 19.5, ty: 65.2, facing: 'down' });
    this.addSeatingItem({ id: 'cw_chair_3', groupId: 'cw_bench', type: 'office_chair', roomId: 'open_workspace', tx: 16.0, ty: 69.8, facing: 'up' });
    this.addSeatingItem({ id: 'cw_chair_4', groupId: 'cw_bench', type: 'office_chair', roomId: 'open_workspace', tx: 19.5, ty: 69.8, facing: 'up' });

    // === 5. LARGE BOARDROOM ===
    // South-West Corner Lounge (facing group)
    addFacingPairLR('br_sw_corner', 'large_boardroom', 'sofa_beige', 'cafe_chair', 'coffee_table_wood', 16.0, 21.6, 2.0);
    // South-East Corner Lounge (facing group)
    addFacingPairLR('br_se_corner', 'large_boardroom', 'cafe_chair', 'sofa_navy', 'coffee_table_glass', 25.4, 20.6, 2.0);
    // Executive U-Table Chairs facing the U-Table
    this.addSeatingItem({ id: 'br_chair_1', groupId: 'br_utable', type: 'office_chair', roomId: 'large_boardroom', tx: 16.2, ty: 14.5, facing: 'right' });
    this.addSeatingItem({ id: 'br_chair_2', groupId: 'br_utable', type: 'office_chair', roomId: 'large_boardroom', tx: 16.2, ty: 16.2, facing: 'right' });
    this.addSeatingItem({ id: 'br_chair_3', groupId: 'br_utable', type: 'office_chair', roomId: 'large_boardroom', tx: 23.8, ty: 14.5, facing: 'left' });
    this.addSeatingItem({ id: 'br_chair_4', groupId: 'br_utable', type: 'office_chair', roomId: 'large_boardroom', tx: 23.8, ty: 16.2, facing: 'left' });
    this.addSeatingItem({ id: 'br_chair_5', groupId: 'br_utable', type: 'office_chair', roomId: 'large_boardroom', tx: 19.0, ty: 12.0, facing: 'down' });
    this.addSeatingItem({ id: 'br_chair_6', groupId: 'br_utable', type: 'office_chair', roomId: 'large_boardroom', tx: 21.0, ty: 12.0, facing: 'down' });

    // === 6. SMALL MEETING POD ===
    // Open North-Center Interview Lounge (facing group)
    addFacingPairLR('mp_lounge', 'small_meeting', 'sofa_blue', 'sofa_blue', 'coffee_table_glass', 12.6, 36.8, 2.3);
    // Oval Huddle Table Chairs facing the oval table
    this.addSeatingItem({ id: 'mp_chair_1', groupId: 'mp_oval', type: 'office_chair', roomId: 'small_meeting', tx: 11.4, ty: 40.6, facing: 'down' });
    this.addSeatingItem({ id: 'mp_chair_2', groupId: 'mp_oval', type: 'office_chair', roomId: 'small_meeting', tx: 13.6, ty: 40.6, facing: 'down' });
    this.addSeatingItem({ id: 'mp_chair_3', groupId: 'mp_oval', type: 'office_chair', roomId: 'small_meeting', tx: 11.4, ty: 44.6, facing: 'up' });
    this.addSeatingItem({ id: 'mp_chair_4', groupId: 'mp_oval', type: 'office_chair', roomId: 'small_meeting', tx: 13.6, ty: 44.6, facing: 'up' });

    // === 7. CEO PRIVATE OFFICE ===
    // Open South-Center VIP Visitor Group (clear of entrance at x:79..82, y:20)
    addFacingPairLR('ceo_lounge', 'private_office_1', 'cafe_chair', 'sofa_crimson', 'coffee_table_glass', 81.0, 17.5, 2.0);
    this.addSeatingItem({ id: 'ceo_chair_1', type: 'office_chair', roomId: 'private_office_1', tx: 80.0, ty: 12.6, facing: 'down' });

    // === 8. DIRECTOR PRIVATE OFFICE ===
    // Open South Lounge Group
    addFacingPairLR('dir_lounge', 'private_office_2', 'sofa_navy', 'cafe_chair', 'coffee_table_glass', 96.5, 17.6, 2.0);
    this.addSeatingItem({ id: 'dir_chair_1', type: 'office_chair', roomId: 'private_office_2', tx: 97.0, ty: 11.4, facing: 'down' });

    // === 9. PM STUDIO ===
    // North Bistro Meeting Nook
    addFacingPairLR('pm_nook', 'private_office_3', 'cafe_chair', 'cafe_chair', 'bistro_table', 80.2, 29.0, 1.6);
    this.addSeatingItem({ id: 'pm_chair_1', type: 'office_chair', roomId: 'private_office_3', tx: 80.0, ty: 34.4, facing: 'up' });

    // === 10. FOCUS POD ===
    // North Quiet Corner
    addFacingPairLR('fp_nook', 'private_office_4', 'sofa_sage', 'cafe_chair', 'coffee_table_wood', 97.2, 29.2, 2.0);
    this.addSeatingItem({ id: 'fp_chair_1', type: 'office_chair', roomId: 'private_office_4', tx: 97.0, ty: 34.5, facing: 'up' });

    // === 11. LIBRARY ROOM ===
    // Open East Reading Wing (two facing library sofas across oak reading table!)
    addFacingPairLR('lib_east_group', 'library_room', 'sofa_beige', 'sofa_navy', 'coffee_table_wood', 98.6, 51.6, 2.4);
    // Grand Reading Table Chairs facing the table
    this.addSeatingItem({ id: 'lib_chair_1', groupId: 'lib_table', type: 'office_chair', roomId: 'library_room', tx: 85.0, ty: 50.6, facing: 'down' });
    this.addSeatingItem({ id: 'lib_chair_2', groupId: 'lib_table', type: 'office_chair', roomId: 'library_room', tx: 89.0, ty: 50.6, facing: 'down' });
    this.addSeatingItem({ id: 'lib_chair_3', groupId: 'lib_table', type: 'office_chair', roomId: 'library_room', tx: 85.0, ty: 54.4, facing: 'up' });
    this.addSeatingItem({ id: 'lib_chair_4', groupId: 'lib_table', type: 'office_chair', roomId: 'library_room', tx: 89.0, ty: 54.4, facing: 'up' });

    // === 12. QUIET LOUNGE (VIP) ===
    // North-Center Crimson Conversation Pair (clear of built-in diamond rug)
    addFacingPairLR('ql_north_group', 'quiet_lounge', 'sofa_crimson', 'sofa_crimson', 'coffee_table_glass', 87.2, 65.4, 2.4);
    // East Acoustic Nook
    addFacingPairLR('ql_east_group', 'quiet_lounge', 'sofa_sage', 'cafe_chair', 'coffee_table_wood', 99.6, 67.6, 2.0);

    // === 13. PANTRY BAR ===
    // Cozy Open Tile Cafe Corner
    addFacingPairLR('pan_cafe_group', 'pantry_bar', 'sofa_sage', 'cafe_chair', 'coffee_table_wood', 49.2, 18.6, 2.0);
    this.addSeatingItem({ id: 'pan_chair_1', groupId: 'pan_bar', type: 'cafe_chair', roomId: 'pantry_bar', tx: 46.5, ty: 15.2, facing: 'up' });
    this.addSeatingItem({ id: 'pan_chair_2', groupId: 'pan_bar', type: 'cafe_chair', roomId: 'pantry_bar', tx: 48.2, ty: 15.2, facing: 'up' });

    // === 14. CAFETERIA DINING ===
    // South-East Corner Dining Group
    addFacingPairLR('caf_se_group', 'cafeteria_dining', 'sofa_beige', 'cafe_chair', 'coffee_table_wood', 62.0, 21.6, 2.0);
    this.addSeatingItem({ id: 'caf_chair_1', groupId: 'caf_bar', type: 'cafe_chair', roomId: 'cafeteria_dining', tx: 58.2, ty: 13.8, facing: 'up' });
    this.addSeatingItem({ id: 'caf_chair_2', groupId: 'caf_bar', type: 'cafe_chair', roomId: 'cafeteria_dining', tx: 60.2, ty: 13.8, facing: 'up' });
    this.addSeatingItem({ id: 'caf_chair_3', groupId: 'caf_bar', type: 'cafe_chair', roomId: 'cafeteria_dining', tx: 62.0, ty: 13.8, facing: 'up' });

    // === 15. OUTDOOR 4 EMPTY CORNERS (4 cụm bàn + ghế gỗ tại 4 góc trống của map) ===
    addFacingPairLR('corner_nw', 'street', 'wood_bench', 'wood_bench', 'park_table_wood', 6.8, 4.6, 2.3);
    addFacingPairLR('corner_ne', 'street', 'wood_bench', 'wood_bench', 'park_table_wood', 111.5, 6.2, 2.3);
    addFacingPairLR('corner_sw', 'street', 'wood_bench', 'wood_bench', 'park_table_wood', 8.5, 88.0, 2.3);
    addFacingPairLR('corner_se', 'street', 'wood_bench', 'wood_bench', 'park_table_wood', 111.5, 88.0, 2.3);

    // === 16. OUTDOOR WALL-HUGGING PARK WOODEN DOUBLE BENCHES (Đặt rải rác trên thảm cỏ sát vách nhà, tránh nền đá) ===
    this.addSeatingItem({ id: 'park_wall_br_w', type: 'wood_bench', roomId: 'street', tx: 9.0, ty: 24.95, facing: 'down' });
    this.addSeatingItem({ id: 'park_wall_br_e', type: 'wood_bench', roomId: 'street', tx: 26.5, ty: 24.95, facing: 'down' });
    this.addSeatingItem({ id: 'park_wall_zen_n', type: 'wood_bench', roomId: 'street', tx: 27.5, ty: 31.05, facing: 'up' });
    this.addSeatingItem({ id: 'park_wall_cw_n1', type: 'wood_bench', roomId: 'street', tx: 16.8, ty: 57.05, facing: 'up' });
    this.addSeatingItem({ id: 'park_wall_cw_n2', type: 'wood_bench', roomId: 'street', tx: 32.8, ty: 57.05, facing: 'up' });
    this.addSeatingItem({ id: 'park_wall_cl_nw', type: 'wood_bench', roomId: 'street', tx: 49.8, ty: 31.05, facing: 'up' });
    this.addSeatingItem({ id: 'park_wall_cl_ne', type: 'wood_bench', roomId: 'street', tx: 57.9, ty: 31.05, facing: 'up' });
    this.addSeatingItem({ id: 'park_wall_cl_s', type: 'wood_bench', roomId: 'street', tx: 45.8, ty: 50.95, facing: 'down' });
    this.addSeatingItem({ id: 'park_wall_cl_w', type: 'wood_bench', roomId: 'street', tx: 42.05, ty: 45.2, facing: 'left' });
    this.addSeatingItem({ id: 'park_wall_rec_w', type: 'wood_bench', roomId: 'street', tx: 42.05, ty: 65.5, facing: 'left' });
    this.addSeatingItem({ id: 'park_wall_lib_w', type: 'wood_bench', roomId: 'street', tx: 73.05, ty: 55.6, facing: 'left' });
    this.addSeatingItem({ id: 'park_wall_lib_s', type: 'wood_bench', roomId: 'street', tx: 98.0, ty: 60.0, facing: 'down' });

    console.log(`[Seating] Architectural layout ready: ${this.furniture.length} 4-dir seats, ${this.tables.length} tables, ${this.seats.length} slots.`);
  }

  areSeatsInSameGroup(seatIdA, seatIdB) {
    if (!seatIdA || !seatIdB) return false;
    const seatA = this.seats.find(s => s.id === seatIdA);
    const seatB = this.seats.find(s => s.id === seatIdB);
    return !!(seatA && seatB && seatA.groupId && seatA.groupId === seatB.groupId);
  }

  isSeatOccupied(seatId, localPlayer, remotePlayers) {
    if (localPlayer && localPlayer.isSitting && localPlayer.seatId === seatId) return true;
    if (remotePlayers) {
      for (const rp of remotePlayers.values()) {
        if (rp.isSitting && rp.seatId === seatId) return true;
      }
    }
    return false;
  }

  isPointOnSeatFurniture(worldX, worldY, seatId) {
    if (!seatId) return null;
    const seat = this.seats.find(s => s.id === seatId);
    if (!seat) return null;
    const f = this.furniture.find(item => item.id === seat.furnitureId);
    if (!f) return null;
    const hit = (
      worldX >= f.x - f.width / 2 - 6 &&
      worldX <= f.x + f.width / 2 + 6 &&
      worldY >= f.y - f.height / 2 - 6 &&
      worldY <= f.y + f.height / 2 + 6
    );
    return hit ? seat : null;
  }

  findSeatAt(worldX, worldY, localPlayer, remotePlayers) {
    for (let i = 0; i < this.furniture.length; i++) {
      const f = this.furniture[i];
      if (
        worldX >= f.x - f.width / 2 - 6 &&
        worldX <= f.x + f.width / 2 + 6 &&
        worldY >= f.y - f.height / 2 - 6 &&
        worldY <= f.y + f.height / 2 + 6
      ) {
        const itemSeats = this.seats
          .filter(s => s.furnitureId === f.id && !this.isSeatOccupied(s.id, localPlayer, remotePlayers))
          .sort((a, b) => Math.hypot(a.x - worldX, a.y - worldY) - Math.hypot(b.x - worldX, b.y - worldY));
        if (itemSeats.length > 0) {
          return itemSeats[0];
        }
      }
    }
    return null;
  }

  findNearestAvailableSeat(px, py, maxDist = 60, localPlayer = null, remotePlayers = null) {
    let best = null;
    let bestDist = maxDist;
    for (let i = 0; i < this.seats.length; i++) {
      const s = this.seats[i];
      if (this.isSeatOccupied(s.id, localPlayer, remotePlayers)) continue;
      const d = Math.hypot(s.x - px, s.y - py);
      if (d <= bestDist) {
        bestDist = d;
        best = s;
      }
    }
    return best;
  }

  renderFurniture(ctx, camera, canvas, localPlayer, remotePlayers) {
    if (!this.furniture || !this.furniture.length) return;

    const halfW = (canvas.width / 2) / (camera.zoom || 1) + 140;
    const halfH = (canvas.height / 2) / (camera.zoom || 1) + 140;
    const vLeft = camera.x - halfW;
    const vRight = camera.x + halfW;
    const vTop = camera.y - halfH;
    const vBottom = camera.y + halfH;

    let nearestPromptSeat = null;
    if (localPlayer && !localPlayer.isSitting) {
      nearestPromptSeat = this.findNearestAvailableSeat(localPlayer.x, localPlayer.y, 60, localPlayer, remotePlayers);
    }

    for (let i = 0; i < this.furniture.length; i++) {
      const f = this.furniture[i];
      if (f.x < vLeft || f.x > vRight || f.y < vTop || f.y > vBottom) continue;

      const sprite = this.spriteCache.get(f.spriteKey);
      if (sprite) {
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(sprite, Math.round(f.x - f.width / 2), Math.round(f.y - f.height / 2));
        ctx.restore();
      }
    }

    if (nearestPromptSeat) {
      ctx.save();
      const px = nearestPromptSeat.x;
      const py = nearestPromptSeat.y - 32;
      const label = 'E · Ngồi';
      ctx.font = 'bold 10px Inter, sans-serif';
      const w = ctx.measureText(label).width + 14;
      const h = 18;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
      ctx.beginPath();
      ctx.roundRect(px - w / 2, py - h / 2, w, h, 9);
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.78)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#e0f2fe';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, px, py + 0.5);
      ctx.restore();
    }
  }
}

window.SeatingSystem = SeatingSystem;
