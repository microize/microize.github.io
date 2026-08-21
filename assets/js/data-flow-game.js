/**
 * Pipeline Runner — the 404 page's endless runner.
 *
 * A data packet hops broken pipe segments in the stream. Same one-button
 * game as before; the presentation is rebuilt on the design system:
 *
 *  - Every colour is read live from the CSS custom properties on <html>,
 *    so the canvas follows the light/dark theme instead of baking in hex.
 *  - Motion is time-based (delta seconds), not per-frame, so the game runs
 *    at the same speed on 60Hz and 144Hz displays.
 *  - Game feel: squash & stretch on the hop, motion-trail ghosts, dust
 *    puffs on takeoff/landing, parallax pastel bands, score pops, and a
 *    short freeze + shake on impact.
 *  - `prefers-reduced-motion` drops every decorative effect and eases the
 *    difficulty curve; the game itself stays playable.
 */

const GROUND_Y = 118;         // baseline the packet runs along
const PLAYER_X = 56;          // packet's fixed horizontal position
const PLAYER_SIZE = 18;
const GRAVITY = 1900;         // px/s²
const JUMP_VELOCITY = -520;   // px/s — apex lands ~71px above the ground
const SPEED_BASE = 180;       // px/s at the start of a run
const SPEED_MAX = 420;
const SPEED_RAMP = 0.012;     // px/s gained per px travelled
const SCORE_PER_PX = 1 / 12;
const CLEAR_BONUS = 10;
const TRAIL_LENGTH = 6;
const FREEZE_TIME = 0.12;     // impact hitstop, seconds

class DataFlowGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        this.scoreEl = document.getElementById('gameScore');
        this.highScoreEl = document.getElementById('highScore');
        this.statusEl = document.getElementById('gameStatus');

        this.state = 'idle';                  // idle | running | over
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('dataFlowHighScore') || '0', 10) || 0;

        this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.player = { y: GROUND_Y - PLAYER_SIZE, vy: 0, onGround: true, squash: 0 };
        this.obstacles = [];
        this.motes = [];
        this.dust = [];
        this.pops = [];
        this.trail = [];

        this.distance = 0;
        this.speed = SPEED_BASE;
        this.nextGap = 0;
        this.shake = 0;
        this.freeze = 0;
        this.elapsed = 0;
        this.overSince = 0;
        this.width = 600;

        this.readPalette();
        this.resize();
        this.seedMotes();
        this.bindEvents();
        this.updateUI();
        this.setStatus('Press SPACE or tap to start the flow');

        this.lastTime = performance.now();
        this.frame = requestAnimationFrame(this.tick);
    }

    /* ----------------------------------------------------------------
       Theme + layout
       ---------------------------------------------------------------- */

    /**
     * Pull the design tokens off <html>. Called on boot and again whenever
     * the theme flips, so the canvas repaints in the active palette.
     */
    readPalette() {
        const cs = getComputedStyle(document.documentElement);
        const token = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;

        this.palette = {
            surface: token('--surface', '#ffffff'),
            border: token('--border', 'rgba(0, 0, 0, 0.08)'),
            borderStrong: token('--border-strong', 'rgba(0, 0, 0, 0.16)'),
            textTertiary: token('--text-tertiary', '#86868b'),

            packet: token('--pastel-violet', '#cbceea'),
            packetInk: token('--pastel-violet-ink', '#afb3dc'),
            pipe: token('--pastel-peach', '#f8e2d3'),
            pipeInk: token('--pastel-peach-ink', '#f0cab2'),
            bandFar: token('--pastel-sky', '#cdebf1'),
            bandNear: token('--pastel-leaf', '#def1d0'),
            mote: token('--pastel-sky-ink', '#addce6'),
            gain: token('--pastel-leaf-ink', '#c4e3af'),
            fail: token('--pastel-rose-ink', '#efc9c9'),

            mono: token('--ff-mono', 'monospace')
        };
    }

    /**
     * Size the backing store to the element's real CSS box scaled by the
     * device pixel ratio, then work in logical pixels. The canvas is fluid
     * (`width: 100%`), so the world width follows the viewport.
     */
    resize() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const width = Math.max(240, Math.round(rect.width || 600));
        const height = Math.round(rect.height || 150);

        this.canvas.width = Math.round(width * dpr);
        this.canvas.height = Math.round(height * dpr);
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        this.width = width;
        this.height = height;
    }

    bindEvents() {
        document.addEventListener('keydown', this.onKeyDown);

        this.canvas.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            this.press();
        });

        window.addEventListener('resize', () => this.resize());

        // Follow the theme toggle, and the OS preference when no explicit
        // choice is stored.
        new MutationObserver(() => this.readPalette())
            .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', () => this.readPalette());

        window.matchMedia('(prefers-reduced-motion: reduce)')
            .addEventListener('change', (e) => { this.reduced = e.matches; });
    }

    onKeyDown = (e) => {
        // Leave the spacebar alone when the user is operating a real control.
        const tag = e.target && e.target.tagName;
        if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'TEXTAREA') return;

        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            this.press();
        } else if (e.code === 'KeyR' && this.state === 'over') {
            this.start();
        }
    };

    /** One-button input: start, jump, or restart depending on the state. */
    press() {
        if (this.state === 'running') this.jump();
        else if (this.state === 'idle') this.start();
        // Short lock-out so the keypress that killed you doesn't restart the run.
        else if (this.state === 'over' && this.elapsed - this.overSince > 0.5) this.start();
    }

    /* ----------------------------------------------------------------
       Game state
       ---------------------------------------------------------------- */

    start() {
        this.state = 'running';
        this.score = 0;
        this.distance = 0;
        this.speed = SPEED_BASE;
        this.obstacles = [];
        this.dust = [];
        this.pops = [];
        this.trail = [];
        this.shake = 0;
        this.freeze = 0;
        this.nextGap = this.width * 0.7;
        this.player.y = GROUND_Y - PLAYER_SIZE;
        this.player.vy = 0;
        this.player.onGround = true;
        this.player.squash = 0;

        this.setStatus('Flowing…');
        this.updateUI();
    }

    jump() {
        if (!this.player.onGround) return;
        this.player.vy = JUMP_VELOCITY;
        this.player.onGround = false;
        this.player.squash = -1;             // stretch tall on takeoff
        this.spawnDust(4, 0.6);
    }

    end() {
        this.state = 'over';
        this.overSince = this.elapsed;
        this.freeze = FREEZE_TIME;
        this.shake = this.reduced ? 0 : 1;
        this.trail = [];

        const score = Math.floor(this.score);
        if (score > this.highScore) {
            this.highScore = score;
            localStorage.setItem('dataFlowHighScore', String(this.highScore));
        }

        this.setStatus(`Packet dropped at ${score}. Press R or tap to run it again.`);
        this.updateUI();
    }

    setStatus(text) {
        if (this.statusEl) this.statusEl.textContent = text;
    }

    updateUI() {
        if (this.scoreEl) this.scoreEl.textContent = Math.floor(this.score);
        if (this.highScoreEl) this.highScoreEl.textContent = this.highScore;
    }

    /* ----------------------------------------------------------------
       Simulation
       ---------------------------------------------------------------- */

    tick = (now) => {
        this.frame = requestAnimationFrame(this.tick);

        // Clamp dt so a backgrounded tab doesn't teleport the packet into
        // an obstacle on the frame it returns.
        const dt = Math.min(0.05, (now - this.lastTime) / 1000);
        this.lastTime = now;
        if (document.hidden) return;

        this.elapsed += dt;
        this.update(dt);
        this.draw();
    };

    update(dt) {
        this.decay(dt);

        if (this.state === 'running') {
            if (this.freeze > 0) { this.freeze -= dt; return; }

            this.speed = Math.min(SPEED_MAX, SPEED_BASE + this.distance * SPEED_RAMP * (this.reduced ? 0.6 : 1));
            const travelled = this.speed * dt;
            this.distance += travelled;
            this.score += travelled * SCORE_PER_PX;

            this.updatePlayer(dt);
            this.updateObstacles(travelled);
            this.checkCollisions();
            this.updateUI();
        } else if (this.state === 'idle') {
            // Attract mode: the packet idles with a gentle bob.
            this.player.y = GROUND_Y - PLAYER_SIZE + Math.sin(this.elapsed * 2.4) * (this.reduced ? 0 : 2);
        } else if (this.freeze > 0) {
            this.freeze -= dt;
        }

        this.updateMotes(dt);
    }

    decay(dt) {
        if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 4);
        if (this.player.squash !== 0) {
            const target = 0;
            this.player.squash += (target - this.player.squash) * Math.min(1, dt * 11);
            if (Math.abs(this.player.squash) < 0.01) this.player.squash = 0;
        }

        for (let i = this.dust.length - 1; i >= 0; i--) {
            const d = this.dust[i];
            d.life -= dt;
            d.x += d.vx * dt;
            d.y += d.vy * dt;
            d.vy += 220 * dt;
            if (d.life <= 0) this.dust.splice(i, 1);
        }

        for (let i = this.pops.length - 1; i >= 0; i--) {
            const p = this.pops[i];
            p.life -= dt;
            p.y -= 26 * dt;
            if (p.life <= 0) this.pops.splice(i, 1);
        }
    }

    updatePlayer(dt) {
        const wasAirborne = !this.player.onGround;

        this.player.vy += GRAVITY * dt;
        this.player.y += this.player.vy * dt;

        const floor = GROUND_Y - PLAYER_SIZE;
        if (this.player.y >= floor) {
            this.player.y = floor;
            this.player.vy = 0;
            if (wasAirborne) {
                this.player.onGround = true;
                this.player.squash = 1;      // flatten on impact
                this.spawnDust(6, 1);
            }
        }

        if (!this.reduced && !this.player.onGround) {
            this.trail.unshift({ y: this.player.y, squash: this.player.squash });
            if (this.trail.length > TRAIL_LENGTH) this.trail.pop();
        } else if (this.trail.length) {
            this.trail.pop();
        }
    }

    updateObstacles(travelled) {
        this.nextGap -= travelled;
        if (this.nextGap <= 0) this.spawnObstacle();

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const o = this.obstacles[i];
            o.x -= travelled;

            if (!o.cleared && o.x + o.width < PLAYER_X) {
                o.cleared = true;
                this.score += CLEAR_BONUS;
                this.pops.push({ x: PLAYER_X + 6, y: this.player.y - 6, life: 0.7, maxLife: 0.7 });
            }

            if (o.x + o.width < -40) this.obstacles.splice(i, 1);
        }
    }

    spawnObstacle() {
        // Three silhouettes: a short segment, a tall thin one, and a pair.
        const roll = Math.random();
        const parts = roll < 0.55
            ? [{ dx: 0, w: 14, h: 22 }]
            : roll < 0.82
                ? [{ dx: 0, w: 11, h: 30 }]
                : [{ dx: 0, w: 12, h: 20 }, { dx: 24, w: 12, h: 20 }];

        const width = parts[parts.length - 1].dx + parts[parts.length - 1].w;
        this.obstacles.push({ x: this.width + 8, width, parts, cleared: false });

        // Gap scales with both the viewport and the current speed, so a
        // narrow phone screen still leaves room to react.
        const base = Math.min(300, Math.max(170, this.width * 0.5));
        this.nextGap = base + this.speed * 0.35 + Math.random() * 120;
    }

    checkCollisions() {
        // A few px of forgiveness on both boxes — clipping a corner shouldn't kill.
        const px = PLAYER_X + 3;
        const py = this.player.y + 3;
        const ps = PLAYER_SIZE - 6;

        for (const o of this.obstacles) {
            for (const part of o.parts) {
                const ox = o.x + part.dx + 1;
                const ow = part.w - 2;
                const oy = GROUND_Y - part.h;
                if (px < ox + ow && px + ps > ox && py < GROUND_Y && py + ps > oy) {
                    this.end();
                    return;
                }
            }
        }
    }

    seedMotes() {
        this.motes = [];
        for (let i = 0; i < 22; i++) {
            this.motes.push({
                x: Math.random() * this.width,
                y: Math.random() * (GROUND_Y - 12),
                size: Math.random() * 2 + 1,
                factor: Math.random() * 0.35 + 0.15,
                alpha: Math.random() * 0.3 + 0.12
            });
        }
    }

    updateMotes(dt) {
        if (this.reduced) return;
        const drift = (this.state === 'running' ? this.speed : 40) * dt;
        for (const m of this.motes) {
            m.x -= drift * m.factor;
            if (m.x < -4) {
                m.x = this.width + 4;
                m.y = Math.random() * (GROUND_Y - 12);
            }
        }
    }

    spawnDust(count, force) {
        if (this.reduced) return;
        for (let i = 0; i < count; i++) {
            this.dust.push({
                x: PLAYER_X + PLAYER_SIZE / 2 + (Math.random() - 0.5) * 10,
                y: GROUND_Y - 1,
                vx: (Math.random() - 0.5) * 90 - this.speed * 0.15,
                vy: -Math.random() * 70 * force,
                size: Math.random() * 2 + 1.5,
                life: 0.35 + Math.random() * 0.2,
                maxLife: 0.55
            });
        }
    }

    /* ----------------------------------------------------------------
       Rendering
       ---------------------------------------------------------------- */

    draw() {
        const ctx = this.ctx;
        const p = this.palette;

        ctx.save();
        if (this.shake > 0) {
            const mag = this.shake * 5;
            ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
        }

        ctx.fillStyle = p.surface;
        ctx.fillRect(-8, -8, this.width + 16, this.height + 16);

        this.drawBands();
        this.drawMotes();
        this.drawGround();
        this.drawObstacles();
        this.drawTrail();
        this.drawPlayer();
        this.drawDust();
        this.drawPops();
        this.drawScore();

        ctx.restore();
    }

    /** Two soft pastel bands scrolling at a fraction of the world speed. */
    drawBands() {
        const ctx = this.ctx;
        const layers = [
            { color: this.palette.bandFar, factor: 0.25, y: 34, h: 26, w: 120, gap: 210, alpha: 0.3 },
            { color: this.palette.bandNear, factor: 0.5, y: 68, h: 34, w: 170, gap: 260, alpha: 0.4 }
        ];

        for (const layer of layers) {
            const span = layer.w + layer.gap;
            const shift = this.reduced ? 0 : (this.distance * layer.factor) % span;
            ctx.globalAlpha = layer.alpha;
            ctx.fillStyle = layer.color;
            for (let x = -span; x < this.width + span; x += span) {
                this.roundRect(x - shift, layer.y, layer.w, layer.h, 10);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    }

    drawMotes() {
        const ctx = this.ctx;
        ctx.fillStyle = this.palette.mote;
        for (const m of this.motes) {
            ctx.globalAlpha = m.alpha;
            this.roundRect(m.x, m.y, m.size, m.size, 0.5);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    /** Baseline plus scrolling tick marks, which read as speed. */
    drawGround() {
        const ctx = this.ctx;

        ctx.strokeStyle = this.palette.borderStrong;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y + 0.5);
        ctx.lineTo(this.width, GROUND_Y + 0.5);
        ctx.stroke();

        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = this.palette.border;
        const spacing = 26;
        const shift = this.reduced ? 0 : this.distance % spacing;
        ctx.beginPath();
        for (let x = -spacing; x < this.width + spacing; x += spacing) {
            ctx.moveTo(x - shift, GROUND_Y + 4.5);
            ctx.lineTo(x - shift + 8, GROUND_Y + 4.5);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    /** Broken pipe segments: peach body, deeper flange, a hairline crack. */
    drawObstacles() {
        const ctx = this.ctx;
        for (const o of this.obstacles) {
            for (const part of o.parts) {
                const x = o.x + part.dx;
                const y = GROUND_Y - part.h;

                ctx.fillStyle = this.palette.pipe;
                this.roundRect(x, y, part.w, part.h, 3);
                ctx.fill();

                ctx.strokeStyle = this.palette.pipeInk;
                ctx.lineWidth = 1.25;
                this.roundRect(x + 0.5, y + 0.5, part.w - 1, part.h - 1, 3);
                ctx.stroke();

                ctx.fillStyle = this.palette.pipeInk;
                this.roundRect(x - 2, y, part.w + 4, 4, 2);
                ctx.fill();

                const crackY = y + part.h * 0.55;
                ctx.beginPath();
                ctx.moveTo(x + 2, crackY);
                ctx.lineTo(x + part.w * 0.45, crackY + 3);
                ctx.lineTo(x + part.w - 2, crackY - 1);
                ctx.stroke();
            }
        }
    }

    drawTrail() {
        if (this.reduced || !this.trail.length) return;
        const ctx = this.ctx;
        ctx.fillStyle = this.palette.packet;
        this.trail.forEach((ghost, i) => {
            ctx.globalAlpha = 0.16 * (1 - i / this.trail.length);
            this.drawPacketShape(ghost.y, ghost.squash);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    drawPlayer() {
        const ctx = this.ctx;
        const dead = this.state === 'over';

        // Contact shadow tightens as the packet rises.
        const lift = (GROUND_Y - PLAYER_SIZE - this.player.y) / 70;
        ctx.globalAlpha = 0.12 * (1 - Math.min(0.8, lift));
        ctx.fillStyle = this.palette.borderStrong;
        this.roundRect(PLAYER_X + 2 - lift * 3, GROUND_Y + 1, PLAYER_SIZE - 4 + lift * 6, 3, 1.5);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.fillStyle = dead ? this.palette.fail : this.palette.packet;
        this.drawPacketShape(this.player.y, this.player.squash);
        ctx.fill();

        ctx.strokeStyle = dead ? this.palette.fail : this.palette.packetInk;
        ctx.lineWidth = 1.25;
        ctx.stroke();

        // Two "bits" inside the packet.
        const { sx, sy } = this.squashScale(this.player.squash);
        const cx = PLAYER_X + PLAYER_SIZE / 2;
        const bottom = this.player.y + PLAYER_SIZE;
        ctx.fillStyle = dead ? this.palette.fail : this.palette.packetInk;
        ctx.globalAlpha = 0.85;
        for (const offset of [-3.5, 3.5]) {
            this.roundRect(cx + offset * sx - 1.5, bottom - (PLAYER_SIZE * 0.55) * sy, 3, 3, 1);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    /**
     * Squash & stretch: +1 flattens the packet (landing), -1 stretches it
     * tall and thin (takeoff). Volume is roughly conserved.
     */
    squashScale(squash) {
        if (this.reduced) return { sx: 1, sy: 1 };
        return { sx: 1 + squash * 0.3, sy: 1 - squash * 0.32 };
    }

    /** Builds the packet path anchored to its feet, so squash sits on the ground. */
    drawPacketShape(y, squash) {
        const { sx, sy } = this.squashScale(squash);
        const w = PLAYER_SIZE * sx;
        const h = PLAYER_SIZE * sy;
        const bottom = y + PLAYER_SIZE;
        this.roundRect(PLAYER_X + PLAYER_SIZE / 2 - w / 2, bottom - h, w, h, 4);
    }

    drawDust() {
        const ctx = this.ctx;
        ctx.fillStyle = this.palette.packetInk;
        for (const d of this.dust) {
            ctx.globalAlpha = Math.max(0, d.life / d.maxLife) * 0.5;
            this.roundRect(d.x, d.y, d.size, d.size, 1);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    drawPops() {
        const ctx = this.ctx;
        ctx.font = `600 11px ${this.palette.mono}`;
        ctx.fillStyle = this.palette.gain;
        for (const p of this.pops) {
            ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
            ctx.fillText(`+${CLEAR_BONUS}`, p.x, p.y);
        }
        ctx.globalAlpha = 1;
    }

    drawScore() {
        if (this.state === 'idle') return;
        const ctx = this.ctx;
        ctx.font = `500 12px ${this.palette.mono}`;
        ctx.fillStyle = this.palette.textTertiary;
        ctx.fillText(String(Math.floor(this.score)).padStart(4, '0'), 16, 24);
    }

    /** roundRect with a manual fallback for browsers that lack it. */
    roundRect(x, y, w, h, r) {
        const ctx = this.ctx;
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2));
            return;
        }
        const radius = Math.min(r, w / 2, h / 2);
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + w, y, x + w, y + h, radius);
        ctx.arcTo(x + w, y + h, x, y + h, radius);
        ctx.arcTo(x, y + h, x, y, radius);
        ctx.arcTo(x, y, x + w, y, radius);
        ctx.closePath();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DataFlowGame('dataFlowGame');
});
