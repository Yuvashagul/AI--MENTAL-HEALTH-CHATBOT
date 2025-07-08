class JarvisApp {
  constructor() {
    this.recognition = null;
    this.speechSynth = window.speechSynthesis;
    this.voiceEnabled = true;
    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.lang = "en-US";
      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.handleUserInput(transcript);
      };
      this.recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        this.toggleLoading(false);
      };
    }
  }

  toggleLoading(show) {
    document.getElementById("loading").classList.toggle("hidden", !show);
  }

  async sendMessage() {
    const input = document.getElementById("userInput");
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    this.handleUserInput(text);
  }

  async handleUserInput(text) {
    this.addMessage(text, "user");
    this.toggleLoading(true);
    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await response.json();
      this.addMessage(data.response, "bot");
      if (this.voiceEnabled) this.speak(data.response);
    } catch (err) {
      this.addMessage("Something went wrong.", "bot");
    } finally {
      this.toggleLoading(false);
    }
  }

  addMessage(message, sender) {
    const history = document.getElementById("chatHistory");
    const div = document.createElement("div");
    div.className = sender;
    div.innerText = `${sender === "user" ? "🧑" : "🤖"}: ${message}`;
    history.appendChild(div);
    history.scrollTop = history.scrollHeight;
  }

  speak(text) {
    if (!this.speechSynth) return;
    const utterance = new SpeechSynthesisUtterance(text);
    this.speechSynth.speak(utterance);
  }

  startListening() {
    if (this.recognition) this.recognition.start();
  }
}

const jarvis = new JarvisApp();
