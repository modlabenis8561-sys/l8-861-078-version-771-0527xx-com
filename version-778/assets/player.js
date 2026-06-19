import { H as Hls } from './hls-vendor-dru42stk.js';

const players = Array.from(document.querySelectorAll('.js-player'));

players.forEach((video) => {
    const shell = video.closest('.video-shell');
    const trigger = shell ? shell.querySelector('.player-trigger') : null;
    const source = video.dataset.src;
    let hls = null;
    let initialized = false;

    const initialize = () => {
        if (initialized || !source) {
            return;
        }

        initialized = true;

        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        }
    };

    const play = () => {
        initialize();
        const request = video.play();
        if (request && typeof request.catch === 'function') {
            request.catch(() => {});
        }
    };

    initialize();

    if (trigger) {
        trigger.addEventListener('click', play);
    }

    video.addEventListener('play', () => {
        if (trigger) {
            trigger.classList.add('is-hidden');
        }
    });

    video.addEventListener('pause', () => {
        if (trigger) {
            trigger.classList.remove('is-hidden');
        }
    });

    video.addEventListener('ended', () => {
        if (trigger) {
            trigger.classList.remove('is-hidden');
        }
    });

    window.addEventListener('beforeunload', () => {
        if (hls) {
            hls.destroy();
        }
    });
});
