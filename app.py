from flask import Flask, jsonify, render_template
import pandas as pd
import os

app = Flask(__name__, template_folder=".", static_folder=".", static_url_path="")

EXCEL_PATH = "Data/Survivants-Zombicide.xlsx"
POUVOIRS_PATH = "Data/Capacites-Zombicide.xlsx"


@app.route("/")
def index():
    return render_template("HTML.html")

@app.route("/api/personnages")
def api_personnages():
    df = pd.read_excel(EXCEL_PATH)
    df = df.dropna(subset=["Personnage"])
    df = df.sort_values(by="Personnage", key=lambda col: col.str.lower())
    df_pouvoirs = pd.read_excel(POUVOIRS_PATH)
    descriptions_pouvoirs = dict(zip(df_pouvoirs["Power"], df_pouvoirs["Description"]))

    personnages = []
    for _, row in df.iterrows():
        character = str(row["Personnage"]).strip()
        id_perso = int(row["ID"])

        categories = []
        for colonne in ["Category 1", "Category 2", "Category 3"]:
            valeur = row[colonne]
            if pd.notna(valeur):
                categories.append(str(valeur).strip())

        pouvoirs = []
        for colonne in ["Power 1", "Power 2", "Power 3", "Power 4", "Power 5", "Power 6", "Power 7"]:
            valeur = row[colonne]
            if pd.notna(valeur):
                noms_capacites = [c.strip() for c in str(valeur).split("/")]
                for nom in noms_capacites:
                    description = descriptions_pouvoirs.get(nom, "Description à venir")
                    pouvoirs.append({"nom": nom, "description": description})

        pouvoirs_par_case = []
        for colonne in ["Power 1", "Power 2", "Power 3", "Power 4", "Power 5", "Power 6", "Power 7"]:
            valeur = row[colonne]
            case = []
            if pd.notna(valeur):
                noms_capacites = [c.strip() for c in str(valeur).split("/")]
                for nom in noms_capacites:
                    description = descriptions_pouvoirs.get(nom, "Description à venir")
                    case.append({"nom": nom, "description": description})
            pouvoirs_par_case.append(case)

        personnages.append({
            "character": character,
            "id": id_perso,
            "image": f"Survivants/{character}-{id_perso}.webp",
            "categories": categories,
            "pouvoirs": pouvoirs,
            "pouvoirs_par_case": pouvoirs_par_case
        })

    return jsonify(personnages)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5010))
    app.run(debug=True, port=port, host="0.0.0.0")