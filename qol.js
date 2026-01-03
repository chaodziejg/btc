function fixProMs() {
    // stop profile music autoplay
    loadProMusic = function () {
        const audio = document.getElementById('promusic');
        const player = document.getElementById('proplayer');

        if (!audio) return;

        const audioSource = audio.getAttribute('data-pmusic');
        if (!audioSource) return;

        audio.src = audioSource;
        audio.load();

        const playIcon = document.querySelector('.proplayer_play');
        const beatIcon = document.querySelector('.proplayer_beat');

        if (playIcon) {
            playIcon.setAttribute('src', 'default_images/icons/play.svg');
        }
        if (beatIcon) {
            beatIcon.setAttribute('src', 'default_images/profile/wavestop.gif');
        }

        if (player) {
            player.setAttribute('data-state', '0');
        }
    };
}