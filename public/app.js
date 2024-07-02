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

    const imageUpload = document.getElementById('imageUpload');
    if (!imageUpload) {
        console.error('imageUpload input not found');
    }
 
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
            if (globe && typeof globe.pointOfView === 'function') {
                globe.pointOfView({ lat: data.latitude, lng: data.longitude, altitude: 2.5 });
            } } catch (error) {
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
   
    function resetUIAfterImageDescription() {
        globeContainer.innerHTML = '';
        initGlobe();
        inputText.style.display = 'block';
        targetLanguage.style.display = 'block';
        translateButton.textContent = 'Translate';
        if (lastImageDescription) {
            inputText.value = lastImageDescription;
            lastImageDescription = '';
        }
        outputText.textContent = ''; // Clear the output text
        uploadedImageData = null;
        isImageMode = false;
    }
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
            case 'translateImage':
                options = Object.keys(languageInfo); // Use modern languages for image translation
                break;
            default:
                options = [];
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
            currentCategory = button.id;
            highlightActiveButton(currentCategory);
            if (button.id !== 'translateImage') {
                updateLanguageOptions(currentCategory);
                resetUIAfterImageDescription();
            }
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
                case 'translateImage':
                    // For translateImage, we don't need to update the globe or info
                    return;
                default:
                    console.error('Unknown category:', currentCategory);
                    return;
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
            if (button.id !== 'translateImage') {
                updateLanguageOptions(currentCategory);
            }
        });
    });

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
        const textToCopy = outputText.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
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
      
      
 
      const translateImageButton = document.getElementById('translateImage');
    
      if (translateImageButton && imageUpload) {
          translateImageButton.addEventListener('click', () => {
              imageUpload.click();
          });
      
          
          
          let uploadedImageData = null;

          let isImageMode = false;
          let lastImageDescription = '';

            
          imageUpload.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = async (e) => {
                const img = new Image();
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(img, 0, 0);
                  const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
                  
                  uploadedImageData = {
                    data: base64Image,
                    mimeType: 'image/jpeg'
                  };
          
                  globeContainer.innerHTML = `<img src="data:image/jpeg;base64,${base64Image}" alt="Uploaded Image" style="width:100%;height:100%;object-fit:contain;">`;
                  countryInfo.innerHTML = `<h3>Selected Image</h3><p>${file.name}</p>`;
                  isImageMode = true;
                  inputText.style.display = 'none';
                  targetLanguage.style.display = 'none';
                  translateButton.textContent = 'Translate Image';
                  outputText.textContent = 'Image uploaded. Click Translate Image to process.';
                  lastImageDescription = '';
                };
                img.src = e.target.result;
              };
              reader.readAsDataURL(file);
            }
          });


          // Modify the category button event listeners
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (button.id !== 'translateImage') {
            isImageMode = false;
            translateButton.textContent = 'Translate';
            inputText.style.display = 'block';
            outputText.style.display = 'block';
            outputText.textContent = ''; // Clear the output text
            if (lastImageDescription) {
                inputText.value = lastImageDescription;
                lastImageDescription = '';
            }
        }
        currentCategory = button.id;
        highlightActiveButton(currentCategory);
        updateLanguageOptions(currentCategory);
    });
});
       // Modify the translate button event listener
translateButton.addEventListener('click', async () => {
    translateButton.disabled = true;
    translateButton.classList.add('button-disabled');
    translateButton.classList.add('button-processing');
    
    const language = targetLanguage.value;
    let textToTranslate = inputText.value;

    if (isImageMode) {
        translateButton.textContent = 'Processing...Average 10 seconds';
        try {
            const describeResponse = await fetch('/api/describeImage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    image: uploadedImageData.data, 
                    mimeType: uploadedImageData.mimeType 
                }),
            });

            if (!describeResponse.ok) {
                const errorText = await describeResponse.text();
                throw new Error(`Image description failed: ${errorText}`);
            }

            const responseData = await describeResponse.json();
            lastImageDescription = responseData.englishDescription;
            outputText.textContent = lastImageDescription;
            copyButton.disabled = false;
            uploadedImageData = null;
            translateButton.textContent = 'Image Description';
            translateButton.disabled = true;
        } catch (error) {
            console.error('Error describing image:', error);
            outputText.textContent = 'An error occurred while processing the image. Please try again.';
        } finally {
            translateButton.disabled = false;
            translateButton.classList.remove('button-disabled');
            translateButton.classList.remove('button-processing');
            translateButton.textContent = 'Translate';
        }
    } else {
        if (!textToTranslate.trim()) {
            outputText.textContent = 'Please enter text to translate or upload an image.';
            translateButton.disabled = false;
            translateButton.classList.remove('button-disabled');
            return;
        }

        try {
            const translateResponse = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: textToTranslate, targetLanguage: language }),
            });

            if (!translateResponse.ok) {
                throw new Error(`Translation failed: ${translateResponse.statusText}`);
            }

            const translateData = await translateResponse.json();
            outputText.textContent = translateData.result;
            copyButton.disabled = false;
            updateGlobeAndInfo(language);
        } catch (error) {
            console.error('Error during translation:', error);
            outputText.textContent = 'An error occurred during translation: ' + error.message;
        }
    }

    translateButton.disabled = false;
    translateButton.classList.remove('button-disabled');
});
    copyButton.disabled = true;
    updateGlobeAndInfo(targetLanguage.value);
      }})
