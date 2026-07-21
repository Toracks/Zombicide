from flask import Flask, jsonify, render_template
import pandas as pd
import os

app = Flask(__name__, template_folder=".", static_folder=".", static_url_path="")

EXCEL_PATH = "Data/Survivants-Zombicide.xlsx"

@app.route("/")
def index():
    return render_template("HTML.html")

@app.route("/api/personnages")
def api_personnages():
    df = pd.read_excel(EXCEL_PATH)
    df = df.dropna(subset=["Personnage"])
    df = df.sort_values(by="Personnage", key=lambda col: col.str.lower())

    personnages = []
    for _, row in df.iterrows():
        character = str(row["Personnage"]).strip()
        id_perso = int(row["ID"])

        categories = []
        for colonne in ["Category 1", "Category 2", "Category 3"]:
            valeur = row[colonne]
            if pd.notna(valeur):
                categories.append(str(valeur).strip())

        personnages.append({
            "character": character,
            "id": id_perso,
            "image": f"Survivants/{character}-{id_perso}.webp",
            "categories": categories
        })

    return jsonify(personnages)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5010))
    app.run(debug=True, port=port, host="0.0.0.0")