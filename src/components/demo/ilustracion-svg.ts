// Ilustración del hero de cifrato.ai (versión de escritorio), copiada el 13 oct 2026.
// Cambios: rutas de imágenes locales (public/cifrato/hero) y etiquetas en español.
export const SVG_HERO = `<svg viewBox="0 0 1300 706" xmlns="http://www.w3.org/2000/svg" role="img"
       preserveAspectRatio="xMidYMin meet"
       aria-label="Documentos de la DIAN y el SAT pasando por el motor de Cifrato hacia el software contable">
    
  <defs>
    <linearGradient id="gTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#123E2D"/><stop offset="1" stop-color="#0A251B"/></linearGradient>
    <linearGradient id="gTopHl" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7DFFBE"/><stop offset="1" stop-color="#00D26B"/></linearGradient>
    <linearGradient id="gSideL" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0C3124"/><stop offset="1" stop-color="#051911"/></linearGradient>
    <linearGradient id="gSideR" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#104233"/><stop offset="1" stop-color="#061F16"/></linearGradient>
    <linearGradient id="gSideLHl" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#08A05F"/><stop offset="1" stop-color="#045537"/></linearGradient>
    <linearGradient id="gSideRHl" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#00C46E"/><stop offset="1" stop-color="#066E45"/></linearGradient>
    <linearGradient id="gChipTop" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#154634"/><stop offset=".55" stop-color="#0D2F23"/><stop offset="1" stop-color="#09241C"/></linearGradient>
    <linearGradient id="gChipL" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#00E27A"/><stop offset=".55" stop-color="#02925A"/><stop offset="1" stop-color="#052C20"/></linearGradient>
    <linearGradient id="gChipR" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#69F0AE"/><stop offset=".5" stop-color="#00C06C"/><stop offset="1" stop-color="#053628"/></linearGradient>
    <linearGradient id="gPaper" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F5FFFB"/><stop offset="1" stop-color="#D8F6E7"/></linearGradient>
    <radialGradient id="gCore">
      <stop offset="0" stop-color="#FFFFFF"/><stop offset=".35" stop-color="#9CFFCB"/>
      <stop offset="1" stop-color="#00D26B" stop-opacity="0"/></radialGradient>
    <filter id="glow" x="-70%" y="-70%" width="240%" height="240%">
      <feGaussianBlur stdDeviation="3.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="bloom" x="-90%" y="-90%" width="280%" height="280%">
      <feGaussianBlur stdDeviation="9"/></filter>
    <filter id="soft" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="16"/></filter>
    <filter id="chipGlow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="12" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs><g class="conns"><g class="conn" data-conn="cfdi">
      <path class="trace" d="M 95 345 L 95 381  95 381 L 250 303.5 L 265 311 L 265 311"/>
      <g filter="url(#bloom)"><path class="fx fx-halo" d="M 95 345 L 95 381  95 381 L 250 303.5 L 265 311 L 265 311" style="--dur:7.20s;--delay:0s"/></g>
      <g filter="url(#glow)"><path class="fx fx-mid" d="M 95 345 L 95 381  95 381 L 250 303.5 L 265 311 L 265 311" style="--dur:7.20s;--delay:0s"/></g>
      <path class="fx fx-core" d="M 95 345 L 95 381  95 381 L 250 303.5 L 265 311 L 265 311" style="--dur:7.20s;--delay:0s"/>
      <circle class="port" cx="265" cy="311" r="5"
              style="--dur:7.20s;--pdelay:3.40s"/>
    </g><g class="conn" data-conn="ret">
      <path class="trace" d="M 405 345 L 405 381  405 381 L 265 311 L 265 311"/>
      <g filter="url(#bloom)"><path class="fx fx-halo" d="M 405 345 L 405 381  405 381 L 265 311 L 265 311" style="--dur:7.20s;--delay:0.14s"/></g>
      <g filter="url(#glow)"><path class="fx fx-mid" d="M 405 345 L 405 381  405 381 L 265 311 L 265 311" style="--dur:7.20s;--delay:0.14s"/></g>
      <path class="fx fx-core" d="M 405 345 L 405 381  405 381 L 265 311 L 265 311" style="--dur:7.20s;--delay:0.14s"/>
      <circle class="port" cx="265" cy="311" r="5"
              style="--dur:7.20s;--pdelay:3.54s"/>
    </g><g class="conn" data-conn="fe">
      <path class="trace" d="M 95 605 L 95 641  95 641 L 250 563.5 L 265 571 L 265 571"/>
      <g filter="url(#bloom)"><path class="fx fx-halo" d="M 95 605 L 95 641  95 641 L 250 563.5 L 265 571 L 265 571" style="--dur:7.20s;--delay:0.07s"/></g>
      <g filter="url(#glow)"><path class="fx fx-mid" d="M 95 605 L 95 641  95 641 L 250 563.5 L 265 571 L 265 571" style="--dur:7.20s;--delay:0.07s"/></g>
      <path class="fx fx-core" d="M 95 605 L 95 641  95 641 L 250 563.5 L 265 571 L 265 571" style="--dur:7.20s;--delay:0.07s"/>
      <circle class="port" cx="265" cy="571" r="5"
              style="--dur:7.20s;--pdelay:3.47s"/>
    </g><g class="conn" data-conn="nom">
      <path class="trace" d="M 405 605 L 405 641  405 641 L 265 571 L 265 571"/>
      <g filter="url(#bloom)"><path class="fx fx-halo" d="M 405 605 L 405 641  405 641 L 265 571 L 265 571" style="--dur:7.20s;--delay:0.2s"/></g>
      <g filter="url(#glow)"><path class="fx fx-mid" d="M 405 605 L 405 641  405 641 L 265 571 L 265 571" style="--dur:7.20s;--delay:0.2s"/></g>
      <path class="fx fx-core" d="M 405 605 L 405 641  405 641 L 265 571 L 265 571" style="--dur:7.20s;--delay:0.2s"/>
      <circle class="port" cx="265" cy="571" r="5"
              style="--dur:7.20s;--pdelay:3.60s"/>
    </g><g class="conn" data-conn="sat">
      <path class="trace" d="M 265 241 L 265 311  265 311 L 398.5 244.3 L 618.4 354.2 L 618.4 354.2"/>
      <g filter="url(#bloom)"><path class="fx fx-halo" d="M 265 241 L 265 311  265 311 L 398.5 244.3 L 618.4 354.2 L 618.4 354.2" style="--dur:7.20s;--delay:1.15s"/></g>
      <g filter="url(#glow)"><path class="fx fx-mid" d="M 265 241 L 265 311  265 311 L 398.5 244.3 L 618.4 354.2 L 618.4 354.2" style="--dur:7.20s;--delay:1.15s"/></g>
      <path class="fx fx-core" d="M 265 241 L 265 311  265 311 L 398.5 244.3 L 618.4 354.2 L 618.4 354.2" style="--dur:7.20s;--delay:1.15s"/>
      <circle class="port" cx="618.4" cy="354.2" r="5"
              style="--dur:7.20s;--pdelay:4.55s"/>
    </g><g class="conn" data-conn="dian">
      <path class="trace" d="M 265 501 L 265 571  265 571 L 304.5 590.8 L 506 490 L 506 490"/>
      <g filter="url(#bloom)"><path class="fx fx-halo" d="M 265 501 L 265 571  265 571 L 304.5 590.8 L 506 490 L 506 490" style="--dur:7.20s;--delay:1.22s"/></g>
      <g filter="url(#glow)"><path class="fx fx-mid" d="M 265 501 L 265 571  265 571 L 304.5 590.8 L 506 490 L 506 490" style="--dur:7.20s;--delay:1.22s"/></g>
      <path class="fx fx-core" d="M 265 501 L 265 571  265 571 L 304.5 590.8 L 506 490 L 506 490" style="--dur:7.20s;--delay:1.22s"/>
      <circle class="port" cx="506" cy="490" r="5"
              style="--dur:7.20s;--pdelay:4.62s"/>
    </g><g class="conn" data-conn="qbo">
      <path class="trace" d="M 761.6 394.2 L 970 290 L 1080 345 L 1080 345 L 1080 200"/>
      <g filter="url(#bloom)"><path class="fx fx-halo" d="M 761.6 394.2 L 970 290 L 1080 345 L 1080 345 L 1080 200" style="--dur:7.20s;--delay:2.25s"/></g>
      <g filter="url(#glow)"><path class="fx fx-mid" d="M 761.6 394.2 L 970 290 L 1080 345 L 1080 345 L 1080 200" style="--dur:7.20s;--delay:2.25s"/></g>
      <path class="fx fx-core" d="M 761.6 394.2 L 970 290 L 1080 345 L 1080 345 L 1080 200" style="--dur:7.20s;--delay:2.25s"/>
      <circle class="port" cx="1080" cy="200" r="5"
              style="--dur:7.20s;--pdelay:5.65s"/>
    </g><g class="conn" data-conn="xero">
      <path class="trace" d="M 801.6 414.2 L 960 335 L 1160 435 L 1160 435 L 1160 300"/>
      <g filter="url(#bloom)"><path class="fx fx-halo" d="M 801.6 414.2 L 960 335 L 1160 435 L 1160 435 L 1160 300" style="--dur:7.20s;--delay:2.32s"/></g>
      <g filter="url(#glow)"><path class="fx fx-mid" d="M 801.6 414.2 L 960 335 L 1160 435 L 1160 435 L 1160 300" style="--dur:7.20s;--delay:2.32s"/></g>
      <path class="fx fx-core" d="M 801.6 414.2 L 960 335 L 1160 435 L 1160 435 L 1160 300" style="--dur:7.20s;--delay:2.32s"/>
      <circle class="port" cx="1160" cy="300" r="5"
              style="--dur:7.20s;--pdelay:5.72s"/>
    </g><g class="conn" data-conn="ns">
      <path class="trace" d="M 794 490 L 882 534 L 950 500 L 950 500 L 950 390"/>
      <g filter="url(#bloom)"><path class="fx fx-halo" d="M 794 490 L 882 534 L 950 500 L 950 500 L 950 390" style="--dur:7.20s;--delay:2.39s"/></g>
      <g filter="url(#glow)"><path class="fx fx-mid" d="M 794 490 L 882 534 L 950 500 L 950 500 L 950 390" style="--dur:7.20s;--delay:2.39s"/></g>
      <path class="fx fx-core" d="M 794 490 L 882 534 L 950 500 L 950 500 L 950 390" style="--dur:7.20s;--delay:2.39s"/>
      <circle class="port" cx="950" cy="390" r="5"
              style="--dur:7.20s;--pdelay:5.79s"/>
    </g><g class="conn" data-conn="sap">
      <path class="trace" d="M 768.4 502.8 L 1071.4 654.3 L 1160 610 L 1160 610 L 1160 510"/>
      <g filter="url(#bloom)"><path class="fx fx-halo" d="M 768.4 502.8 L 1071.4 654.3 L 1160 610 L 1160 610 L 1160 510" style="--dur:7.20s;--delay:2.32s"/></g>
      <g filter="url(#glow)"><path class="fx fx-mid" d="M 768.4 502.8 L 1071.4 654.3 L 1160 610 L 1160 610 L 1160 510" style="--dur:7.20s;--delay:2.32s"/></g>
      <path class="fx fx-core" d="M 768.4 502.8 L 1071.4 654.3 L 1160 610 L 1160 610 L 1160 510" style="--dur:7.20s;--delay:2.32s"/>
      <circle class="port" cx="1160" cy="510" r="5"
              style="--dur:7.20s;--pdelay:5.72s"/>
    </g><g class="conn" data-conn="siigo">
      <path class="trace" d="M 726.8 523.6 L 984.8 652.6 L 1040 625 L 1040 625 L 1040 570"/>
      <g filter="url(#bloom)"><path class="fx fx-halo" d="M 726.8 523.6 L 984.8 652.6 L 1040 625 L 1040 625 L 1040 570" style="--dur:7.20s;--delay:2.39s"/></g>
      <g filter="url(#glow)"><path class="fx fx-mid" d="M 726.8 523.6 L 984.8 652.6 L 1040 625 L 1040 625 L 1040 570" style="--dur:7.20s;--delay:2.39s"/></g>
      <path class="fx fx-core" d="M 726.8 523.6 L 984.8 652.6 L 1040 625 L 1040 625 L 1040 570" style="--dur:7.20s;--delay:2.39s"/>
      <circle class="port" cx="1040" cy="570" r="5"
              style="--dur:7.20s;--pdelay:5.79s"/>
    </g></g>
    <g class="cpu-grp">
      <ellipse cx="650" cy="496" rx="255" ry="78" fill="rgba(0,230,118,.09)" filter="url(#soft)"/>
      <g class="cpu">
        <polygon class="f-l" points="490,430 650,510 650,562 490,482"  fill="url(#gChipL)"/>
        <polygon class="f-r" points="650,510 810,430 810,482 650,562" fill="url(#gChipR)"/>
        <polygon points="650,350 810,430 650,510 490,430" fill="url(#gChipTop)" stroke="rgba(190,255,230,.5)" stroke-width="1.3"/>
        <polygon points="650,361.5 787,430 650,498.5 513,430" fill="none" stroke="rgba(150,255,215,.2)" stroke-width="1"/>
        <line class="pin" x1="510" y1="420" x2="498.4" y2="414.2"/><line class="pin" x1="530" y1="410" x2="518.4" y2="404.2"/><line class="pin" x1="550" y1="400" x2="538.4" y2="394.2"/><line class="pin" x1="570" y1="390" x2="558.4" y2="384.2"/><line class="pin" x1="590" y1="380" x2="578.4" y2="374.2"/><line class="pin" x1="610" y1="370" x2="598.4" y2="364.2"/><line class="pin pin-hot" x1="630" y1="360" x2="618.4" y2="354.2"/><line class="pin" x1="670" y1="360" x2="681.6" y2="354.2"/><line class="pin" x1="690" y1="370" x2="701.6" y2="364.2"/><line class="pin" x1="710" y1="380" x2="721.6" y2="374.2"/><line class="pin" x1="730" y1="390" x2="741.6" y2="384.2"/><line class="pin pin-hot" x1="750" y1="400" x2="761.6" y2="394.2"/><line class="pin" x1="770" y1="410" x2="781.6" y2="404.2"/><line class="pin pin-hot" x1="790" y1="420" x2="801.6" y2="414.2"/><line class="pin" x1="790" y1="440" x2="801.6" y2="445.8"/><line class="pin" x1="770" y1="450" x2="781.6" y2="455.8"/><line class="pin" x1="750" y1="460" x2="761.6" y2="465.8"/><line class="pin" x1="730" y1="470" x2="741.6" y2="475.8"/><line class="pin" x1="710" y1="480" x2="721.6" y2="485.8"/><line class="pin" x1="690" y1="490" x2="701.6" y2="495.8"/><line class="pin" x1="670" y1="500" x2="681.6" y2="505.8"/><line class="pin" x1="630" y1="500" x2="618.4" y2="505.8"/><line class="pin" x1="610" y1="490" x2="598.4" y2="495.8"/><line class="pin" x1="590" y1="480" x2="578.4" y2="485.8"/><line class="pin" x1="570" y1="470" x2="558.4" y2="475.8"/><line class="pin" x1="550" y1="460" x2="538.4" y2="465.8"/><line class="pin" x1="530" y1="450" x2="518.4" y2="455.8"/><line class="pin" x1="510" y1="440" x2="498.4" y2="445.8"/>
        <polygon class="pad-halo" points="506,483.5 519,490 506,496.5 493,490" filter="url(#bloom)"/><polygon class="pad" points="506,486.8 512.4,490 506,493.2 499.6,490"/><polygon class="pad-halo" points="794,483.5 807,490 794,496.5 781,490" filter="url(#bloom)"/><polygon class="pad" points="794,486.8 800.4,490 794,493.2 787.6,490"/><polygon class="pad-halo" points="768.4,496.3 781.4,502.8 768.4,509.3 755.4,502.8" filter="url(#bloom)"/><polygon class="pad" points="768.4,499.6 774.8,502.8 768.4,506 762,502.8"/><polygon class="pad-halo" points="726.8,517.1 739.8,523.6 726.8,530.1 713.8,523.6" filter="url(#bloom)"/><polygon class="pad" points="726.8,520.4 733.2,523.6 726.8,526.8 720.4,523.6"/>
        <g filter="url(#chipGlow)"><polygon class="core" points="650,392.5 725,430 650,467.5 575,430" fill="url(#gCore)"/></g>
        <circle class="dot" cx="650" cy="373" r="1.8" opacity="0.14"/><circle class="dot" cx="631" cy="382.5" r="1.8" opacity="0.14"/><circle class="dot" cx="612" cy="392" r="1.8" opacity="0.25"/><circle class="dot" cx="593" cy="401.5" r="1.8" opacity="0.29"/><circle class="dot" cx="574" cy="411" r="1.8" opacity="0.25"/><circle class="dot" cx="555" cy="420.5" r="1.8" opacity="0.14"/><circle class="dot" cx="536" cy="430" r="1.8" opacity="0.14"/><circle class="dot" cx="669" cy="382.5" r="1.8" opacity="0.14"/><circle class="dot" cx="650" cy="392" r="1.8" opacity="0.33"/><circle class="dot" cx="631" cy="401.5" r="2.5" opacity="0.47"/><circle class="dot" cx="612" cy="411" r="2.5" opacity="0.52"/><circle class="dot" cx="593" cy="420.5" r="2.5" opacity="0.47"/><circle class="dot" cx="574" cy="430" r="1.8" opacity="0.33"/><circle class="dot" cx="555" cy="439.5" r="1.8" opacity="0.14"/><circle class="dot" cx="688" cy="392" r="1.8" opacity="0.25"/><circle class="dot" cx="669" cy="401.5" r="2.5" opacity="0.47"/><circle class="dot" cx="650" cy="411" r="2.5" opacity="0.66"/><circle class="dot" cx="631" cy="420.5" r="3.4" opacity="0.76"/><circle class="dot" cx="612" cy="430" r="2.5" opacity="0.66"/><circle class="dot" cx="593" cy="439.5" r="2.5" opacity="0.47"/><circle class="dot" cx="574" cy="449" r="1.8" opacity="0.25"/><circle class="dot" cx="707" cy="401.5" r="1.8" opacity="0.29"/><circle class="dot" cx="688" cy="411" r="2.5" opacity="0.52"/><circle class="dot" cx="669" cy="420.5" r="3.4" opacity="0.76"/><circle class="dot" cx="650" cy="430" r="3.4" opacity="1.00"/><circle class="dot" cx="631" cy="439.5" r="3.4" opacity="0.76"/><circle class="dot" cx="612" cy="449" r="2.5" opacity="0.52"/><circle class="dot" cx="593" cy="458.5" r="1.8" opacity="0.29"/><circle class="dot" cx="726" cy="411" r="1.8" opacity="0.25"/><circle class="dot" cx="707" cy="420.5" r="2.5" opacity="0.47"/><circle class="dot" cx="688" cy="430" r="2.5" opacity="0.66"/><circle class="dot" cx="669" cy="439.5" r="3.4" opacity="0.76"/><circle class="dot" cx="650" cy="449" r="2.5" opacity="0.66"/><circle class="dot" cx="631" cy="458.5" r="2.5" opacity="0.47"/><circle class="dot" cx="612" cy="468" r="1.8" opacity="0.25"/><circle class="dot" cx="745" cy="420.5" r="1.8" opacity="0.14"/><circle class="dot" cx="726" cy="430" r="1.8" opacity="0.33"/><circle class="dot" cx="707" cy="439.5" r="2.5" opacity="0.47"/><circle class="dot" cx="688" cy="449" r="2.5" opacity="0.52"/><circle class="dot" cx="669" cy="458.5" r="2.5" opacity="0.47"/><circle class="dot" cx="650" cy="468" r="1.8" opacity="0.33"/><circle class="dot" cx="631" cy="477.5" r="1.8" opacity="0.14"/><circle class="dot" cx="764" cy="430" r="1.8" opacity="0.14"/><circle class="dot" cx="745" cy="439.5" r="1.8" opacity="0.14"/><circle class="dot" cx="726" cy="449" r="1.8" opacity="0.25"/><circle class="dot" cx="707" cy="458.5" r="1.8" opacity="0.29"/><circle class="dot" cx="688" cy="468" r="1.8" opacity="0.25"/><circle class="dot" cx="669" cy="477.5" r="1.8" opacity="0.14"/><circle class="dot" cx="650" cy="487" r="1.8" opacity="0.14"/>
        
      <g class="chip-logo">
        <ellipse class="chip-logo-shadow" cx="650" cy="442" rx="72" ry="27" fill="rgba(0,0,0,.5)" filter="url(#soft)"/>
        <g class="chip-logo-lift">
          <g transform="translate(650 427.6) matrix(.8944 .4472 -.8944 .4472 0 0)"><image href="/cifrato/hero/cifrato.png" x="-52" y="-50.4" width="104" height="100.9" preserveAspectRatio="xMidYMid meet" style="filter:brightness(0.13) saturate(1.25)"/></g><g transform="translate(650 425.4) matrix(.8944 .4472 -.8944 .4472 0 0)"><image href="/cifrato/hero/cifrato.png" x="-52" y="-50.4" width="104" height="100.9" preserveAspectRatio="xMidYMid meet" style="filter:brightness(0.18) saturate(1.25)"/></g><g transform="translate(650 423.2) matrix(.8944 .4472 -.8944 .4472 0 0)"><image href="/cifrato/hero/cifrato.png" x="-52" y="-50.4" width="104" height="100.9" preserveAspectRatio="xMidYMid meet" style="filter:brightness(0.23) saturate(1.25)"/></g><g transform="translate(650 421) matrix(.8944 .4472 -.8944 .4472 0 0)"><image href="/cifrato/hero/cifrato.png" x="-52" y="-50.4" width="104" height="100.9" preserveAspectRatio="xMidYMid meet" style="filter:brightness(0.29) saturate(1.25)"/></g><g transform="translate(650 418.8) matrix(.8944 .4472 -.8944 .4472 0 0)"><image href="/cifrato/hero/cifrato.png" x="-52" y="-50.4" width="104" height="100.9" preserveAspectRatio="xMidYMid meet" style="filter:brightness(0.34) saturate(1.25)"/></g><g transform="translate(650 416.6) matrix(.8944 .4472 -.8944 .4472 0 0)"><image href="/cifrato/hero/cifrato.png" x="-52" y="-50.4" width="104" height="100.9" preserveAspectRatio="xMidYMid meet" style="filter:brightness(0.39) saturate(1.25)"/></g><g transform="translate(650 414.4) matrix(.8944 .4472 -.8944 .4472 0 0)"><image href="/cifrato/hero/cifrato.png" x="-52" y="-50.4" width="104" height="100.9" preserveAspectRatio="xMidYMid meet" style="filter:brightness(0.45) saturate(1.25)"/></g><g transform="translate(650 412.2) matrix(.8944 .4472 -.8944 .4472 0 0)"><image href="/cifrato/hero/cifrato.png" x="-52" y="-50.4" width="104" height="100.9" preserveAspectRatio="xMidYMid meet" style="filter:brightness(0.50) saturate(1.25)"/></g>
          <g transform="translate(650 410) matrix(.8944 .4472 -.8944 .4472 0 0)"><image href="/cifrato/hero/cifrato.png" x="-52" y="-50.4" width="104" height="100.9" preserveAspectRatio="xMidYMid meet" class="chip-logo-top"/></g>
        </g>
      </g>
        
      <g class="tip" aria-hidden="true">
        <rect class="tip-bg" x="607.6" y="307" width="84.8" height="28" rx="7"/>
        <path class="tip-tail" d="M 645 334.5 L 655 334.5 L 650 341 Z"/>
        <text class="tip-label" x="650" y="326"
              text-anchor="middle" font-size="14">Cifrato</text>
      </g>
      </g>
    </g>
    
    <g class="node-in" data-node="sat" style="--in:0.30s">
      <ellipse cx="265" cy="311" rx="51.8" ry="18.4" fill="rgba(0,230,118,.07)" filter="url(#soft)"/>
      <line class="stem" x1="265" y1="241" x2="265" y2="311"/>
      <circle class="foot" cx="265" cy="311" r="2.6"/>
      <g class="node hl">
        <polygon class="halo" points="265,140.5 374.5,195 265,249.5 155.5,195"/>
        <polygon class="f-l" points="172.5,195 265,241 265,267 172.5,221"/>
        <polygon class="f-r" points="265,241 357.5,195 357.5,221 265,267"/>
        <polygon class="f-top" points="265,149 357.5,195 265,241 172.5,195"/>
        <polygon class="flash" points="265,149 357.5,195 265,241 172.5,195" style="--dur:7.2s;--fd:3.54s"/>
        <g transform="translate(265 195) matrix(.8944 .4472 -.8944 .4472 0 0)">
        <image href="/cifrato/hero/sat.png" x="-43" y="-16.4" width="86" height="22.7" preserveAspectRatio="xMidYMid meet"/>
        <text class="n-label n-sub" text-anchor="middle" font-size="9.4" x="0" y="24.4">MÉXICO</text>
      </g>
      </g>
      
      <g class="tip" aria-hidden="true">
        <rect class="tip-bg" x="173" y="106" width="184" height="28" rx="7"/>
        <path class="tip-tail" d="M 260 133.5 L 270 133.5 L 265 140 Z"/>
        <text class="tip-label" x="265" y="125"
              text-anchor="middle" font-size="14">Autoridad tributaria</text>
      </g>
    </g>
    <g class="node-in" data-node="cfdi" style="--in:0.37s">
      <ellipse cx="95" cy="381" rx="30" ry="10" fill="rgba(0,230,118,.07)" filter="url(#soft)"/>
      <line class="stem" x1="95" y1="345" x2="95" y2="381"/>
      <circle class="foot" cx="95" cy="381" r="2.6"/>
      <g class="node inv-node">
        <polygon class="halo" points="95,286.5 162,320 95,353.5 28,320"/>
        <polygon class="inv-paper" points="95,295 145,320 95,345 45,320"/>
        <polygon class="inv-bar"   points="95.5,298.8 137.5,319.8 130,323.5 88,302.5"/>
        <polygon class="inv-fold"  points="145,320 136,315.5 136,324.5"/>
        <text class="n-label" text-anchor="middle" font-size="8.5"
              transform="translate(99 318) matrix(.8944 .4472 -.8944 .4472 0 0)">CFDI</text>
        <polygon class="inv-line"  points="68,314.5 90,325.5 87,327 65,316"/>
        <polygon class="inv-total" points="92,326.5 107,334 100,337.5 85,330"/>
        <polygon class="inv-chip"  points="62,317.5 72,322.5 66,325.5 56,320.5"/>
      </g>
    </g>
    <g class="node-in" data-node="ret" style="--in:0.44s">
      <ellipse cx="405" cy="381" rx="30" ry="10" fill="rgba(0,230,118,.07)" filter="url(#soft)"/>
      <line class="stem" x1="405" y1="345" x2="405" y2="381"/>
      <circle class="foot" cx="405" cy="381" r="2.6"/>
      <g class="node inv-node">
        <polygon class="halo" points="405,286.5 472,320 405,353.5 338,320"/>
        <polygon class="inv-paper" points="405,295 455,320 405,345 355,320"/>
        <polygon class="inv-bar"   points="405.5,298.8 447.5,319.8 440,323.5 398,302.5"/>
        <polygon class="inv-fold"  points="455,320 446,315.5 446,324.5"/>
        <text class="n-label" text-anchor="middle" font-size="7.4" textLength="48" lengthAdjust="spacingAndGlyphs"
              transform="translate(409 318) matrix(.8944 .4472 -.8944 .4472 0 0)">RETENCIONES</text>
        <polygon class="inv-line"  points="378,314.5 400,325.5 397,327 375,316"/>
        <polygon class="inv-total" points="402,326.5 417,334 410,337.5 395,330"/>
        <polygon class="inv-chip"  points="372,317.5 382,322.5 376,325.5 366,320.5"/>
      </g>
    </g>
    <g class="node-in" data-node="dian" style="--in:0.51s">
      <ellipse cx="265" cy="571" rx="51.8" ry="18.4" fill="rgba(0,230,118,.07)" filter="url(#soft)"/>
      <line class="stem" x1="265" y1="501" x2="265" y2="571"/>
      <circle class="foot" cx="265" cy="571" r="2.6"/>
      <g class="node hl">
        <polygon class="halo" points="265,400.5 374.5,455 265,509.5 155.5,455"/>
        <polygon class="f-l" points="172.5,455 265,501 265,527 172.5,481"/>
        <polygon class="f-r" points="265,501 357.5,455 357.5,481 265,527"/>
        <polygon class="f-top" points="265,409 357.5,455 265,501 172.5,455"/>
        <polygon class="flash" points="265,409 357.5,455 265,501 172.5,455" style="--dur:7.2s;--fd:3.60s"/>
        <g transform="translate(265 455) matrix(.8944 .4472 -.8944 .4472 0 0)">
        <image href="/cifrato/hero/dian.png" x="-39" y="-11.4" width="78" height="12.7" preserveAspectRatio="xMidYMid meet"/>
        <text class="n-label n-sub" text-anchor="middle" font-size="9.4" x="0" y="19.4">COLOMBIA</text>
      </g>
      </g>
      
      <g class="tip" aria-hidden="true">
        <rect class="tip-bg" x="173" y="366" width="184" height="28" rx="7"/>
        <path class="tip-tail" d="M 260 393.5 L 270 393.5 L 265 400 Z"/>
        <text class="tip-label" x="265" y="385"
              text-anchor="middle" font-size="14">Autoridad tributaria</text>
      </g>
    </g>
    <g class="node-in" data-node="fe" style="--in:0.58s">
      <ellipse cx="95" cy="641" rx="30" ry="10" fill="rgba(0,230,118,.07)" filter="url(#soft)"/>
      <line class="stem" x1="95" y1="605" x2="95" y2="641"/>
      <circle class="foot" cx="95" cy="641" r="2.6"/>
      <g class="node inv-node">
        <polygon class="halo" points="95,546.5 162,580 95,613.5 28,580"/>
        <polygon class="inv-paper" points="95,555 145,580 95,605 45,580"/>
        <polygon class="inv-bar"   points="95.5,558.8 137.5,579.8 130,583.5 88,562.5"/>
        <polygon class="inv-fold"  points="145,580 136,575.5 136,584.5"/>
        <text class="n-label" text-anchor="middle" font-size="8.5"
              transform="translate(99 578) matrix(.8944 .4472 -.8944 .4472 0 0)">FACTURA</text>
        <polygon class="inv-line"  points="68,574.5 90,585.5 87,587 65,576"/>
        <polygon class="inv-total" points="92,586.5 107,594 100,597.5 85,590"/>
        <polygon class="inv-chip"  points="62,577.5 72,582.5 66,585.5 56,580.5"/>
      </g>
    </g>
    <g class="node-in" data-node="nom" style="--in:0.65s">
      <ellipse cx="405" cy="641" rx="30" ry="10" fill="rgba(0,230,118,.07)" filter="url(#soft)"/>
      <line class="stem" x1="405" y1="605" x2="405" y2="641"/>
      <circle class="foot" cx="405" cy="641" r="2.6"/>
      <g class="node inv-node">
        <polygon class="halo" points="405,546.5 472,580 405,613.5 338,580"/>
        <polygon class="inv-paper" points="405,555 455,580 405,605 355,580"/>
        <polygon class="inv-bar"   points="405.5,558.8 447.5,579.8 440,583.5 398,562.5"/>
        <polygon class="inv-fold"  points="455,580 446,575.5 446,584.5"/>
        <text class="n-label" text-anchor="middle" font-size="8.5"
              transform="translate(409 578) matrix(.8944 .4472 -.8944 .4472 0 0)">NÓMINA</text>
        <polygon class="inv-line"  points="378,574.5 400,585.5 397,587 375,576"/>
        <polygon class="inv-total" points="402,586.5 417,594 410,597.5 395,590"/>
        <polygon class="inv-chip"  points="372,577.5 382,582.5 376,585.5 366,580.5"/>
      </g>
    </g>
    <g class="node-in" data-node="qbo" style="--in:0.72s">
      <ellipse cx="1080" cy="345" rx="56" ry="20" fill="rgba(0,230,118,.07)" filter="url(#soft)"/>
      <line class="stem" x1="1080" y1="200" x2="1080" y2="345"/>
      <circle class="foot" cx="1080" cy="345" r="2.6"/>
      <g class="node  logo-node">
        <polygon class="halo" points="1080,91.5 1197,150 1080,208.5 963,150"/>
        <polygon class="f-l" points="980,150 1080,200 1080,226 980,176"/>
        <polygon class="f-r" points="1080,200 1180,150 1180,176 1080,226"/>
        <polygon class="f-top" points="1080,100 1180,150 1080,200 980,150"/>
        <polygon class="flash" points="1080,100 1180,150 1080,200 980,150" style="--dur:7.2s;--fd:5.65s"/>
        <g transform="translate(1080 150) matrix(.8944 .4472 -.8944 .4472 0 0)">
        <image href="/cifrato/hero/worldoffice.png" x="-44" y="-16.3" width="88" height="22.6" preserveAspectRatio="xMidYMid meet"/>
        
      </g>
      </g>
      
      <g class="tip" aria-hidden="true">
        <rect class="tip-bg" x="985.6" y="57" width="188.9" height="28" rx="7"/>
        <path class="tip-tail" d="M 1075 84.5 L 1085 84.5 L 1080 91 Z"/>
        <text class="tip-label" x="1080.1" y="76"
              text-anchor="middle" font-size="14">Software contable</text>
      </g>
    </g>
    <g class="node-in" data-node="xero" style="--in:0.79s">
      <ellipse cx="1160" cy="435" rx="56" ry="20" fill="rgba(0,230,118,.07)" filter="url(#soft)"/>
      <line class="stem" x1="1160" y1="300" x2="1160" y2="435"/>
      <circle class="foot" cx="1160" cy="435" r="2.6"/>
      <g class="node  logo-node">
        <polygon class="halo" points="1160,191.5 1277,250 1160,308.5 1043,250"/>
        <polygon class="f-l" points="1060,250 1160,300 1160,326 1060,276"/>
        <polygon class="f-r" points="1160,300 1260,250 1260,276 1160,326"/>
        <polygon class="f-top" points="1160,200 1260,250 1160,300 1060,250"/>
        <polygon class="flash" points="1160,200 1260,250 1160,300 1060,250" style="--dur:7.2s;--fd:5.72s"/>
        <g transform="translate(1160 250) matrix(.8944 .4472 -.8944 .4472 0 0)">
        <image href="/cifrato/hero/siesa.png" x="-38" y="-34.7" width="76" height="59.4" preserveAspectRatio="xMidYMid meet"/>
        
      </g>
      </g>
      
      <g class="tip" aria-hidden="true">
        <rect class="tip-bg" x="1065.6" y="157" width="188.9" height="28" rx="7"/>
        <path class="tip-tail" d="M 1155 184.5 L 1165 184.5 L 1160 191 Z"/>
        <text class="tip-label" x="1160.1" y="176"
              text-anchor="middle" font-size="14">Software contable</text>
      </g>
    </g>
    <g class="node-in" data-node="ns" style="--in:0.86s">
      <ellipse cx="950" cy="500" rx="56" ry="20" fill="rgba(0,230,118,.07)" filter="url(#soft)"/>
      <line class="stem" x1="950" y1="390" x2="950" y2="500"/>
      <circle class="foot" cx="950" cy="500" r="2.6"/>
      <g class="node  logo-node">
        <polygon class="halo" points="950,281.5 1067,340 950,398.5 833,340"/>
        <polygon class="f-l" points="850,340 950,390 950,416 850,366"/>
        <polygon class="f-r" points="950,390 1050,340 1050,366 950,416"/>
        <polygon class="f-top" points="950,290 1050,340 950,390 850,340"/>
        <polygon class="flash" points="950,290 1050,340 950,390 850,340" style="--dur:7.2s;--fd:5.79s"/>
        <g transform="translate(950 340) matrix(.8944 .4472 -.8944 .4472 0 0)">
        <image href="/cifrato/hero/alegra.png" x="-46" y="-16.9" width="92" height="23.8" preserveAspectRatio="xMidYMid meet"/>
        
      </g>
      </g>
      
      <g class="tip" aria-hidden="true">
        <rect class="tip-bg" x="855.6" y="247" width="188.9" height="28" rx="7"/>
        <path class="tip-tail" d="M 945 274.5 L 955 274.5 L 950 281 Z"/>
        <text class="tip-label" x="950.1" y="266"
              text-anchor="middle" font-size="14">Software contable</text>
      </g>
    </g>
    <g class="node-in" data-node="sap" style="--in:0.93s">
      <ellipse cx="1160" cy="610" rx="56" ry="20" fill="rgba(0,230,118,.07)" filter="url(#soft)"/>
      <line class="stem" x1="1160" y1="510" x2="1160" y2="610"/>
      <circle class="foot" cx="1160" cy="610" r="2.6"/>
      <g class="node  logo-node">
        <polygon class="halo" points="1160,401.5 1277,460 1160,518.5 1043,460"/>
        <polygon class="f-l" points="1060,460 1160,510 1160,536 1060,486"/>
        <polygon class="f-r" points="1160,510 1260,460 1260,486 1160,536"/>
        <polygon class="f-top" points="1160,410 1260,460 1160,510 1060,460"/>
        <polygon class="flash" points="1160,410 1260,460 1160,510 1060,460" style="--dur:7.2s;--fd:5.72s"/>
        <g transform="translate(1160 460) matrix(.8944 .4472 -.8944 .4472 0 0)">
        <image href="/cifrato/hero/aspel.png" x="-40" y="-22.4" width="80" height="34.8" preserveAspectRatio="xMidYMid meet"/>
        
      </g>
      </g>
      
      <g class="tip" aria-hidden="true">
        <rect class="tip-bg" x="1065.6" y="367" width="188.9" height="28" rx="7"/>
        <path class="tip-tail" d="M 1155 394.5 L 1165 394.5 L 1160 401 Z"/>
        <text class="tip-label" x="1160.1" y="386"
              text-anchor="middle" font-size="14">Software contable</text>
      </g>
    </g>
    <g class="node-in" data-node="siigo" style="--in:1.00s">
      <ellipse cx="1040" cy="625" rx="56" ry="20" fill="rgba(0,230,118,.07)" filter="url(#soft)"/>
      <line class="stem" x1="1040" y1="570" x2="1040" y2="625"/>
      <circle class="foot" cx="1040" cy="625" r="2.6"/>
      <g class="node  logo-node">
        <polygon class="halo" points="1040,461.5 1157,520 1040,578.5 923,520"/>
        <polygon class="f-l" points="940,520 1040,570 1040,596 940,546"/>
        <polygon class="f-r" points="1040,570 1140,520 1140,546 1040,596"/>
        <polygon class="f-top" points="1040,470 1140,520 1040,570 940,520"/>
        <polygon class="flash" points="1040,470 1140,520 1040,570 940,520" style="--dur:7.2s;--fd:5.79s"/>
        <g transform="translate(1040 520) matrix(.8944 .4472 -.8944 .4472 0 0)">
        <image href="/cifrato/hero/siigo.png" x="-41" y="-31.1" width="82" height="52.2" preserveAspectRatio="xMidYMid meet"/>
        
      </g>
      </g>
      
      <g class="tip" aria-hidden="true">
        <rect class="tip-bg" x="945.6" y="427" width="188.9" height="28" rx="7"/>
        <path class="tip-tail" d="M 1035 454.5 L 1045 454.5 L 1040 461 Z"/>
        <text class="tip-label" x="1040.1" y="446"
              text-anchor="middle" font-size="14">Software contable</text>
      </g>
    </g>
  </svg>`;
