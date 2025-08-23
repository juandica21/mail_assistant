function findComposeToolbar() {
    const selectors = ['.btC', '.aDh', '[role="toolbar"]', '.gU.Up'];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) return toolbar;
    }
    return null;
}

function createBtnReplyAI(label, className) {
    const btn = document.createElement('div');
    btn.className = `T-I J-J5-Ji aoO v7 T-I-atl L3 ${className}`;
    btn.style.marginRight = '8px';
    btn.style.padding = '0 16px';
    btn.style.borderRadius = '16px';
    btn.innerHTML = label;
    btn.setAttribute('role', 'button');
    btn.setAttribute('data-tooltip', `Generar ${label}`);
    return btn;
}

function getEmailContent() {
    const selectors = ['.h7', '.a3s.aiL', '.gmail_quote', '[role="presentation"]'];
    for (const selector of selectors) {
        const cont = document.querySelector(selector);
        if (cont) return cont.innerText.trim();
    }
    return '';
}

async function generateReply(language, emailContent) {
    const { backendUrl, userInfo } = await chrome.storage.sync.get(['backendUrl', 'userInfo']);

    const selectedUserInfo = userInfo || "No hay datos adicionales"; // <-- valor por defecto

    if (!backendUrl) {
        alert('Configura el backend en el panel lateral');
        throw new Error('Falta configuración');
    }

    const endpoint = language === 'ES' ? '/api/email/generateES' : '/api/email/generateEN';
    const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: emailContent,
            tone: 'professional',
            userInfo: selectedUserInfo
        })
    });

    if (!response.ok) throw new Error('Error en la consulta a la API');
    return await response.text();
}

function insertTextInCompose(text) {
    const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
    if (composeBox) {
        composeBox.innerHTML = '';
        composeBox.focus();
        document.execCommand('insertText', false, text);
    } else {
        console.error('ComposeBox no encontrada...');
    }
}

function injectButtonES() {
    const existingBtn = document.querySelector('.ai-reply-button-es');
    if (existingBtn) existingBtn.remove();

    const toolbar = findComposeToolbar();
    if (!toolbar) return;

    const btn = createBtnReplyAI('RespuestaIA', 'ai-reply-button-es');
    btn.addEventListener('click', async () => {
        try {
            btn.innerHTML = 'Generando...';
            btn.disabled = true;

            const emailContent = getEmailContent();
            const generatedReply = await generateReply('ES', emailContent);

            insertTextInCompose(generatedReply);
        } catch (err) {
            alert('Error al generar respuesta');
            console.error(err);
        } finally {
            btn.innerHTML = 'RespuestaIA';
            btn.disabled = false;
        }
    });

    toolbar.insertBefore(btn, toolbar.firstChild);
}

function injectButtonEN() {
    const existingBtn = document.querySelector('.ai-reply-button-en');
    if (existingBtn) existingBtn.remove();

    const toolbar = findComposeToolbar();
    if (!toolbar) return;

    const btn = createBtnReplyAI('AI Reply', 'ai-reply-button-en');
    btn.addEventListener('click', async () => {
        try {
            btn.innerHTML = 'Generating...';
            btn.disabled = true;

            const emailContent = getEmailContent();
            const generatedReply = await generateReply('EN', emailContent);

            insertTextInCompose(generatedReply);
        } catch (err) {
            alert('Error al generar respuesta');
            console.error(err);
        } finally {
            btn.innerHTML = 'AI Reply';
            btn.disabled = false;
        }
    });

    toolbar.insertBefore(btn, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(
            node => node.nodeType === Node.ELEMENT_NODE &&
                (node.matches('.aDh, .btC, [role="dialog"]') ||
                    node.querySelector('.aDh, .btC, [role="dialog"]'))
        );

        if (hasComposeElements) {
            console.log("Compose detectado...");
            setTimeout(injectButtonEN, 500);
            setTimeout(injectButtonES, 500);
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });