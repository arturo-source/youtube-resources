// ✅ TIP 1: el widget de chat solo se construye cuando el usuario lo abre.
let panel = null;

function createPanel() {
  panel = document.createElement("div");
  panel.className = "chat-panel";
  panel.hidden = true;
  panel.innerHTML = `
    <strong>Soporte TechStore</strong>
    <div class="messages">
      <div class="msg">¡Hola! 👋 ¿En qué podemos ayudarte?</div>
    </div>
    <input type="text" placeholder="Escribe un mensaje…">`;
  document.body.appendChild(panel);

  const input = panel.querySelector("input");
  const time = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" });
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || !input.value.trim()) return;
    const msg = document.createElement("div");
    msg.className = "msg";
    msg.textContent = `Tú (${time.format(new Date())}): ${input.value}`;
    panel.querySelector(".messages").appendChild(msg);
    input.value = "";
  });
}

export function toggleChat() {
  if (!panel) createPanel();
  panel.hidden = !panel.hidden;
  if (!panel.hidden) panel.querySelector("input").focus();
}
