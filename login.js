function containsLoginDefaults() {
    const scripts = document.querySelectorAll('script[data-cfasync="false"]');
    for (let script of scripts) {
        const scriptText = script.textContent.trim();
        if (scriptText.includes("var logged = 0;") && scriptText.includes("var utk = '0';")) {
            return true;
        }
    }
    return false;
}
function setTextAndBackgrounds() {
    if (containsLoginDefaults()) {
        const footer = document.getElementById("main_footer");
        if (footer) {
            footer.style.background = "#2C2C2C";
        }

        const intro = document.getElementById("intro_top");
        if (intro) {
            intro.style.background = "#2C2C2C";
            intro.style.height = "175px";
            const logo = document.getElementById('login_logo');
            if (logo) {
                logo.src = 'https://raw.githubusercontent.com/pog-bot-dot-lot-tot-got-rot-mot-pot-not/betterteenchat/refs/heads/main/logo4.png';
            }
        }

        const section = document.querySelector('div.section');
        if (section) {
            section.style.background = "#2C2C2C";
            section.style.textAlign = "center";
            section.style.overflowY = "auto";

            const content = document.querySelector('div.section_content.pad15');
            if (content) {
                const children = Array.from(content.children);
                const elementsToKeep = children.slice(0, 2);
                children.forEach(child => {
                    if (!elementsToKeep.includes(child)) {
                        content.removeChild(child);
                    }
                });
            }
            const paragraph = section.querySelector('p');
            if (paragraph) {
                paragraph.textContent = "Join a safe, friendly space moderated by a dedicated team. No downloads or payments required! Chat with hundreds of teens using private chat, games, music, and more. Please review our Chat Rules before entering. Respect moderators and follow guidelines to keep the community safe.";
                paragraph.style.color = "#ffffff";
                paragraph.style.overflowWrap = "break-word";
                paragraph.style.whiteSpace = "normal";
                paragraph.id = "joinText";
            }
            const heading = section.querySelector('h2');
            if (heading) {
                heading.style.fontSize = "1.5em";
                heading.style.color = "#9400D3";
                heading.id = "whyJoin";
            }
        }
    }
    const paragraph = document.querySelector('p.text_med');
    if (paragraph) {
        paragraph.textContent = "";
        paragraph.textContent = "Welcome to our free teen chat! Meet new friends, share fun moments, and connect with teens worldwide in a safe, moderated space. Join as a guest or register your username - just follow the rules to keep the chat safe for everyone.";
        paragraph.id = "welcomeText";
    }
}

function betterstyling() {
    if (containsLoginDefaults()) {
        const wrap = document.getElementById("login_wrap");
        if (wrap) {
            wrap.style.display = "flex";
            wrap.style.flexDirection = "column";
            wrap.style.minHeight = "100px";
        }
        const intro = document.getElementById("intro_top");
        if (intro) {
            intro.style.flex = "0 1 auto";
            intro.style.minHeight = "40vh";
            intro.style.overflowY = "auto";
            intro.style.paddingTop = "50px";

            const loginBtn = document.querySelector('.intro_login_btn.large_button_rounded.ok_btn.btnshadow');
            const guestBtn = document.querySelector('.intro_guest_btn.large_button_rounded.default_btn.btnshadow');
            const registerBtn = document.querySelector('.text_med.bold.bclick.tpad5');
            const registerTxt = document.querySelector('.text_xsmall');

            if (loginBtn && registerBtn && guestBtn) {
                const buttonRow = document.createElement('div');
                buttonRow.className = 'button-row';

                loginBtn.parentNode.insertBefore(buttonRow, loginBtn);

                buttonRow.appendChild(loginBtn);
                buttonRow.appendChild(registerBtn);

                buttonRow.parentNode.insertBefore(guestBtn, buttonRow.nextSibling);

                const sharedButtonStyles = {
                    display: 'inline-block',
                    padding: '12px 24px',
                    lineHeight: '1.2',
                    borderRadius: '8px',
                    fontSize: '16px',
                    minWidth: '200px',
                    backgroundColor: '#03add8',
                    fontWeight: 'normal',
                    color: '#fff',
                    border: 'none',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                    margin: '0',
                    verticalAlign: 'middle'
                };

                Object.assign(loginBtn.style, sharedButtonStyles);
                Object.assign(registerBtn.style, sharedButtonStyles);
                registerBtn.textContent = "Register";
                registerBtn.id = "registerBtn";
                loginBtn.id = "loginBtn";
                guestBtn.id = "guestBtn";

                guestBtn.style.padding = '8px 16px';
                guestBtn.style.borderRadius = '6px';
                guestBtn.style.fontSize = '14px';
                guestBtn.style.minWidth = '120px';
                guestBtn.style.backgroundColor = 'transparent';
                guestBtn.style.color = '#03add8';
                guestBtn.style.border = '2px solid #03add8';
                guestBtn.style.cursor = 'pointer';
                guestBtn.style.transition = 'color 0.3s ease, border-color 0.3s ease, background-color 0.3s ease';
                guestBtn.style.marginTop = '15px';
                guestBtn.style.marginBottom = '10px';

                guestBtn.classList.add('guest-login');

                const style = document.createElement('style');
                style.textContent = `
                .button-row {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                    margin-bottom: 10px;
                    flex-wrap: wrap;
                }
                .guest-login {
                    display: block;
                    text-align: center;
                    font-size: 14px;
                    margin: 0 auto 10px;
                    transition: color 0.3s ease, border-color 0.3s ease, background-color 0.3s ease;
                }
                .intro_login_btn:hover,
                .text_med.bold.bclick.tpad5:hover {
                    background-color: #0296bd !important;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
                }
                .guest-login:hover {
                    color: #fff !important;
                    background-color: #03add8 !important;
                    border-color: #03add8 !important;
                }
                @media (max-width: 480px) {
                    .button-row {
                        flex-direction: column;
                        gap: 8px;
                    }
                }
            `;
            document.head.appendChild(style);
            }
            if (registerTxt) {
                registerTxt.remove();
            }
        }
        const section = document.querySelector("div.section");
        if (section) {
            section.style.flex = "1 1 auto";
            section.style.flexDirection = "column";
            section.style.display = "flex";

            const sectionContent = document.querySelector("div.section_content.pad15")
            if (sectionContent) {
                sectionContent.style.marginTop = "auto";
                sectionContent.style.paddingBottom = "30px";
            }
        }
        const footer = document.getElementById("main_footer");
        if (footer) {
            footer.style.flexShrink = "0";
            footer.style.height = "auto";
            footer.style.minHeight = "60px";
            footer.style.padding = "10px 20px";
            footer.style.textAlign = "center";
            const homeLink = document.querySelector('#menu_main_footer a[href="https://www.teen-chat.org/teenchat"]');
            const homeLi = homeLink ? homeLink.closest('li') : null;
            if (homeLi) {
                homeLi.remove();
            }
            const languageLi = document.querySelector('#menu_main_footer li[onclick="getLanguage();"]');
            if (languageLi) {
                languageLi.remove();
            }
        }
        document.body.style.overflowX = "hidden";
        document.body.style.overflowY = "hidden";
        document.body.style.background = "#2C2C2C";
    }
}
function languagedropdown() {
    function getCurrentLanguageCode() {
        const scripts = document.querySelectorAll('script[data-cfasync="false"]');
        for (const script of scripts) {
            const src = script.getAttribute('src');
            if (src) {
                const match = src.match(/system\/language\/([^\/]+)\/language\.js/);
                if (match) {
                    return match[1];
                }
            }
        }
        return null;
    }

    const langBtn = document.getElementById('intro_lang');

    const languages = [
    { code: 'Arabic', name: 'العربية', eng: 'Arabic', flag: 'system/language/Arabic/flag.png' },
    { code: 'Bulgarian', name: 'Български', eng: 'Bulgarian', flag: 'system/language/Bulgarian/flag.png' },
    { code: 'Croatia', name: 'Hrvatski', eng: 'Croatian', flag: 'system/language/Croatia/flag.png' },
    { code: 'English', name: 'English', eng: 'English', flag: 'system/language/English/flag.png' },
    { code: 'Francais', name: 'Français', eng: 'French', flag: 'system/language/Francais/flag.png' },
    { code: 'German', name: 'Deutsch', eng: 'German', flag: 'system/language/German/flag.png' },
    { code: 'Greek', name: 'Ελληνικά', eng: 'Greek', flag: 'system/language/Greek/flag.png' },
    { code: 'Hebrew', name: 'עברית', eng: 'Hebrew', flag: 'system/language/Hebrew/flag.png' },
    { code: 'Netherlands', name: 'Nederlands', eng: 'Dutch', flag: 'system/language/Netherlands/flag.png' },
    { code: 'Portuguese', name: 'Português', eng: 'Portuguese', flag: 'system/language/Portuguese/flag.png' },
    { code: 'Romana', name: 'Română', eng: 'Romanian', flag: 'system/language/Romana/flag.png' },
    { code: 'Russian', name: 'Русский', eng: 'Russian', flag: 'system/language/Russian/flag.png' },
    { code: 'Spanish', name: 'Español', eng: 'Spanish', flag: 'system/language/Spanish/flag.png' },
    { code: 'Turkish', name: 'Türkçe', eng: 'Turkish', flag: 'system/language/Turkish/flag.png' },
    ];
    function updateLanguageButtonFromScript() {
        const currentCode = getCurrentLanguageCode();
        if (!currentCode) return;

        const lang = languages.find(l => l.code === currentCode);
        if (!lang) return;

        updateLanguageButtonText(lang.name, lang.eng);
    }
    function updateLanguageButtonText(nativeName, englishName) {
        const innerDiv = langBtn.querySelector('.bcell_mid.centered_element');
        if (!innerDiv) return;

        innerDiv.style.whiteSpace = 'nowrap';
        innerDiv.style.display = 'flex';
        innerDiv.style.alignItems = 'center';
        innerDiv.style.justifyContent = 'flex-end';
        langBtn.style.display = 'flex';
        langBtn.style.alignItems = 'center';
        langBtn.style.justifyContent = 'flex-end';
        const style = document.createElement('style');
        style.textContent = `
        .bcell_mid.centered_element {
            border-radius: 6px;
            padding: 5px;
            border: 2px solid transparent;
            box-sizing: border-box;
            transition: border 0.3s ease;
        }
        .bcell_mid.centered_element:hover {
            border: 2px solid #03add8;
        }
        `;
        document.head.appendChild(style);

        langBtn.style.right = 'auto';
        langBtn.style.left = 'auto';
        const viewportWidth = window.innerWidth;
        const lagnWidth = langBtn.offsetWidth;
        const leftPos = viewportWidth - lagnWidth - 20;
        langBtn.style.left = (leftPos < 20 ? 20 : leftPos) + 'px';
        langBtn.style.right = 'auto';
        let langText = innerDiv.querySelector('span.lang-text');
        if (!langText) {
            langText = document.createElement('span');
            langText.className = 'lang-text';
            langText.style.marginRight = '8px';
            langText.style.fontSize = '14px';
            langText.style.color = '#eee';
            langText.style.userSelect = 'none';
            langText.style.verticalAlign = 'middle';
            innerDiv.insertBefore(langText, innerDiv.querySelector('img.intro_lang'));
        }
        langText.textContent = `${nativeName} (${englishName})`;
        const langImg = innerDiv.querySelector('img.intro_lang');
        if (langImg) {
            langImg.style.display = 'inline-block';
            langImg.style.verticalAlign = 'middle';
            langImg.style.height = '16px';
            langImg.style.width = '24px';
        }
    }

    updateLanguageButtonFromScript();
    if (langBtn) {
        const dropdown = document.createElement('div');
        dropdown.id = 'lang-dropdown-menu';
        dropdown.style.position = 'absolute';
        dropdown.style.backgroundColor = '#2C2C2C';
        dropdown.style.border = '1px solid #555';
        dropdown.style.borderRadius = '6px';
        dropdown.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
        dropdown.style.padding = '8px 0';
        dropdown.style.width = '220px';
        dropdown.style.zIndex = 9999;
        dropdown.style.opacity = '0';
        dropdown.style.pointerEvents = 'none';
        dropdown.style.transform = 'translateY(-10px)';
        dropdown.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

        languages.forEach(({code, name, eng, flag}) => {
            const option = document.createElement('div');
            option.className = 'lang-option';
            option.style.display = 'flex';
            option.style.justifyContent = 'space-between';
            option.style.alignItems = 'center';
            option.style.padding = '8px 16px';
            option.style.cursor = 'pointer';
            option.style.color = '#eee';
            option.style.fontSize = '14px';
            option.style.userSelect = 'none';

            const text = document.createElement('span');
            text.textContent = `${name} (${eng})`;

            const img = document.createElement('img');
            img.src = flag;
            img.alt = eng + ' flag';
            img.style.width = '24px';
            img.style.height = '16px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '2px';

            option.appendChild(text);
            option.appendChild(img);

            option.addEventListener('mouseenter', () => {
                option.style.backgroundColor = '#444';
            });
            option.addEventListener('mouseleave', () => {
                option.style.backgroundColor = 'transparent';
            });

            option.addEventListener('click', () => {
                loadLanguage(code);
                closeDropdown();
            });

            dropdown.appendChild(option);
        });

        let isOpen = false;
        document.body.appendChild(dropdown);

        function openDropdown() {
            const rect = langBtn.getBoundingClientRect();
            dropdown.style.top = (rect.bottom + window.scrollY + 8) + 'px';
            dropdown.style.left = (rect.right + window.scrollX - dropdown.offsetWidth) + 'px';
            dropdown.style.opacity = '1';
            dropdown.style.pointerEvents = 'auto';
            dropdown.style.transform = 'translateY(0)';
            isOpen = true;
        }
        function closeDropdown() {
            dropdown.style.opacity = '0';
            dropdown.style.pointerEvents = 'none';
            dropdown.style.transform = 'translateY(-10px)';
            isOpen = false;
        }
        window.getLanguage = function() {
            if (isOpen) {
                closeDropdown();
            } else {
                openDropdown();
            }
        };

        document.addEventListener('click', function handleDocClick(e) {
            if (!dropdown.contains(e.target) && !langBtn.contains(e.target)) {
                if (isOpen) closeDropdown();
            }
        });

        dropdown.addEventListener('click', e => e.stopPropagation());
    }
}
let popupStyleInjected = false;

function popupStyle() {
  if (popupStyleInjected) return;
  popupStyleInjected = true;
  const style = document.createElement('style');
  style.textContent = `
  .popup-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .popup {
    position: relative;
    background: #1F1F1F;
    color: #1c1c1c;
    padding: 30px;
    border-radius: 10px;
    width: 350px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    font-family: sans-serif;
  }

  .popup h2 {
    margin-top: 0;
    text-align: center;
    color: #ffffff;
  }

  .popup label {
    display: block;
    margin: 12px 0 6px;
    color: #ffffff;
    font-size: 14px;
  }

  .popup input, .popup select {
    width: 100%;
    padding: 10px;
    font-size: 14px;
    background-color: #2C2C2C;
    color: #ffffff;  
    border: 1px solid #555;
    border-radius: 6px;
    box-sizing: border-box;
    outline: none;
  }
  .popup input::placeholder {
    color: #888;
  }
  .popup input:focus,
  .popup select:focus {
    border-color: #03add8;
  }

  .popup button {
    margin-top: 20px;
    width: 100%;
    padding: 10px;
    font-size: 16px;
    background: #03add8;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .popup button:hover {
    background: #0298bb;
  }

  .close-btn {
    position: absolute;
    top: 10px;
    right: 12px;
    font-size: 30px !important;
    font-weight: normal;
    background: transparent !important;
    width: 30px !important;
    height: 30px;
    border: 2px solid transparent !important;
    color: #ffffff;
    padding: 2px 6px !important;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    border-radius: 4px !important;
    transition: border 0.3s ease !important;
  }

  .close-btn:hover {
    border: 2px solid #03add8 !important;
    background: transparent !important;
  }
  #guest_info {
    font-size: 12px;
    font-weight: normal;
    color: #ffffff;
    margin-top: 20px;
  }

  .register_recaptcha {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 70px;
  }
  `;
  document.head.appendChild(style);
}

function betterregistration() {
  function createRegisterPopup() {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';

    const popup = document.createElement('div');
    popup.className = 'popup';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => document.body.removeChild(overlay);

    popup.innerHTML = `
      <h2>Register</h2>
      <label for="reg_username">Username</label>
      <input id="reg_username" name="username" type="text" placeholder="Enter username">
    
      <label for="reg_email">Email</label>
      <input id="reg_email" name="email" type="email" placeholder="Enter email">
    
      <label for="reg_password">Password</label>
      <input id="reg_password" name="password" type="password" placeholder="Enter password">
    
      <label for="reg_gender">Gender</label>
      <select id="reg_gender" name="gender">
        <option value="3">Select gender</option>
        <option value="1">Male</option>
        <option value="2">Female</option>
        <option value="3">Other</option>
      </select>

      <label for="reg_age">Age</label>
      <select id="reg_age" name="age">
        ${Array.from({ length: 7 }, (_, i) => {
          const age = 13 + i;
          return `<option>${age}</option>`;
        }).join('')}
      </select>

      <label>CAPTCHA</label>
      <div class="recapcha_div">
      <div id="recaptcha" class="register_recaptcha">
	    <div><input type="hidden" name="cf-turnstile-response" id="cf-chl-widget-slxqi_response"></div></div>
	    </div>

      <button id="register_btn">Register</button>
    `;

    popup.appendChild(closeBtn);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    document.getElementById('register_btn').addEventListener('click', function(event) {
      event.preventDefault();
      submitRegistration();
    });
    function submitRegistration() {
      const username = document.getElementById('reg_username').value.trim();
      const email = document.getElementById('reg_email').value.trim();
      const password = document.getElementById('reg_password').value;
      const gender = document.getElementById('reg_gender').value;
      const age = document.getElementById('reg_age').value;
      const captchaResponse = getCaptcha();

      if (!username || !email || !password || !gender || !age || !captchaResponse) {
        callError(system.emptyField);
        return;
      }

      const ageNum = parseInt(age, 10);
      if (isNaN(ageNum) || ageNum < 13 || ageNum > 19) {
        callError(system.ageRequirement || 'Age must be between 13 and 19.');
        return;
      }
      const formData = new URLSearchParams();
      formData.append('password', password);
      formData.append('username', username);
      formData.append('email', email);
      formData.append('age', age);
      formData.append('gender', gender);
      formData.append('recaptcha', captchaResponse);

      fetch('system/action/registration.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: formData.toString()
      })
      .then(response => response.text())
      .then(response => {
        if (response != '1') {
          resetCaptcha();
        }

        switch (response) {
          case '1':
            location.reload();
            break;
          case '2':
          case '3':
          case '14':
            callError(system.error);
            clearFields(['#reg_password', '#reg_username', '#reg_email']);
            break;
          case '4':
            callError(system.invalidUsername);
            clearFields(['#reg_username']);
            break;
          case '5':
            callError(system.usernameExist);
            clearFields(['#reg_username']);
            break;
          case '6':
            callError(system.invalidEmail);
            clearFields(['#reg_email']);
            break;
          case '7':
            callError(system.missingRecaptcha);
            break;
          case '8':
            callError(system.vpnUsage);
            break;
          case '10':
            callError(system.emailExist);
            clearFields(['#reg_email']);
            break;
          case '12':
            callError(system.selAge);
            break;
          case '13':
            callError(system.ageRequirement);
            break;
          case '14':
            callError("Malformed data. (err 14)");
            break;
          case '16':
            callError(system.maxReg);
            break;
          case '17':
            callError(system.invalidPass);
            clearFields(['#reg_password']);
            break;
          case '99':
            coppaRule();
            break;
          case '0':
            callError(system.registerClose);
            break;
          default:
            callError(system.error || 'Unknown error.');
        }
      });
    }

    function clearFields(selectors) {
      selectors.forEach(sel => $(sel).val(''));
    }
  }

  window.getRegistration = function() {
    popupStyle();
    createRegisterPopup();
    renderCaptcha();
  }

  window.renderCaptcha = function(){
  	if(recapt > 0){
  		if(recapt == 1){
  			grecaptcha.render("recaptcha", { 'sitekey': window.recaptKey, });
  		}
  		else if(recapt == 2){
  			hcaptcha.render("recaptcha", { 'sitekey': window.recaptKey, });
  		}
  		else if(recapt == 3){
  			turnstile.render("#recaptcha", { 'sitekey': window.recaptKey, 'theme': 'dark'});
  		}
  	}
  }
  window.getCaptcha = function(){
  	if(recapt > 0){
  		if(recapt == 1){
  			return grecaptcha.getResponse();
  		}
  		else if(recapt == 2){
  			return hcaptcha.getResponse();
  		}
  		else if(recapt == 3){
  			return turnstile.getResponse();
  		}
  	}
  	else {
  		return 'disabled';
  	}
  }
}
function betterlogin() {
  function createLoginPopup() {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';

    const popup = document.createElement('div');
    popup.className = 'popup';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => document.body.removeChild(overlay);

    popup.innerHTML = `
      <h2>Login</h2>
      <label for="login_username">Username/email</label>
      <input id="login_username" name="username" type="text" placeholder="Enter username/email">

      <label for="login_password">Password</label>
      <input id="login_password" name="password" type="password" placeholder="Enter password">

      <button id="login_btn">Login</button>
    `;

    popup.appendChild(closeBtn);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    document.getElementById('login_btn').addEventListener('click', function(event) {
      event.preventDefault();
      sendLogin();
    });
    function sendLogin() {
      const username = document.getElementById('login_username').value.trim();
      const password = document.getElementById('login_password').value;

      if (!username || !password) {
        callError(system.emptyField);
        return;
      }
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      fetch('system/action/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: formData.toString()
      })
      .then(response => response.text())
      .then(response => {
        switch (response) {
          case '1':
            callError(system.badLogin);
            break;
          case '2':
            callError(system.badLogin);
            break
          case '3':
            location.reload();
            break
          case '8':
            callError(system.vpnUsage);
            break;
          case '17':
            callError(system.missingRecaptcha);
          case '99':
            getLoginFail();
            callError(system.error);
            break;
          default:
            callError(system.error || 'Unknown error.');
        }
      });
    }
  }
  function createGuestPopup() {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';

    const popup = document.createElement('div');
    popup.className = 'popup';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => document.body.removeChild(overlay);


    popup.innerHTML = `
      <h2>Guest login</h2>
      <label for="gl_username">Username</label>
      <input id="gl_username" name="username" type="text" placeholder="Enter username">

      <label for="gl_gender">Gender</label>
      <select id="gl_gender" name="gender">
        <option value="3">Select gender</option>
        <option value="1">Male</option>
        <option value="2">Female</option>
        <option value="3">Other</option>
      </select>

      <label for="gl_age">Age</label>
      <select id="gl_age" name="age">
        ${Array.from({ length: 7 }, (_, i) => {
          const age = 13 + i;
          return `<option>${age}</option>`;
        }).join('')}
      </select>

      <button id="guestlogin_btn">Login</button>
      <p id="guest_info">View-only mode. Register a free account to chat and unlock more features.</p>
    `;

    popup.appendChild(closeBtn);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    document.getElementById('guestlogin_btn').addEventListener('click', function(event) {
      event.preventDefault();
      sendGuestLogin();
    });
    function sendGuestLogin() {
      const username = document.getElementById('gl_username').value.trim();
      const gender = document.getElementById('gl_gender').value;
      const age = document.getElementById('gl_age').value;
      const captchaResponse = getCaptcha();

      if (!username || !gender || !age || !captchaResponse) {
        callError(system.emptyField);
        return;
      }

      const ageNum = parseInt(age, 10);
      if (isNaN(ageNum) || ageNum < 13 || ageNum > 19) {
        callError(system.ageRequirement || 'Age must be between 13 and 19.');
        return;
      }
      const formData = new URLSearchParams();
      formData.append('gusername', username);
      formData.append('ggender', gender);
      formData.append('gage', age);
      formData.append('recaptcha', captchaResponse);

      fetch('system/action/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: formData.toString()
      })
      .then(response => response.text())
      .then(response => {
        if (response != '1') {
          resetCaptcha();
        }

        switch (response) {
          case '1':
            location.reload();
            break;
          case '2':
          case '3':
          case '4':
            callError(system.invalidUsername);
            clearFields(['#reg_username']);
            break;
          case '5':
            callError(system.usernameExist);
            clearFields(['#reg_username']);
            break;
          case '6':
            callError(system.missingRecaptcha);
            break;
          case '7':
          case '8':
            callError(system.vpnUsage);
            break;
          case '12':
            callError(system.selAge);
            break;
          case '13':
            callError(system.ageRequirement);
            break;
          case '14':
            callError("Malformed data. (err 14)");
            break;
          case '16':
            callError(system.maxReg);
            break;
          case '99':
            coppaRule();
            break;
          case '0':
            callError(system.registerClose);
            break;
          default:
            callError(system.error || 'Unknown error.');
        }
      });
    }

    function clearFields(selectors) {
      selectors.forEach(sel => $(sel).val(''));
    }
  }
  window.getLogin = function() {
    popupStyle();
    createLoginPopup();
  }
  window.getGuestLogin = function() {
    popupStyle();
    createGuestPopup();
  }
}