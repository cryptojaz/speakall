import { languageInfo, funLanguageInfo, historicLanguageInfo, alienLanguageInfo } from './languagedata.js';

document.addEventListener('DOMContentLoaded', function() {
    const questions = [
        {
            title: "Select input type you will provide",
            type: "inputType",
            options: ["Text", "Image"]
        },
        {
            title: "Selected category",
            type: "category",
            options: ["Modern Languages", "Historic Languages", "Alien Languages", "Fun Languages"]
        },
        {
            title: "Selected language",
            type: "language",
            options: [] // This will be populated based on the selected category
        },
        {
            title: "Enter the text you want to translate",
            type: "text"
        }
    ];

    let currentQuestionIndex = 0;
    let answers = {};
    let uploadedImage = null;

    const questionTitle = document.getElementById('questionTitle');
    const answerArea = document.getElementById('answerArea');
    const prevButton = document.getElementById('prevButton');
    const progressBar = document.getElementById('progressBar');
    const resultArea = document.getElementById('resultArea');
    const translationResult = document.getElementById('translationResult');
    const copyButton = document.getElementById('copyButton');
    const tweetButton = document.getElementById('twitterShareButton');


    function updateProgressBar() {
        const totalSteps = answers.inputType === 'Image' ? 3 : questions.length;
        let currentStep = answers.inputType === 'Image' ? 1 : currentQuestionIndex + 1;
    
        if (answers.inputType === 'Image') {
            if (uploadedImage) {
                currentStep = 2;
            }
            if (translationResult.textContent) {
                currentStep = 3;
            }
        }
    
        const progress = (currentStep / totalSteps) * 100;
        progressBar.style.width = `${progress}%`;
    }

    function updateQuestion() {
        console.log('Updating question. Current index:', currentQuestionIndex);
    
        const question = questions[currentQuestionIndex];
        
        if (answers.inputType === 'Image') {
            questionTitle.innerHTML = 'Select an image to translate';
        } else {
            let stepNumber = currentQuestionIndex + 1;
            questionTitle.innerHTML = `Step ${stepNumber}<br>${question.title}`;
        }
    
        answerArea.innerHTML = '';
        
        updateSelectionSummary();
    
        switch (question.type) {
            case 'inputType':
            case 'category':
            case 'language':
                question.options.forEach(option => {
                    const button = document.createElement('button');
                    button.textContent = option;
                    button.addEventListener('click', () => selectOption(option));
                    answerArea.appendChild(button);
                });
                break;
            case 'text':
                if (answers.inputType === 'Text') {
                    const textarea = document.createElement('textarea');
                    textarea.id = 'translationInput';
                    textarea.className = 'full-width';
                    answerArea.appendChild(textarea);
    
                    const translateButton = document.createElement('button');
                    translateButton.textContent = 'Translate';
                    translateButton.addEventListener('click', () => {
                        answers.text = textarea.value;
                        showResult();
                    });
                    answerArea.appendChild(translateButton);
                } else if (answers.inputType === 'Image') {
                    displayImageUpload();
                }
                break;
        }
    
        updateProgressBar();
        updateNavigationButtons();
        console.log('Current question index:', currentQuestionIndex);
    }

    function selectOption(option) {
        answers[questions[currentQuestionIndex].type] = option;
        
        if (questions[currentQuestionIndex].type === 'inputType') {
            if (option === 'Image') {
                currentQuestionIndex = questions.length - 1;
                answers.category = 'Modern Languages';
                answers.language = 'English'; // Default to English
                updateLanguageOptions('Modern Languages');
            } else {
                currentQuestionIndex++;
            }
        } else if (questions[currentQuestionIndex].type === 'category') {
            updateLanguageOptions(option);
            currentQuestionIndex++;
        } else if (questions[currentQuestionIndex].type === 'language') {
            answers.language = option;
            currentQuestionIndex++;
        } else {
            currentQuestionIndex++;
        }
        
        updateQuestion();
        updateProgressBar();
    }

    function updateLanguageOptions(category) {
        let languageSet;
        switch (category) {
            case 'Modern Languages':
                languageSet = languageInfo;
                break;
            case 'Historic Languages':
                languageSet = historicLanguageInfo;
                break;
            case 'Alien Languages':
                languageSet = alienLanguageInfo;
                break;
            case 'Fun Languages':
                languageSet = funLanguageInfo;
                break;
        }
        questions[2].options = Object.keys(languageSet);
    }

    function updateNavigationButtons() {
        const navigationButtons = document.getElementById('navigationButtons');
        navigationButtons.innerHTML = '';
    
        if (currentQuestionIndex > 0 || (answers.inputType === 'Image' && uploadedImage)) {
            const prevButton = document.createElement('button');
            prevButton.classList.add('nav-button');
            prevButton.textContent = 'Previous';
            prevButton.addEventListener('click', prevQuestion);
            navigationButtons.appendChild(prevButton);
        }
    }

function displayImageUpload() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    const uploadButton = document.createElement('button');
    uploadButton.textContent = 'Select Image';
    uploadButton.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImage = e.target.result;
                displayUploadedImage(file.name);
              
            };
            reader.readAsDataURL(file);
        }
    });

    answerArea.appendChild(uploadButton);
    answerArea.appendChild(fileInput);
}
function displayUploadedImage(fileName) {
    answerArea.innerHTML = '';
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';

    const imageContainer = document.createElement('div');
    imageContainer.style.width = '80%';
    imageContainer.style.textAlign = 'center';
    imageContainer.style.marginBottom = '20px';

    const img = document.createElement('img');
    img.src = uploadedImage;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '400px';
    img.style.objectFit = 'contain';
    imageContainer.appendChild(img);

    const fileNameDisplay = document.createElement('p');
    fileNameDisplay.textContent = `File: ${fileName}`;
    fileNameDisplay.style.marginTop = '10px';
    imageContainer.appendChild(fileNameDisplay);

    const translateButton = document.createElement('button');
    translateButton.textContent = 'Translate Image';
    translateButton.style.width = '200px';
    translateButton.addEventListener('click', translateImage);

    container.appendChild(imageContainer);
    container.appendChild(translateButton);
    answerArea.appendChild(container);
    updateProgressBar(); // Add this line
}

function resizeImage(img, maxWidth = 800, maxHeight = 600) {
    let width = img.width;
    let height = img.height;

    if (width > height) {
        if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
        }
    } else {
        if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
        }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.7);
}

async function translateImage() {
    const translateButton = document.querySelector('button');
    translateButton.disabled = true;
    translateButton.classList.add('button-processing');
    translateButton.textContent = 'Processing...Average 10 seconds';

    try {
        const img = new Image();
        img.src = uploadedImage;
        await new Promise((resolve) => { img.onload = resolve; });
        const resizedImage = resizeImage(img);
        
        const imageData = resizedImage.split(',')[1];
        const mimeType = resizedImage.split(',')[0].split(':')[1].split(';')[0];

        const response = await fetch('/api/describeImage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: imageData,
                mimeType: mimeType
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Image description failed: ${errorText}`);
        }

        const data = await response.json();
        answers.text = data.englishDescription;

        // Only translate if the target language is not English
        if (answers.language.toLowerCase() !== 'english') {
            const translateResponse = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: answers.text,
                    targetLanguage: answers.language
                }),
            });

            if (!translateResponse.ok) {
                throw new Error('Translation failed');
            }

            const translateData = await translateResponse.json();
            answers.translatedText = translateData.result;
        } else {
            answers.translatedText = answers.text;
        }

        showResult();
    } catch (error) {
        console.error('Error processing image:', error);
        alert('An error occurred while processing the image. Please try again later.');
    } finally {
        translateButton.disabled = false;
        translateButton.classList.remove('button-processing');
        translateButton.textContent = 'Translate Image';
    }
}

function updateSelectionSummary() {
    const summary = document.getElementById('selectionSummary');
    summary.innerHTML = '';
    if (answers.inputType === 'Image') {
        summary.innerHTML = `
            <div>Input Type: Image</div>
            <div>Target Language: ${answers.language || 'English'}</div>
        `;
    } else {
        for (let i = 0; i < currentQuestionIndex; i++) {
            const div = document.createElement('div');
            div.textContent = `${questions[i].title}: ${answers[questions[i].type]}`;
            summary.appendChild(div);
        }
    }
}
    
function resetImageSelection() {
    uploadedImage = null;
    answers.text = null;
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        if (answers.inputType === 'Image' && currentQuestionIndex === questions.length - 1) {
            currentQuestionIndex = 0;  // Go back to input type selection
            answers = {};  // Reset answers
            resetImageSelection();
        } else {
            currentQuestionIndex--;
        }
        updateQuestion();
    }
}
    // ... (keep the rest of the functions as they were)

    async function showResult() {
        const translateButton = document.querySelector('button');
        if (translateButton) {
            translateButton.disabled = true;
            translateButton.classList.add('button-processing');
        }
    
        try {
            let result;
            if (answers.inputType === 'Image') {
                result = answers.translatedText;
            } else {
                const response = await fetch('/api/translate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: answers.text,
                        targetLanguage: answers.language
                    }),
                });
    
                if (!response.ok) {
                    throw new Error('Translation failed');
                }
    
                const data = await response.json();
                result = data.result;
            }
    
            translationResult.textContent = result;
            updateProgressBar();
            resultArea.style.display = 'block';
            document.getElementById('questionContent').style.display = 'none';
            document.getElementById('navigationButtons').style.display = 'none';
    
            if (uploadedImage && answers.inputType === 'Image') {
                const imageContainer = document.createElement('div');
                imageContainer.innerHTML = `<img src="${uploadedImage}" alt="Uploaded Image" style="max-width: 100%; max-height: 300px;">`;
                resultArea.insertBefore(imageContainer, resultArea.firstChild);
            }
    
            const completedMessage = document.createElement('p');
            completedMessage.textContent = 'Translation completed!';
            completedMessage.style.color = '#4CAF50';
            completedMessage.style.fontWeight = 'bold';
            document.getElementById('selectionSummary').appendChild(completedMessage);
    
        } catch (error) {
            console.error('Error during translation:', error);
            translationResult.textContent = 'An error occurred during translation.';
        } finally {
            if (translateButton) {
                translateButton.disabled = false;
                translateButton.classList.remove('button-processing');
            }
        }
    }

  
    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(translationResult.textContent)
            .then(() => {
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = 'Copy';
                }, 2000);
            })
            .catch(err => console.error('Failed to copy: ', err));
    });

    tweetButton.addEventListener('click', () => {
 
        const tweetText = encodeURIComponent(`Check out this translation: ${translationResult.textContent}`);
        window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
    });

    const homeLink = document.createElement('a');
    homeLink.href = 'https://www.speakallai.com/';
    homeLink.textContent = 'Back to Home';
    homeLink.className = 'home-link';
    resultArea.appendChild(homeLink);
 
    const refreshLink = document.createElement('a');
refreshLink.href = 'questionMode.html'; // This will reload the question mode page
refreshLink.textContent = 'Refresh';
refreshLink.className = 'refresh-link';
resultArea.appendChild(refreshLink);
    
    prevButton.addEventListener('click', prevQuestion);
   

// Initialize the question mode
// Initialize the question mode
currentQuestionIndex = 0;
answers = {};
updateQuestion();
console.log('Guide mode initialized. Starting index:', currentQuestionIndex);
});