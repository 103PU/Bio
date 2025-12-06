// --- 1. YOUTUBE VIDEO BACKGROUND API ---
var player;
var lastVolume = 30; // Lưu mức âm lượng gần nhất để restore khi unmute

// Hàm này được YouTube API gọi tự động khi tải xong
function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player', {
        videoId: 'e94hCLHEEsk', // ID Video của bạn
        playerVars: {
            'autoplay': 1,
            'controls': 0,
            'showinfo': 0,
            'modestbranding': 1,
            'loop': 1,
            'playlist': 'e94hCLHEEsk', // Cần thiết để loop hoạt động
            'mute': 0,         // Bắt buộc MUTE để autoplay được
            'playsinline': 1,
            'rel': 0
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();

    // Logic Volume Slider
    const volSlider = document.getElementById('vol-slider');
    const volIcon = document.getElementById('vol-icon');

    // Hàm cập nhật giao diện slider
    const updateSliderUI = (value) => {
        volSlider.style.setProperty('--vol-percent', `${value}%`);
        volSlider.value = value; // Cập nhật vị trí nút kéo

        // Đổi icon theo mức âm lượng
        if (value == 0) {
            volIcon.className = 'fa-solid fa-volume-xmark';
        } else if (value < 50) {
            volIcon.className = 'fa-solid fa-volume-low';
        } else {
            volIcon.className = 'fa-solid fa-volume-high';
        }
    };

    // --- FIX: LOGIC BẤM ICON ĐỂ MUTE/UNMUTE ---
    volIcon.addEventListener('click', () => {
        if (player.isMuted() || volSlider.value == 0) {
            // Đang tắt -> Bật lại mức cũ (hoặc 30 nếu chưa có)
            let targetVol = lastVolume > 0 ? lastVolume : 30;
            player.unMute();
            player.setVolume(targetVol);
            updateSliderUI(targetVol);
        } else {
            // Đang bật -> Tắt (lưu lại mức hiện tại)
            lastVolume = volSlider.value;
            player.mute();
            player.setVolume(0);
            updateSliderUI(0);
        }
    });

    // Sự kiện kéo thanh trượt
    volSlider.addEventListener('input', function () {
        const volume = this.value;

        // Nếu volume > 0 thì bật tiếng
        if (volume > 0 && player.isMuted()) {
            player.unMute();
        } else if (volume == 0) {
            player.mute();
        }

        // Lưu lại volume nếu khác 0 để dùng cho toggle
        if (volume > 0) lastVolume = volume;

        player.setVolume(volume);
        updateSliderUI(volume);
    });

    // Set UI ban đầu
    updateSliderUI(30);
}

// Inject YouTube API Script vào trang
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


// --- 2. EXISTING LOGIC (TILT & SCROLL) ---
document.addEventListener('DOMContentLoaded', () => {

    // --- LOGIC 3D TILT ---
    const cards = document.querySelectorAll('.js-tilt');

    const handleTilt = (e, card) => {
        if (!card.classList.contains('in-view')) return;
        const cardRect = card.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const rotateX = -((e.clientY - centerY) / 30);
        const rotateY = ((e.clientX - centerX) / 30);

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    };

    const resetTilt = (card) => {
        card.style.transform = '';
    };

    if (window.matchMedia('(hover: hover)').matches) {
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => handleTilt(e, card));
            card.addEventListener('mouseleave', () => resetTilt(card));
        });
    }

    // --- SCROLL ANIMATION ---
    const observerOptions = {
        threshold: 0.0075,
        rootMargin: "10px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const card = entry.target;
            if (entry.isIntersecting) {
                card.classList.add('in-view');
            } else {
                card.classList.remove('in-view');
                card.style.transform = '';
            }
        });
    }, observerOptions);

    cards.forEach(card => {
        observer.observe(card);
    });
});