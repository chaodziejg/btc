function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function fixbackground() {
    document.body.style.background = "#2C2C2C";
    const observer = new MutationObserver((mutationsList, observer) => {
    const modal = document.querySelector('#large_modal');
    if (modal) {
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.15)';
        modal.style.pointerEvents = 'none';
        Array.from(modal.children).forEach(child => {
            child.style.pointerEvents = 'auto';
        });
        observer.disconnect();
    }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function removegradient() {
    const removeGradientClass = (el) => {
        if (el.classList?.contains('pro_top')) {
            el.classList.remove('pro_top');
        } else if ((el.classList?.contains('bhead'))) {
            el.classList.remove('bhead');
        }
    };

    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    removeGradientClass(node);
                    node.querySelectorAll?.('.pro_top').forEach(removeGradientClass);
                    node.querySelectorAll?.('.bhead').forEach(removeGradientClass);
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    document.querySelectorAll('.pro_top').forEach(removeGradientClass);
    document.querySelectorAll('.bhead').forEach(removeGradientClass);
}

function betterspinners() {
    if (!document.getElementById('betterspinners-styles')) {
        const style = document.createElement('style');
        style.id = 'betterspinners-styles';
        style.textContent = `
            @keyframes rotate {
                100% { transform: rotate(360deg); }
            }
            @keyframes dash {
                0% {
                    stroke-dasharray: 1, 150;
                    stroke-dashoffset: 0;
                }
                50% {
                    stroke-dasharray: 90, 150;
                    stroke-dashoffset: -35;
                }
                100% {
                    stroke-dasharray: 1, 150;
                    stroke-dashoffset: -125;
                }
            }
            .spinner {
                width: 40px;
                height: 40px;
                animation: rotate 2s linear infinite;
                box-sizing: content-box;
                display: inline-block;
                vertical-align: middle;
            }
            .spinner svg {
                width: 100%;
                height: 100%;
                animation: rotate 2s linear infinite;
                transform-origin: 50% 50%;
                display: block;
            }
            .spinner .path {
                stroke-dasharray: 90, 150;
                stroke-dashoffset: 0;
                transform-origin: 50% 50%;
                animation: dash 2s ease-in-out infinite;
                shape-rendering: geometricPrecision;
                stroke-linecap: round;
                stroke: #3498db;
                stroke-width: 4;
                fill: none;
            }`;
        document.head.appendChild(style);
    }

    const SVG_NS = "http://www.w3.org/2000/svg";

    function createSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'spinner';

        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('viewBox', '0 0 50 50');

        const circle = document.createElementNS(SVG_NS, 'circle');
        circle.classList.add('path');
        circle.setAttribute('cx', '25');
        circle.setAttribute('cy', '25');
        circle.setAttribute('r', '20');

        svg.appendChild(circle);
        spinner.appendChild(svg);
        return spinner;
    }

    function replaceSpinnerElement(oldSpinner) {
        const newSpinner = createSpinner();
        oldSpinner.replaceWith(newSpinner);
    }

    function replaceAllSpinners() {
        document.querySelectorAll('i.boom_spinner, i.bspin').forEach(el => {
            replaceSpinnerElement(el);
        });
    }

    replaceAllSpinners();

    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== 1) continue;

                if (node.matches && (node.matches('i.boom_spinner') || node.matches('i.bspin'))) {
                    replaceSpinnerElement(node);
                } else {
                    node.querySelectorAll && node.querySelectorAll('i.boom_spinner, i.bspin').forEach(el => {
                        replaceSpinnerElement(el);
                    });
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function betterdark() {
    const footer = document.querySelector('div#wrap_footer');
    if (footer) {
        footer.style.backgroundImage = 'none';
        footer.style.backgroundColor = '#101010';
    }

    const chatHead = document.querySelector('div#chat_head');
    if (chatHead) {
        chatHead.style.backgroundImage = 'none';
        chatHead.style.backgroundColor = '#101010';
    }
}
    /*sleep(5).then(() => {
        var theme = "Dark";
        $.ajax({
            url: "system/action/action_profile.php",
            type: "post",
            cache: false,
            dataType: 'json',
            data: {
                set_user_theme: theme,
            },
            success: function(response) {
                const bbfv = "";
                $("#actual_theme").attr("href", "css/themes/" + response.theme + "/" + response.theme + ".css" + bbfv);
                $('#main_logo').attr('src', response.logo);
                    
            },
        });
    });*/
const newSrc = 'https://raw.githubusercontent.com/pog-bot-dot-lot-tot-got-rot-mot-pot-not/betterteenchat/refs/heads/main/logo4.png';
const logo = document.querySelector('#main_logo');
if (logo) {
    logo.src = newSrc;
    const data = {
        newSrc: logo.src
    };
}