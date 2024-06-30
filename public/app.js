import { languageInfo, funLanguageInfo, historicLanguageInfo, alienLanguageInfo } from './languagedata.js';

document.addEventListener('DOMContentLoaded', () => {
    const translateButton = document.getElementById('translateButton');
    const inputText = document.getElementById('inputText');
    const targetLanguage = document.getElementById('targetLanguage');
    const outputText = document.getElementById('outputText');
    const globeContainer = document.getElementById('globeContainer');
    const countryInfo = document.getElementById('countryInfo');
    const copyButton = document.getElementById('copyButton');
    const TwitterShareButtonButton = document.getElementById('TwitterShareButton');
    const modes = ['modernLanguages', 'historicLanguages', 'alienLanguage', 'funLanguages'];

    function shuffleMode() {
        return modes[Math.floor(Math.random() * modes.length)];
    }

    // Globe initialization
    const globe = Globe()
        .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
        .width(400)
        .height(400)
        .backgroundColor('rgba(10,10,25,0)')
        .atmosphereColor('rgba(65,105,225,0.3)')
        .atmosphereAltitude(0.25);

    globe(globeContainer);

    // Set initial location based on IP
    async function setInitialLocation() {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            globe.pointOfView({ lat: data.latitude, lng: data.longitude, altitude: 2.5 });
        } catch (error) {
            console.error('Error fetching location:', error);
        }
    }
    setInitialLocation();
    function rotateGlobe() {
        if (globe.rotation) {
            globe.rotation.y += 0.001;
        }
        requestAnimationFrame(rotateGlobe);
    }
    

    document.getElementById('openQuestionMode').addEventListener('click', () => {
        window.location.href = 'questionMode.html';
    });
    const categoryButtons = document.querySelectorAll('.category-button');
    let currentCategory = 'modernLanguages';

    function updateLanguageOptions(category) {
        targetLanguage.innerHTML = '';
        let options;
        switch(category) {
            case 'modernLanguages':
                options = Object.keys(languageInfo);
                break;
            case 'historicLanguages':
                options = Object.keys(historicLanguageInfo);
                break;
            case 'alienLanguage':
                options = Object.keys(alienLanguageInfo);
                break;
            case 'funLanguages':
                options = Object.keys(funLanguageInfo);
                break;
        }
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            targetLanguage.appendChild(optionElement);
        });
        updateGlobeAndInfo(targetLanguage.value);
    }

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentCategory = button.id;
            updateLanguageOptions(currentCategory);
        });
    });

        // Add the highlightActiveButton function here
        function highlightActiveButton(category) {
            categoryButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.id === category) {
                    btn.classList.add('active');
                }
            });
        }
    
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                currentCategory = button.id;
                highlightActiveButton(currentCategory);
                updateLanguageOptions(currentCategory);
            });
        });
        
    function updateGlobeAndInfo(selection) {
        let info;
        switch(currentCategory) {
            case 'modernLanguages':
                info = languageInfo[selection];
                break;
            case 'historicLanguages':
                info = historicLanguageInfo[selection];
                break;
            case 'alienLanguage':
                info = alienLanguageInfo[selection];
                break;
            case 'funLanguages':
                info = funLanguageInfo[selection];
                break;
        }

        if (!info) {
            info = { 
                coordinates: [0, 0], 
                fact: `Information for ${selection} is not available yet.`
            };
        }

        // Update globe visualization
        if (currentCategory === 'alienLanguage') {
            globeContainer.innerHTML = `<img src="images/${selection.toLowerCase()}.jpeg" alt="${selection}" style="width:100%;height:100%;object-fit:cover;">`;
        } else {
            if (globeContainer.innerHTML.includes('img')) {
                globeContainer.innerHTML = '';
                globe(globeContainer);
            }
            globe.pointOfView({ lat: info.coordinates[1], lng: info.coordinates[0], altitude: 1.5 }, 1000);
        }

        countryInfo.innerHTML = `
            <h3>${selection}</h3>
            <p>${info.fact}</p>
        `;
    }

    currentCategory = shuffleMode();
    // Initial setup
    updateLanguageOptions(currentCategory);

    highlightActiveButton(currentCategory);

    targetLanguage.addEventListener('change', (event) => {
        updateGlobeAndInfo(event.target.value);
    });

    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(outputText.textContent).then(() => {
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = 'Copy';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    });

    document.getElementById('twitterShareButton').addEventListener('click', function() {
        const outputText = document.getElementById('outputText').textContent;
        // Using a series of dashes or an emoji as a divider
        const divider = " —— ";
        const customMessage = "SpeakAll - Speak in any language, I mean any language!";
        const tweetContent = encodeURIComponent(customMessage + divider + outputText);
        const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetContent}`;
        window.open(tweetUrl, '_blank');
      });
      
      
      

      
    translateButton.addEventListener('click', async () => {
        const text = inputText.value;
        const language = targetLanguage.value;
    
        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text, targetLanguage: language }),
              });
          
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
          
            if (!response.ok) {
              const errorText = await response.text();
              console.error('Error response:', errorText);
              throw new Error(`Translation failed: ${response.statusText}. Details: ${errorText}`);
            }
          
    
            const data = await response.json();
            outputText.textContent = data.result;
            copyButton.disabled = false;
            updateGlobeAndInfo(language);
        } catch (error) {
            console.error('Error during translation:', error);
            outputText.textContent = 'An error occurred during translation: ' + error.message;
            copyButton.disabled = true;
        }
    });
    copyButton.disabled = true;
    updateGlobeAndInfo(targetLanguage.value);
});