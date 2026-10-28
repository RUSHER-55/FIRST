/**
 * APPLICATION CONTROLLER & INTERACTION SYSTEM
 * Developed for ANIKETBHAI PANARA - Turing Enigma Portfolio
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. INITIALIZE ANTI-GRAVITY PHYSICS ENGINE
     ========================================================================== */
  const engine = new AntiGravityEngine('anti-gravity-canvas');
  window.antiGravity = engine;

  /* ==========================================================================
     2. 3D GLASSMORPHIC CARD INTERACTIVE TILT
     ========================================================================== */
  const tiltWrapper = document.getElementById('tilt-wrapper');
  const glassCard = document.getElementById('glass-card');

  if (tiltWrapper && glassCard) {
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let isHovered = false;

    const maxTilt = 12; // Maximum tilt angle in degrees

    tiltWrapper.addEventListener('mousemove', (e) => {
      isHovered = true;
      const rect = tiltWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const normX = (x / rect.width) * 2 - 1; // -1 to 1
      const normY = (y / rect.height) * 2 - 1;

      targetY = normX * maxTilt;
      targetX = -normY * maxTilt;

      // Update dynamic specular reflection spot
      const overlay = glassCard.querySelector('.card-glow-overlay');
      if (overlay) {
        overlay.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 240, 255, 0.16) 0%, rgba(176, 38, 255, 0.08) 35%, transparent 70%)`;
      }
    });

    tiltWrapper.addEventListener('mouseleave', () => {
      isHovered = false;
      targetX = 0;
      targetY = 0;
    });

    // Gyroscope tilt support for mobile devices
    if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
      window.addEventListener('deviceorientation', (e) => {
        if (e.beta !== null && e.gamma !== null) {
          // beta: front-back tilt [-180, 180], gamma: left-right tilt [-90, 90]
          targetX = Math.max(-10, Math.min(10, (e.beta - 45) * 0.4));
          targetY = Math.max(-10, Math.min(10, e.gamma * 0.4));
        }
      }, { passive: true });
    }

    // Smooth Spring Interpolation Loop
    function animateCardTilt() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      glassCard.style.transform = `rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg)`;
      requestAnimationFrame(animateCardTilt);
    }
    animateCardTilt();
  }

  /* ==========================================================================
     3. AUDIO SYNTHESIS & SFX SYSTEM
     ========================================================================== */
  const audioBtn = document.getElementById('audio-toggle-btn');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const isEnabled = window.soundFX.toggle();
      const icon = audioBtn.querySelector('.audio-icon');
      const text = audioBtn.querySelector('.audio-text');

      if (isEnabled) {
        icon.textContent = '🔊';
        text.textContent = 'SFX ON';
        audioBtn.classList.add('active');
        window.soundFX.playClick();
      } else {
        icon.textContent = '🔇';
        text.textContent = 'SFX OFF';
        audioBtn.classList.remove('active');
      }
    });
  }

  // Bind global hover and click sounds
  document.querySelectorAll('[data-sound="hover"]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (window.soundFX) window.soundFX.playHover();
    });
  });

  document.querySelectorAll('[data-sound="click"]').forEach(el => {
    el.addEventListener('click', () => {
      if (window.soundFX) window.soundFX.playClick();
    });
  });

  /* ==========================================================================
     4. HERO CONTROLS & GRAVITATIONAL SHOCKWAVES
     ========================================================================== */
  const triggerCenterBurst = () => {
    const rect = glassCard ? glassCard.getBoundingClientRect() : null;
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    engine.triggerShockwave(x, y, 2.2);
  };

  const shockBtn = document.getElementById('shockwave-btn');
  if (shockBtn) {
    shockBtn.addEventListener('click', triggerCenterBurst);
  }

  const hudShockBtn = document.getElementById('hud-shockwave-btn');
  if (hudShockBtn) {
    hudShockBtn.addEventListener('click', () => {
      engine.triggerShockwave(window.innerWidth / 2, window.innerHeight * 0.7, 2.0);
    });
  }

  // HUD Gravity Selector
  const gravitySelect = document.getElementById('gravity-mode-select');
  if (gravitySelect) {
    gravitySelect.addEventListener('change', (e) => {
      engine.setGravityMode(e.target.value);
      printTerminalLine(`Gravity field mode transitioned to: [${e.target.value.toUpperCase()}]`, 'term-highlight');
    });
  }

  // HUD Theme Selector
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      const selected = e.target.value;
      engine.setTheme(selected);

      document.body.className = '';
      document.body.classList.add(`theme-${selected}`);
      printTerminalLine(`Interface palette switched to: [${selected.toUpperCase()}]`, 'term-success');
    });
  }

  /* ==========================================================================
     5. PROJECT FILTER CONTROLLER
     ========================================================================== */
  const filterPills = document.querySelectorAll('.filter-pill');
  const projectCards = document.querySelectorAll('.project-card');

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeInUp 0.35s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ==========================================================================
     6. PROJECT BLUEPRINT SCHEMATIC MODAL
     ========================================================================== */
  const projectDatabase = {
    'aegis': {
      title: 'AEGIS NEURAL SENTINEL',
      category: 'ARTIFICIAL INTELLIGENCE // CYBERSECURITY',
      status: 'DEV PHASE 82%',
      desc: 'An autonomous threat detection sentinel operating at line rate. Employs deep transformer embeddings over zero-trust network packet telemetry, predicting anomaly vectors and intercepting automated cyber assaults before breach execution.',
      features: [
        'Real-time streaming ingestion via Kafka pipelines (>250k events/sec)',
        'Vector embedding anomaly scorer using custom lightweight PyTorch models',
        'Kernel-level eBPF packet interception filter written in Rust',
        'Automated IP containment policy dispatcher with zero false-positives'
      ],
      tech: ['Python', 'PyTorch', 'Rust', 'eBPF', 'Kafka', 'Docker'],
      benchName: 'Interception Latency:',
      benchVal: '< 1.4ms (99.9th percentile)',
      repo: 'https://github.com/aniketpanara'
    },
    'chronos': {
      title: 'CHRONOS ZERO-G SIMULATOR',
      category: 'PHYSICS SIMULATION // GRAPHICS',
      status: 'ALPHA 65%',
      desc: 'High-performance interactive celestial physics sandbox compiled to WebAssembly. Solves general relativistic N-body gravitational equations with octree Barnes-Hut spatial partitioning, allowing millions of particles to interact with zero frame drop.',
      features: [
        'Massively parallel computation via WebAssembly SIMD primitives',
        'Custom WebGL 2.0 compute & instanced particle shaders',
        'Dynamic gravitational singularities (Kerr black hole frame dragging)',
        'Interactive real-time zero-gravity vector field visualizer'
      ],
      tech: ['C++', 'WebAssembly', 'WebGL 2.0', 'GLSL', 'Linear Algebra'],
      benchName: 'Particle Render Rate:',
      benchVal: '60+ FPS @ 50,000 Nodes',
      repo: 'https://github.com/aniketpanara'
    },
    'enigma-os': {
      title: 'ENIGMA MICROKERNEL',
      category: 'SYSTEMS ARCHITECTURE // OS KERNEL',
      status: 'PROTOTYPE 45%',
      desc: 'An educational, bare-metal x86-64 microkernel engineered from first principles. Features a modular architecture where device drivers and filesystem servers run completely in user space, communicating via synchronous zero-copy IPC.',
      features: [
        'Preemptive round-robin multi-level feedback queue CPU scheduler',
        'Two-level virtual memory paging and page fault handler',
        'Synchronous ring-buffer inter-process message passing',
        'Comprehensive QEMU debug harnesses and automated GDB unit testing'
      ],
      tech: ['C', 'x86-64 ASM', 'QEMU', 'GDB', 'Linker Scripts'],
      benchName: 'Context Switch Time:',
      benchVal: '< 320 CPU Cycles',
      repo: 'https://github.com/aniketpanara'
    },
    'turing-mesh': {
      title: 'TURINGMESH P2P CODE ENGINE',
      category: 'DISTRIBUTED SYSTEMS // WEBRTC',
      status: 'DEV PHASE 78%',
      desc: 'A decentralized, serverless collaborative code editor. Peers establish direct encrypted WebRTC mesh connections, achieving instantaneous character synchronizations with conflict-free replicated data types (CRDTs).',
      features: [
        'Zero centralized servers; direct peer-to-peer WebRTC mesh topology',
        'Yjs CRDT state synchronizer ensuring zero edit conflicts',
        'End-to-end ECDH encrypted code buffer streaming',
        'Built-in collaborative WebAssembly runtime execution engine'
      ],
      tech: ['TypeScript', 'WebRTC', 'CRDTs', 'Yjs', 'WASM', 'Node.js'],
      benchName: 'Peer Sync Latency:',
      benchVal: '< 18ms Globally',
      repo: 'https://github.com/aniketpanara'
    },
    'spectra-ai': {
      title: 'SPECTRA EDGE-AI OBJECT TRACKER',
      category: 'COMPUTER VISION // EDGE ROBOTICS',
      status: 'CONCEPT 35%',
      desc: 'High-speed object identification and spatial 3D tracking pipeline designed for embedded drone microprocessors. Converts heavy convolutional architectures into ultra-compact INT8 quantized representations.',
      features: [
        'INT8 post-training quantization reducing model size by 74%',
        'Kalman filter predictive trajectory vector estimation',
        'Hardware acceleration via NVIDIA TensorRT and ARM NEON intrinsics',
        'Optimized for battery-constrained robotic micro-controllers'
      ],
      tech: ['C++20', 'OpenCV', 'ONNX Runtime', 'TensorRT', 'CUDA'],
      benchName: 'Inference Speed:',
      benchVal: '142 FPS on Edge Hardware',
      repo: 'https://github.com/aniketpanara'
    },
    'quantum-vault': {
      title: 'QUANTUM CIPHER VAULT',
      category: 'CRYPTOGRAPHY // SECURITY',
      status: 'DEV PHASE 58%',
      desc: 'A post-quantum cryptographic storage service resistant to Shor’s algorithm and quantum computer factoring attacks. Implements NIST-approved lattice cryptography for hybrid public-key exchange.',
      features: [
        'CRYSTALS-Kyber 1024 post-quantum key encapsulation mechanism',
        'Dilithium digital signature verification for tamper-proof logs',
        'High-speed gRPC streaming interface with mutual TLS authentication',
        'Encrypted SQLite storage backend with hardware AES-NI instructions'
      ],
      tech: ['Go', 'Kyber-1024', 'Dilithium', 'gRPC', 'Protobuf', 'SQLite'],
      benchName: 'Key Exchange Speed:',
      benchVal: '12,500 handshakes / sec',
      repo: 'https://github.com/aniketpanara'
    }
  };

  const modal = document.getElementById('blueprint-modal');
  const modalClose = document.getElementById('modal-close-btn');
  const modalBackdrop = document.getElementById('modal-backdrop');

  const openModal = (projectId) => {
    const data = projectDatabase[projectId];
    if (!data) return;

    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-category').textContent = data.category;
    document.getElementById('modal-status').textContent = data.status;
    document.getElementById('modal-desc').textContent = data.desc;

    // Features
    const featList = document.getElementById('modal-features');
    featList.innerHTML = '';
    data.features.forEach(f => {
      const li = document.createElement('li');
      li.textContent = f;
      featList.appendChild(li);
    });

    // Tech
    const techBox = document.getElementById('modal-tech-chips');
    techBox.innerHTML = '';
    data.tech.forEach(t => {
      const span = document.createElement('span');
      span.className = 'tech-chip';
      span.textContent = t;
      techBox.appendChild(span);
    });

    // Benchmark
    document.getElementById('bench-name').textContent = data.benchName;
    document.getElementById('bench-val').textContent = data.benchVal;

    // Github link
    const gitLink = document.getElementById('modal-github-link');
    gitLink.href = data.repo;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (window.soundFX) window.soundFX.playModalOpen();
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.view-blueprint-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-project');
      openModal(id);
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  /* ==========================================================================
     7. INTERACTIVE TERMINAL (COMMAND LINE SHELL)
     ========================================================================== */
  const terminalInput = document.getElementById('terminal-input');
  const terminalOutput = document.getElementById('terminal-output');

  function printTerminalLine(html, customClass = '') {
    if (!terminalOutput) return;
    const line = document.createElement('div');
    line.className = `term-line ${customClass}`;
    line.innerHTML = html;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  if (terminalInput) {
    const cmdHistory = [];
    let historyIdx = -1;

    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = terminalInput.value.trim().toLowerCase();
        if (!cmd) return;

        cmdHistory.push(cmd);
        historyIdx = cmdHistory.length;

        printTerminalLine(`aniket@turing:~$ <span class="term-cmd">${terminalInput.value}</span>`);
        terminalInput.value = '';

        handleCommand(cmd);
      } else if (e.key === 'ArrowUp') {
        if (historyIdx > 0) {
          historyIdx--;
          terminalInput.value = cmdHistory[historyIdx];
        }
      } else if (e.key === 'ArrowDown') {
        if (historyIdx < cmdHistory.length - 1) {
          historyIdx++;
          terminalInput.value = cmdHistory[historyIdx];
        } else {
          historyIdx = cmdHistory.length;
          terminalInput.value = '';
        }
      }
    });

    function handleCommand(cmd) {
      if (window.soundFX) window.soundFX.playClick();

      switch (cmd) {
        case 'help':
          printTerminalLine(`Available commands:`);
          printTerminalLine(`  <span class="term-highlight">whoami</span>       - Display student profile & identity`);
          printTerminalLine(`  <span class="term-highlight">batch</span>        - Details regarding Turing Enigma cohort`);
          printTerminalLine(`  <span class="term-highlight">projects</span>     - Print list of upcoming engineering systems`);
          printTerminalLine(`  <span class="term-highlight">github</span>       - Open Aniket's official GitHub profile`);
          printTerminalLine(`  <span class="term-highlight">shockwave</span>    - Trigger a gravitational physics pulse`);
          printTerminalLine(`  <span class="term-highlight">theme</span> &lt;val&gt;  - Switch theme ('neon', 'cyan', 'violet', 'matrix')`);
          printTerminalLine(`  <span class="term-highlight">clear</span>        - Clear terminal screen`);
          break;

        case 'whoami':
          printTerminalLine(`IDENTITY: ANIKETBHAI PANARA`, 'term-highlight');
          printTerminalLine(`ROLE: B.Tech 1st Year Computer Science & Engineering`);
          printTerminalLine(`BATCH: TURING ENIGMA`);
          printTerminalLine(`INTERESTS: Distributed Systems, Zero-G Physics, Edge AI, Microkernels`);
          break;

        case 'batch':
          printTerminalLine(`COHORT: TURING ENIGMA BATCH`, 'term-highlight');
          printTerminalLine(`A specialized honors track inspired by Alan Turing's mathematical foundation of computation, machine intelligence, and systems rigor.`);
          break;

        case 'projects':
          printTerminalLine(`UPCOMING SYSTEMS CATALOG:`, 'term-highlight');
          printTerminalLine(`1. Aegis AI Sentinel (PyTorch / Rust / Kafka)`);
          printTerminalLine(`2. Chronos Zero-G Engine (C++ / WASM / WebGL)`);
          printTerminalLine(`3. Enigma Microkernel (C / x86-64 ASM)`);
          printTerminalLine(`4. TuringMesh P2P (TypeScript / WebRTC / CRDT)`);
          printTerminalLine(`5. Spectra Edge-AI Tracker (C++20 / OpenCV / TensorRT)`);
          printTerminalLine(`6. Quantum Cipher Vault (Go / Kyber-1024)`);
          break;

        case 'github':
          printTerminalLine(`Redirecting to https://github.com/aniketpanara ...`, 'term-success');
          window.open('https://github.com/aniketpanara', '_blank');
          break;

        case 'shockwave':
          triggerCenterBurst();
          printTerminalLine(`Gravitational shockwave emitted through particle field.`, 'term-success');
          break;

        case 'theme neon':
          engine.setTheme('cyber-neon');
          document.body.className = 'theme-cyber-neon';
          printTerminalLine(`Palette updated: Cyber Neon`, 'term-success');
          break;

        case 'theme cyan':
          engine.setTheme('quantum-cyan');
          document.body.className = 'theme-quantum-cyan';
          printTerminalLine(`Palette updated: Quantum Cyan`, 'term-success');
          break;

        case 'theme violet':
          engine.setTheme('electric-violet');
          document.body.className = 'theme-electric-violet';
          printTerminalLine(`Palette updated: Electric Violet`, 'term-success');
          break;

        case 'theme matrix':
          engine.setTheme('emerald-matrix');
          document.body.className = 'theme-emerald-matrix';
          printTerminalLine(`Palette updated: Emerald Matrix`, 'term-success');
          break;

        case 'clear':
          terminalOutput.innerHTML = '';
          break;

        default:
          printTerminalLine(`Command not recognized: '<span class="term-cmd">${cmd}</span>'. Type '<span class="term-highlight">help</span>' for manual.`);
          break;
      }
    }
  }

  /* ==========================================================================
     8. SCROLL SPY NAVIGATION
     ========================================================================== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

});

