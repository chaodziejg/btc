function btcoptions() {
    editProfile = function(){
	fetch('system/box/edit_profile.php', {
		method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            token: utk,
            cp: "chat",
        }),
	})
   .then(response => response.text())
    .then(response => {
        showEmptyModal(response, 580);
setUserTheme();
    })
}
//document.getElementById("actual_theme").setAttribute("href", "css/themes/Dark/Dark.css?v=3.29");
function setUserTheme() {
    fetch("system/action/action_profile.php", {
    method: "POST",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
        token: utk,
        cp: "chat",
        set_user_theme: "Dark"
    })
})
.then(response => response.json())
.then(data => {
    const bbfv = "";
    document.getElementById("actual_theme").setAttribute(
        "href",
        "css/themes/" + data.theme + "/" + data.theme + ".css" + bbfv
    );
})
.catch(error => {
    console.error("Error:", error);
});

    const element = document.querySelector('div.proitem[onclick="getDisplaySetting();"]');
    element.onclick = function () {
        console.log("BTC settings clicked!");
    };
    const iconContainer = element.querySelector('.bcell_mid');
    if (iconContainer) {
        iconContainer.innerHTML = `
          <svg fill="#ffffff" version="1.1" xmlns="http://www.w3.org/2000/svg" 
            width="16" height="16" viewBox="0 0 479.79 479.79" style="vertical-align: middle; margin-right: 6px;">
            <g>
              <path d="M478.409,116.617c-0.368-4.271-3.181-7.94-7.2-9.403c-4.029-1.472-8.539-0.47-11.57,2.556l-62.015,62.011l-68.749-21.768
                l-21.768-68.748l62.016-62.016c3.035-3.032,4.025-7.543,2.563-11.565c-1.477-4.03-5.137-6.837-9.417-7.207
                c-37.663-3.245-74.566,10.202-101.247,36.887c-36.542,36.545-46.219,89.911-29.083,135.399c-1.873,1.578-3.721,3.25-5.544,5.053
                L19.386,373.152c-0.073,0.071-0.145,0.149-0.224,0.219c-24.345,24.346-24.345,63.959,0,88.309
                c24.349,24.344,63.672,24.048,88.013-0.298c0.105-0.098,0.201-0.196,0.297-0.305l193.632-208.621
                c1.765-1.773,3.404-3.628,4.949-5.532c45.5,17.167,98.9,7.513,135.474-29.056C468.202,191.181,481.658,154.275,478.409,116.617z
                M75.98,435.38c-8.971,8.969-23.5,8.963-32.47,0c-8.967-8.961-8.967-23.502,0-32.466c8.97-8.963,23.499-8.963,32.47,0
                C84.947,411.878,84.947,426.419,75.98,435.38z"/>
            </g>
          </svg>
          BTC settings
        `;
    }
}
}

function newthemeoption() {
    function addOption(modalContentElement) {
        const existing = modalContentElement.querySelector('.text_xxreg.bold');
        if (existing) return;
        const settingElement = modalContentElement.querySelector('.setting_element');
        if (!settingElement) return;
        const container = modalContentElement.querySelector('.bpad15') || modalContentElement;
        const newDiv = document.createElement('div');
        newDiv.className = 'text_xxreg bold';
        newDiv.textContent = 'Theme settings';
        settingElement.parentNode.insertBefore(newDiv, settingElement);
    }
    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== 1) continue;

                if (node.matches && (node.matches('div.modal_content'))) {
                    addOption(node);
                } else {
                    node.querySelectorAll && node.querySelectorAll('div.modal_content').forEach(el => {
                        addOption(el);
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
