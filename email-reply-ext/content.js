// ======= Helpers =======
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
    btn.style.cursor = 'pointer';
    return btn;
}

function getEmailContent() {
    const selectors = ['.h7', '.a3s.aiL', '[role="presentation"]'];
    for (const selector of selectors) {
        const cont = document.querySelector(selector);
        if (cont) {
            // Evitamos incluir la cita del correo anterior
            const quotes = cont.querySelectorAll('.gmail_quote');
            quotes.forEach(q => q.remove());
            return cont.innerText.trim();
        }
    }
    return '';
}

async function generateReply(language, emailContent) {
    const storage = await chrome.storage.sync.get(['userInfo']);
    const backendUrl = "http://localhost:8080";
    const selectedUserInfo = storage.userInfo || "No hay datos adicionales";

    if (!backendUrl) {
        alert('Configura el backend en el panel lateral');
        throw new Error('Falta configuración de backend');
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
        composeBox.textContent = text;
        composeBox.focus();
        const range = document.createRange();
        range.selectNodeContents(composeBox);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else {
        console.error('ComposeBox no encontrada...');
    }
}

function injectButton(label, className, language) {
    const existingBtn = document.querySelector(`.${className}`);
    if (existingBtn) existingBtn.remove();

    const toolbar = findComposeToolbar();
    if (!toolbar) return;

    const btn = createBtnReplyAI(label, className);
    btn.addEventListener('click', async () => {
        try {
            btn.innerHTML = language === 'ES' ? 'Generando...' : 'Generating...';
            btn.style.pointerEvents = 'none';

            const emailContent = getEmailContent();
            if (!emailContent) {
                alert('No se encontró contenido del email para generar la respuesta.');
                return;
            }

            const generatedReply = await generateReply(language, emailContent);
            insertTextInCompose(generatedReply);
        } catch (err) {
            alert('Error al generar respuesta');
            console.error(err);
        } finally {
            btn.innerHTML = label;
            btn.style.pointerEvents = 'auto';
        }
    });

    toolbar.insertBefore(btn, toolbar.firstChild);
}

function injectButtonES() {
    injectButton('RespuestaIA', 'ai-reply-button-es', 'ES');
}

function injectButtonEN() {
    injectButton('AI Reply', 'ai-reply-button-en', 'EN');
}

// ======= Observador =======
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

const mainContainer = document.querySelector('div[role="main"]') || document.body;
observer.observe(mainContainer, { childList: true, subtree: true });
