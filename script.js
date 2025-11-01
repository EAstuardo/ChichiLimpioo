let score = 0;
        let timeLeft = 60;
        let lives = 3;
        let gameInterval = null;
        let itemInterval = null;
        let selectedBin = null;
        let isGameActive = false;
        let isPaused = false;
        let fallingItems = [];

        const items = [
            { emoji: '🥤', type: 'plastico', name: 'Botella' },
            { emoji: '🍾', type: 'vidrio', name: 'Botella de vidrio' },
            { emoji: '📄', type: 'papel', name: 'Papel' },
            { emoji: '🍎', type: 'organico', name: 'Manzana' },
            { emoji: '🧃', type: 'plastico', name: 'Jugo' },
            { emoji: '📦', type: 'papel', name: 'Caja' },
            { emoji: '🍌', type: 'organico', name: 'Banana' },
            { emoji: '🥫', type: 'plastico', name: 'Lata' },
            { emoji: '📰', type: 'papel', name: 'Periódico' },
            { emoji: '🥕', type: 'organico', name: 'Zanahoria' },
            { emoji: '🍊', type: 'organico', name: 'Naranja' },
            { emoji: '📋', type: 'papel', name: 'Documento' }
        ];

        function switchTab(tabName) {
            const tabs = document.querySelectorAll('.tab-content');
            tabs.forEach(tab => tab.classList.remove('active'));
            document.getElementById(tabName).classList.add('active');

            const navBtns = document.querySelectorAll('.nav-btn');
            navBtns.forEach(btn => {
                if (btn.dataset.tab === tabName) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            document.getElementById('mobileMenu').classList.remove('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });

            if (tabName !== 'juego' && isGameActive) {
                pauseGame();
            }
        }

        function toggleMenu() {
            const menu = document.getElementById('mobileMenu');
            menu.classList.toggle('active');
        }

        function toggleNewsDetails(newsId) {
            const details = document.getElementById(newsId);
            details.classList.toggle('active');
        }

        function selectBin(type) {
            if (!isGameActive || isPaused) return;
            
            selectedBin = type;
            
            document.querySelectorAll('.bin').forEach(bin => {
                if (bin.dataset.type === type) {
                    bin.classList.add('selected');
                } else {
                    bin.classList.remove('selected');
                }
            });
        }

        function createFallingItem() {
            if (!isGameActive || isPaused) return;

            const gameArea = document.getElementById('gameArea');
            const item = items[Math.floor(Math.random() * items.length)];
            const fallingItem = document.createElement('div');
            
            fallingItem.className = 'falling-item';
            fallingItem.textContent = item.emoji;
            fallingItem.dataset.type = item.type;
            fallingItem.dataset.name = item.name;
            
            const maxX = gameArea.offsetWidth - 50;
            const randomX = Math.random() * maxX;
            fallingItem.style.left = randomX + 'px';
            fallingItem.style.top = '-50px';
            
            const fallDuration = 3000 + Math.random() * 2000;
            let startTime = Date.now();
            let animationFrame;
            
            function animate() {
                if (!isGameActive || isPaused) return;
                
                const elapsed = Date.now() - startTime;
                const progress = elapsed / fallDuration;
                
                if (progress >= 1) {
                    if (fallingItem.parentNode) {
                        fallingItem.remove();
                        lives--;
                        document.getElementById('livesValue').textContent = lives;
                        
                        if (lives <= 0) {
                            endGame(false);
                        }
                    }
                    return;
                }
                
                const newTop = -50 + (gameArea.offsetHeight * progress);
                fallingItem.style.top = newTop + 'px';
                
                animationFrame = requestAnimationFrame(animate);
            }
            
            fallingItem.onclick = function(e) {
                e.stopPropagation();
                if (!selectedBin || !isGameActive || isPaused) return;
                
                cancelAnimationFrame(animationFrame);
                
                if (selectedBin === this.dataset.type) {
                    score += 10;
                    showFeedback('✓', '#16a34a', this);
                    createParticles(this, '✨');
                } else {
                    score = Math.max(0, score - 5);
                    lives--;
                    document.getElementById('livesValue').textContent = lives;
                    showFeedback('✗', '#ef4444', this);
                    
                    if (lives <= 0) {
                        endGame(false);
                    }
                }
                
                document.getElementById('scoreValue').textContent = score;
                this.remove();
            };
            
            gameArea.appendChild(fallingItem);
            fallingItems.push({ element: fallingItem, animation: animationFrame });
            animate();
        }

        function showFeedback(text, color, element) {
            const feedback = document.createElement('div');
            feedback.className = 'feedback';
            feedback.textContent = text;
            feedback.style.color = color;
            feedback.style.left = element.offsetLeft + 'px';
            feedback.style.top = element.offsetTop + 'px';
            
            document.getElementById('gameArea').appendChild(feedback);
            setTimeout(() => feedback.remove(), 500);
        }

        function createParticles(element, emoji) {
            const gameArea = document.getElementById('gameArea');
            for (let i = 0; i < 5; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.textContent = emoji;
                particle.style.left = element.offsetLeft + (Math.random() * 40 - 20) + 'px';
                particle.style.top = element.offsetTop + 'px';
                gameArea.appendChild(particle);
                setTimeout(() => particle.remove(), 1000);
            }
        }

        function startGame() {
            isGameActive = true;
            isPaused = false;
            score = 0;
            timeLeft = 60;
            lives = 3;
            selectedBin = null;
            
            document.getElementById('scoreValue').textContent = score;
            document.getElementById('timerValue').textContent = timeLeft;
            document.getElementById('livesValue').textContent = lives;
            document.getElementById('gameOver').classList.remove('active');
            document.getElementById('startBtn').style.display = 'none';
            document.getElementById('pauseBtn').style.display = 'inline-block';
            document.getElementById('resetBtn').style.display = 'inline-block';

            document.querySelectorAll('.falling-item').forEach(item => item.remove());
            document.querySelectorAll('.bin').forEach(bin => bin.classList.remove('selected'));
            fallingItems = [];

            gameInterval = setInterval(() => {
                if (!isPaused) {
                    timeLeft--;
                    document.getElementById('timerValue').textContent = timeLeft;
                    
                    if (timeLeft <= 0) {
                        endGame(true);
                    }
                }
            }, 1000);

            itemInterval = setInterval(() => {
                if (!isPaused) {
                    createFallingItem();
                }
            }, 1200);
        }

        function pauseGame() {
            isPaused = !isPaused;
            const pauseBtn = document.getElementById('pauseBtn');
            pauseBtn.textContent = isPaused ? '▶ Reanudar' : '⏸ Pausar';
        }

        function endGame(timeUp) {
            isGameActive = false;
            isPaused = false;
            clearInterval(gameInterval);
            clearInterval(itemInterval);
            
            document.querySelectorAll('.falling-item').forEach(item => item.remove());
            document.querySelectorAll('.bin').forEach(bin => bin.classList.remove('selected'));
            fallingItems = [];
            
            document.getElementById('finalScore').textContent = score;
            document.getElementById('gameOver').classList.add('active');
            
            const title = document.getElementById('gameOverTitle');
            const message = document.getElementById('gameOverMessage');
            
            if (!timeUp) {
                title.textContent = '😢 Perdiste todas las vidas';
                message.textContent = '¡Inténtalo de nuevo!';
            } else if (score >= 200) {
                title.textContent = '🏆 ¡Excelente!';
                message.textContent = '¡Eres un experto en reciclaje!';
            } else if (score >= 100) {
                title.textContent = '👍 ¡Muy Bien!';
                message.textContent = '¡Buen trabajo clasificando!';
            } else {
                title.textContent = '🎮 ¡Juego Terminado!';
                message.textContent = '¡Sigue practicando!';
            }
        }

        function resetGame() {
            if (isGameActive) {
                clearInterval(gameInterval);
                clearInterval(itemInterval);
            }
            
            isGameActive = false;
            isPaused = false;
            document.querySelectorAll('.falling-item').forEach(item => item.remove());
            document.querySelectorAll('.bin').forEach(bin => bin.classList.remove('selected'));
            fallingItems = [];
            
            document.getElementById('gameOver').classList.remove('active');
            document.getElementById('startBtn').style.display = 'inline-block';
            document.getElementById('pauseBtn').style.display = 'none';
            document.getElementById('resetBtn').style.display = 'none';
            document.getElementById('scoreValue').textContent = '0';
            document.getElementById('timerValue').textContent = '60';
            document.getElementById('livesValue').textContent = '3';
            document.getElementById('pauseBtn').textContent = '⏸ Pausar';
            selectedBin = null;
        }