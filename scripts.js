// Contact form submission handling
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    form.reset();
                    successMessage.style.display = 'block';
                    // Hide success message after 5 seconds
                    setTimeout(() => {
                        successMessage.style.display = 'none';
                    }, 5000);
                } else {
                    throw new Error('Failed to send message');
                }
            } catch (error) {
                alert('Sorry, there was an error sending your message. Please try again.');
            }
        });
    }

    /* Project card subtle sway (parallax) -------------------------------------------------
       - Adds a tiny 3D tilt (rotateX/rotateY) and small translateY 'lift' following mouse
       - Disabled on touch devices; reduced on small screens
    */
    (function initCardSway(){
        const isTouch = (('ontouchstart' in window) || navigator.maxTouchPoints > 0);
        if (isTouch) return; // don't run on touch devices

        const cards = Array.from(document.querySelectorAll('#projects .card'));
        if (!cards.length) return;

        // Track mouse
        const mouse = { x: window.innerWidth/2, y: window.innerHeight/2 };
        window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

        // Per-card state for smoothing
        const state = cards.map(card => ({
            el: card,
            rect: card.getBoundingClientRect(),
            rx: 0, ry: 0, ty: 0
        }));

        function updateRects(){ state.forEach(s => s.rect = s.el.getBoundingClientRect()); }
        window.addEventListener('resize', updateRects);

        function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

        function animate(){
            state.forEach(s => {
                const r = s.rect;
                const cx = r.left + r.width/2;
                const cy = r.top + r.height/2;
                const dx = (mouse.x - cx) / r.width; // roughly -1..1
                const dy = (mouse.y - cy) / r.height;

                const maxTilt = 6; // degrees
                const targetRy = clamp(dx * maxTilt, -maxTilt, maxTilt);
                const targetRx = clamp(-dy * maxTilt, -maxTilt, maxTilt);

                // Slight lift when hovered, small idle lift otherwise
                const hovered = s.el.matches(':hover');
                const targetTy = hovered ? -6 : -2;

                // Smooth the values (simple lerp)
                s.rx += (targetRx - s.rx) * 0.12;
                s.ry += (targetRy - s.ry) * 0.12;
                s.ty += (targetTy - s.ty) * 0.12;

                // Compose transform (preserve perspective to make tilt feel natural)
                s.el.style.transform = `perspective(900px) translateY(${s.ty}px) rotateX(${s.rx}deg) rotateY(${s.ry}deg)`;
            });
            requestAnimationFrame(animate);
        }

        // Reduce intensity on very small screens
        function shouldReduce(){ return window.innerWidth <= 767; }
        if (shouldReduce()){
            // make the effect milder on mobile-sized widths
            state.forEach(s => s.el.style.transition = 'transform 180ms ease');
        }

        requestAnimationFrame(animate);
    })();
});
