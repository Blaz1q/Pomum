import { Settings } from "../dictionary.js";
import { t } from "../entityData/translations.js";

const API_URL = "https://pomumdb.7m.pl/index.php";
export async function saveScore(nick, game) {
  const data = new FormData();
  data.append("nickname", nick);
  data.append("score", game.score);
  data.append("round", game.round);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: data,
      // Mode 'cors' jest zazwyczaj domyślny, ale warto o nim pamiętać
      mode: "cors",
    });

    const result = await response.json();
    if (result.status === "success") {
      console.log("Wynik zapisany na serwerze 7m.pl!");
    } else {
      console.error("Błąd serwera:", result.msg);
    }
  } catch (error) {
    console.error("Błąd połączenia z API:", error);
  }
}

export async function getLeaderboard() {
  try {
    const response = await fetch(API_URL);
    const scores = await response.json();
    return scores;
  } catch (error) {
    console.error("Nie udało się pobrać wyników:", error);
  }
}
export async function getPlayerStats() {
    // 1. Pobieramy surowe dane z Twojej istniejącej funkcji
    const scores = await getLeaderboard();
    
    if (!scores || !Array.isArray(scores)) return [];

    // 2. Przekształcamy tablicę wyników w obiekt statystyk (mapę)
    const statsMap = scores.reduce((acc, current) => {
        const nick = current.nickname;

        // Inicjalizacja gracza, jeśli widzimy go pierwszy raz
        if (!acc[nick]) {
            acc[nick] = {
                nickname: nick,
                totalPoints: 0,
                totalPlays: 0,
                totalRounds: 0,
                highestScore: 0,
                wins: 0,
            };
        }

        // Agregacja danych
        acc[nick].totalPlays += 1;
        acc[nick].totalPoints += current.score;
        acc[nick].totalRounds += current.round;
        
        // Sprawdzanie rekordu punktowego
        if (current.score > acc[nick].highestScore) {
            acc[nick].highestScore = current.score;
        }

        if (current.round >= 20) {
            acc[nick].wins += 1;
        }

        return acc;
    }, {});

    // 3. Zamieniamy obiekt na tablicę i obliczamy współczynniki (np. winrate)
    const playerList = Object.values(statsMap).map(player => {
        return {
            nickname: player.nickname,
            totalPoints: player.totalPoints,
            totalPlays: player.totalPlays,
            avgPoints: Math.round(player.totalPoints / player.totalPlays),
            highestScore: player.highestScore,
            // Obliczanie winrate (procent wygranych gier)
            winRate: ((player.wins / player.totalPlays) * 100).toFixed(1) + "%"
        };
    });

    // 4. Sortujemy np. po łącznej liczbie punktów
    return playerList.sort((a, b) => b.totalPoints - a.totalPoints);
}
export async function checkNickname() {
  const usernameInput = document.getElementById("username");
  const statusDiv = document.getElementById("nick-status");
  try {
    const response = await fetch(
      `${API_URL}?check=${encodeURIComponent(usernameInput.value.trim())}`
    );
    const result = await response.json();

    if (result.available) {
      statusDiv.dataset.i18n = "server."+result.msg,Settings;
      statusDiv.textContent = "✅ " + t("server."+result.msg,Settings.LANGUAGE);
      statusDiv.style.color = "lightgreen";
      usernameInput.style.borderColor = "lightgreen";
      localStorage.setItem('lastNickname', usernameInput.value.trim());
    } else {
      statusDiv.dataset.i18n = "server."+result.msg,Settings;
      statusDiv.textContent = "❌ " + t("server."+result.msg,Settings.LANGUAGE);
      statusDiv.style.color = "red";
      usernameInput.style.borderColor = "red";
    }
  } catch (error) {
    console.log(error);
    statusDiv.dataset.i18n = "server.error";
    statusDiv.textContent = + t("server.error",Settings.LANGUAGE);
    statusDiv.style.color = "red";
  }
}
