// static/script.js
class AICodeGenerator {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.typingIndicator = document.getElementById('typingIndicator');
        
        this.initEventListeners();
    }

    initEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Clear input
        this.userInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Send to backend
            const response = await this.generateCode(message);
            
            // Hide typing indicator
            this.hideTypingIndicator();

            if (response.status === 'success') {
                this.addMessage(response.response, 'bot');
            } else {
                this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('Network error. Please check your connection.', 'bot');
            console.error('Error:', error);
        }
    }

    async generateCode(message) {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });

        return await response.json();
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatarIcon = sender === 'user' ? 'fa-user' : 'fa-robot';
        
        let messageContent = `
            <div class="message-content">
                <i class="fas ${avatarIcon} avatar"></i>
                <div class="message-bubble">
        `;

        // Check if content contains code blocks
        if (content.includes('```')) {
            const parts = content.split('```');
            parts.forEach((part, index) => {
                if (index % 2 === 1) {
                    // This is a code block
                    const codeLines = part.split('\n');
                    const language = codeLines[0].trim() || 'text';
                    const code = codeLines.slice(1).join('\n');
                    
                    messageContent += `
                        <div class="code-block">
                            <div class="code-header">
                                <span class="code-language">${language}</span>
                                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                            </div>
                            <pre><code>${this.escapeHtml(code)}</code></pre>
                        </div>
                    `;
                } else if (part.trim()) {
                    // Regular text
                    messageContent += `<p>${this.escapeHtml(part).replace(/\n/g, '<br>')}</p>`;
                }
            });
        } else {
            messageContent += `<p>${this.escapeHtml(content).replace(/\n/g, '<br>')}</p>`;
        }

        messageContent += `
                </div>
            </div>
        `;

        messageDiv.innerHTML = messageContent;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showTypingIndicator() {
        this.typingIndicator.classList.add('active');
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.typingIndicator.classList.remove('active');
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

// Copy code function
window.copyCode = function(button) {
    const codeBlock = button.closest('.code-block');
    const code = codeBlock.querySelector('code').innerText;
    
    navigator.clipboard.writeText(code).then(() => {
        button.textContent = 'Copied!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = 'Copy';
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        button.textContent = 'Failed';
        
        setTimeout(() => {
            button.textContent = 'Copy';
        }, 2000);
    });
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AICodeGenerator();
});
