// Story Format: Twee to JSON integration

(function() {
    "use strict";

    // Fonction d'extraction des balises
    function extractTags(rawTags) {
        const tags = rawTags.split(" ");
        let animation = null, sound = null, background = null;

        tags.forEach(tag => {
            if (tag.startsWith("animation-")) animation = tag.replace("animation-", "");
            if (tag.startsWith("sound-")) sound = tag.replace("sound-", "");
            if (tag.startsWith("background-")) background = tag.replace("background-", "");
        });

        return { animation, sound, background };
    }

    // Fonction pour analyser un fichier .twee et le convertir en JSON
    function parseTweeToJson(tweeContent) {
        const story = {};
        const passages = tweeContent.split("\n::").map(p => p.trim()).filter(p => p);

        passages.forEach(rawPassage => {
            const lines = rawPassage.split("\n");
            const header = lines[0].trim();
            const content = lines.slice(1).join("\n").trim();

            // Extraire le titre, les balises
            const titleMatch = header.match(/^(.*?)(?:\s*\[(.*?)\])?(?:\s*\{.*?\})?$/);
            if (!titleMatch) return;

            const title = titleMatch[1].trim();
            if(title == ":: StoryTitle" || title == ":: StoryData"){
                return;
            }
            const rawTags = titleMatch[2] || "";

            const { animation, sound, background } = extractTags(rawTags);

            // Extraire les liens
            const links = [];
            const updatedContent = content.replace(/\[\[(.*?)\|(.*?)\]\]/g, (match, text, target) => {
                links.push({ text, target });
                return ""; // Retirer le lien du contenu
            });

            // Ajouter le passage à l'histoire
            story[title] = {
                sentence: updatedContent.trim(),
                links,
                animation,
                sound,
                background
            };
        });

        return { characterName: "Unknown", story };
    }

    // Intégration de la logique dans Twine
    window.storyFormat = {
        "id": "custom-twee-json-format",
        "name": "Twee to JSON Format",
        "author": "Ton Nom",
        "version": "1.0",
        "description": "Un format qui permet de lire un fichier Twee et de le convertir en JSON",
        
        // Lors de l'initialisation du format, tu peux insérer un bouton pour télécharger ou afficher le JSON
        "start": function() {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.twee';
            fileInput.addEventListener('change', function(event) {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const tweeContent = e.target.result;
                        const jsonOutput = parseTweeToJson(tweeContent);

                        // Afficher le JSON dans la console ou l'intégrer dans l'histoire
                        console.log(JSON.stringify(jsonOutput, null, 2));

                        // Tu peux aussi ajouter des fonctionnalités pour télécharger le fichier JSON, si nécessaire
                        const downloadButton = document.createElement('button');
                        downloadButton.textContent = "Download JSON";
                        downloadButton.onclick = () => {
                            const blob = new Blob([JSON.stringify(jsonOutput, null, 2)], { type: "application/json" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "story.json";
                            a.click();
                            URL.revokeObjectURL(url);
                        };

                        document.body.appendChild(downloadButton);
                    };
                    reader.readAsText(file);
                }
            });

            document.body.appendChild(fileInput);
        }
    };

})();
