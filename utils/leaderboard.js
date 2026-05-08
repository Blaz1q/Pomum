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
    console.log(scores);
  } catch (error) {
    console.error("Nie udało się pobrać wyników:", error);
  }
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
