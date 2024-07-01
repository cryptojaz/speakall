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

    let countriesData;

fetch('https://unpkg.com/world-atlas/countries-50m.json')
    .then(res => res.json())
    .then(data => {
        countriesData = topojson.feature(data, data.objects.countries);
    });
    // Globe initialization
    let globe;

    function initGlobe() {
        globe = Globe()
            .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
            .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
            .width(400)
            .height(400)
            .backgroundColor('rgba(10,10,25,0)')
            .atmosphereColor('rgba(65,105,225,0.3)')
            .atmosphereAltitude(0.25);
    
        globe(globeContainer);
    }
    
    initGlobe();
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
         // Update globe and info with the first option in the new category
    if (options.length > 0) {
        updateGlobeAndInfo(options[0]);
    }
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
            console.log('Updating globe and info for:', selection, 'in category:', currentCategory);
            let info;
            let currentLanguageSet;
            switch(currentCategory) {
                case 'modernLanguages':
                    currentLanguageSet = languageInfo;
                    break;
                case 'historicLanguages':
                    currentLanguageSet = historicLanguageInfo;
                    break;
                case 'alienLanguage':
                    currentLanguageSet = alienLanguageInfo;
                    break;
                case 'funLanguages':
                    currentLanguageSet = funLanguageInfo;
                    break;
            }
        
            info = currentLanguageSet[selection];
        
            if (!info) {
                info = { 
                    coordinates: [0, 0], 
                    fact: `Information for ${selection} is not available yet.`
                };
            }
        
            if (currentCategory === 'alienLanguage') {
                globeContainer.innerHTML = `<img src="images/${selection.toLowerCase().replace(' ', '-')}.jpeg" alt="${selection}" style="width:100%;height:100%;object-fit:cover;">`;
                globe = null;  // Reset globe when showing alien image
            } else {
                if (!globe) {
                    globeContainer.innerHTML = '';
                    initGlobe();
                }
                if (globe && typeof globe.pointOfView === 'function') {
                    globe.pointOfView({ lat: info.coordinates[1], lng: info.coordinates[0], altitude: 1.5 }, 1000);
                    highlightCountry(selection);
                }
            }
        
            // Always update the country info, regardless of category
            countryInfo.innerHTML = `
                <h3>${selection}</h3>
                <p>${info.fact}</p>
            `;
        
            console.log('Updated info for:', selection, info);
        }
        
        function highlightCountry(countryName) {
            if (!countriesData || typeof THREE === 'undefined' || !globe) return;
        
            const highlightMaterial = new THREE.MeshPhongMaterial({
                color: 0xff0000,  // Bright red
                transparent: true,
                opacity: 0.8
            });
            
            const normalMaterial = new THREE.MeshPhongMaterial({
                color: 0xd3d3d3,  // Light gray
                transparent: true,
                opacity: 0.7
            });
        
            globe.polygonsData(countriesData.features)
                .polygonAltitude(0.06)
                .polygonCapColor(d => {
                    const currentInfo = languageInfo[countryName] || historicLanguageInfo[countryName] || funLanguageInfo[countryName];
                    if (currentInfo && currentInfo.countries) {
                        return currentInfo.countries.includes(d.properties.name) ? highlightMaterial : normalMaterial;
                    }
                    return normalMaterial;
                })
                .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
                .polygonStrokeColor(() => '#111');
        
            globe.scene().dispatchEvent(new CustomEvent('any'));
        }
      
    currentCategory = shuffleMode();
    // Initial setup
    updateLanguageOptions(currentCategory);

    highlightActiveButton(currentCategory);
    updateGlobeAndInfo(targetLanguage.value);
    
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
        const tweetContent = encodeURIComponent(`${customMessage} ${divider} ${outputText} https://www.speakallai.com/`);
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