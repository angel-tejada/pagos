import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

/**
 * Web-only HTML shell. Native builds never see this file.
 *
 * The app renders inside an iPhone 16 Pro frame (402x874 screen, 12px bezel,
 * dynamic island, home indicator) so the browser preview shows true phone
 * proportions while editing. Frame measurements come from the approved mockup.
 */
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: FRAME_CSS }} />
      </head>
      <body>
        <div className="stage" id="stage">
          <div className="device">
            <div className="screen">
              <div className="status-bar">
                <div className="status-left">
                  <span className="time" id="clock">9:41</span>
                </div>
                <div className="status-right">
                  <svg width="18" height="12" viewBox="0 0 18 12">
                    <rect x="0" y="7.5" width="3" height="4.5" rx="1.1" fill="currentColor" />
                    <rect x="5" y="5.5" width="3" height="6.5" rx="1.1" fill="currentColor" />
                    <rect x="10" y="3.2" width="3" height="8.8" rx="1.1" fill="currentColor" />
                    <rect x="15" y="0.8" width="3" height="11.2" rx="1.1" fill="currentColor" />
                  </svg>
                  <svg width="17" height="12" viewBox="0 0 17 12">
                    <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                      <path d="M1.33 5.98 A8.75 8.75 0 0 1 15.67 5.98" />
                      <path d="M4.12 7.93 A5.35 5.35 0 0 1 12.88 7.93" />
                    </g>
                    <circle cx="8.5" cy="10.3" r="1.6" fill="currentColor" />
                  </svg>
                  <svg width="26.5" height="13" viewBox="0 0 26.5 13">
                    <rect x="0.5" y="0.5" width="24" height="12" rx="3.9" fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth="1" />
                    <path d="M25.4 4.6 a2.3 2.3 0 0 1 0 3.8 z" fill="currentColor" fillOpacity=".4" />
                    <rect x="2" y="2" width="18" height="9" rx="2.5" fill="currentColor" />
                  </svg>
                </div>
              </div>
              <div className="island" />
              <div className="app-slot">{children}</div>
              <div className="home-indicator" />
            </div>
          </div>
        </div>
        <div className="hint">Expo web preview — iPhone 16 Pro frame</div>
        <script dangerouslySetInnerHTML={{ __html: FRAME_JS }} />
      </body>
    </html>
  );
}

const FRAME_CSS = `
:root{
  --screen-w:402px; --screen-h:874px; --bezel:12px; --screen-r:55px;
  --device-r:calc(var(--screen-r) + var(--bezel));
  --device-w:calc(var(--screen-w) + var(--bezel)*2);
  --device-h:calc(var(--screen-h) + var(--bezel)*2);
  --status-h:62px; --island-w:125px; --island-h:37px; --island-top:11px;
  --home-w:139px; --home-h:5px; --home-bottom:8px; --scale:1;
}
*{ box-sizing:border-box; }
html,body{ height:100%; }
body{
  margin:0; background:#dcdcdf; display:grid; place-items:center; overflow:hidden;
  font-family:'Inter',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;
  -webkit-font-smoothing:antialiased;
}
.stage{ position:relative; width:calc(var(--device-w)*var(--scale)); height:calc(var(--device-h)*var(--scale)); }
.device{
  position:absolute; top:0; left:0; width:var(--device-w); height:var(--device-h);
  padding:var(--bezel); background:#000; border-radius:var(--device-r);
  transform:scale(var(--scale)); transform-origin:top left;
  box-shadow:0 0 0 .5px rgba(255,255,255,.14), 0 30px 60px -20px rgba(0,0,0,.45);
}
.screen{
  position:relative; width:var(--screen-w); height:var(--screen-h);
  border-radius:var(--screen-r); overflow:hidden; background:#000;
}
/* Chrome sits above the app and never intercepts taps. */
.status-bar{ position:absolute; inset:0 0 auto 0; height:var(--status-h); z-index:6; pointer-events:none; mix-blend-mode:difference; color:#fff; }
.status-left,.status-right{ position:absolute; top:var(--island-top); height:var(--island-h); display:flex; align-items:center; }
.status-left{ left:0; width:calc((var(--screen-w) - var(--island-w))/2); justify-content:center; }
.status-right{ right:21px; gap:6px; }
.status-right svg{ display:block; }
.time{ font-size:17px; font-weight:600; letter-spacing:.1px; font-variant-numeric:tabular-nums; line-height:1; }
.island{ position:absolute; top:var(--island-top); left:50%; transform:translateX(-50%); width:var(--island-w); height:var(--island-h); background:#000; border-radius:calc(var(--island-h)/2); z-index:7; pointer-events:none; }
.home-indicator{ position:absolute; bottom:var(--home-bottom); left:50%; transform:translateX(-50%); width:var(--home-w); height:var(--home-h); background:#fff; opacity:.85; border-radius:calc(var(--home-h)/2); z-index:7; pointer-events:none; mix-blend-mode:difference; }
/* The app fills the screen; safe-area vars give it the notch and home inset. */
.app-slot{ position:absolute; inset:0; overflow:hidden; }
.app-slot > div{ height:100%; }
#root{ height:100%; display:flex; flex-direction:column; }
.hint{ position:fixed; left:0; right:0; bottom:10px; text-align:center; font-size:12px; color:#6E6C68; pointer-events:none; }
`;

const FRAME_JS = `
(function(){
  var W=426,H=898,M=32;
  function fit(){
    var s=Math.min(1,(innerWidth-M)/W,(innerHeight-M-30)/H);
    document.getElementById('stage').style.setProperty('--scale',s);
  }
  fit(); addEventListener('resize',fit);
  function tick(){
    var d=new Date(), h=d.getHours()%12||12, m=String(d.getMinutes()).padStart(2,'0');
    var el=document.getElementById('clock'); if(el) el.textContent=h+':'+m;
  }
  tick(); setInterval(tick,10000);
})();
`;
