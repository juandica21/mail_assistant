// Encuentra la barra de herramientas del correo
function findComposeToolbar() {
    const selectors = [
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) return toolbar;
    }
    return null;
}

// Crea el botón "RespuestaIA"
function createBtnReplyAI() {
    const btn = document.createElement('div');
    btn.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3 ai-reply-button';
    btn.style.marginRight = '8px';
    btn.style.padding = '0 16px';
    btn.style.borderRadius = '16px'; 
    btn.innerHTML = 'RespuestaIA';
    btn.setAttribute('role', 'button');
    btn.setAttribute('data-tooltip', 'Generar RespuestaIA');

    return btn;
}

// Obtiene el contenido del email
function getEmailContent() {
    const selectors = [
        '.h7',
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentation"]'
    ];
    for (const selector of selectors) {
        const cont = document.querySelector(selector);
        if (cont) return cont.innerText.trim();
    }
    return '';
}

// Inyecta el botón en la barra de herramientas
function injectButton() {
    const existingBtn = document.querySelector('.ai-reply-button');
    if (existingBtn) existingBtn.remove();

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log('No Toolbar encontrada...');
        return;
    }

    console.log('Toolbar encontrada...');

    const btn = createBtnReplyAI();

    btn.addEventListener('click', async () => {
        try {
            btn.innerHTML = 'Generando...';
            btn.disabled = true;

            const emailContent = getEmailContent();
            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: emailContent,
                    tone: "professional"
                })
            });

            if (!response.ok) throw new Error('Error en la consulta a la API');

            const generatedReply = await response.text();

            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.error('ComposeBox no encontrada...');
            }
        } catch (err) {
            alert('Error al intentar crear una respuesta...');
        } finally {
            btn.innerHTML = 'RespuestaIA';
            btn.disabled = false;
        }
    });

    toolbar.insertBefore(btn, toolbar.firstChild);
}

// Observador para detectar cuando se abre un compose nuevo
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
            setTimeout(injectButton, 500);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
