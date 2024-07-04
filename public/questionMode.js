import { languageInfo, funLanguageInfo, historicLanguageInfo, alienLanguageInfo } from './languagedata.js';

document.addEventListener('DOMContentLoaded', function() {
    const questions = [
        { title: "Select input type you will provide", type: "inputType", options: ["Text", "Image"] },
        { title: "Selected category", type: "category", options: ["Modern Languages", "Historic Languages", "Alien Languages", "Fun Languages"] },
        { title: "Selected language", type: "language", options: [] },
        { title: "Enter the text you want to translate", type: "text" }
    ];

    let currentQuestionIndex = 0;
    let answers = {};
    let uploadedImage = null;

    const elements = {
        questionTitle: document.getElementById('questionTitle'),
        answerArea: document.getElementById('answerArea'),
        prevButton: document.getElementById('prevButton'),
        progressBar: document.getElementById('progressBar'),
        resultArea: document.getElementById('resultArea'),
        translationResult: document.getElementById('translationResult'),
        copyButton: document.getElementById('copyButton'),
        tweetButton: document.getElementById('twitterShareButton'),
        selectionSummary: document.getElementById('selectionSummary'),
        navigationButtons: document.getElementById('navigationButtons')
    };

    function updateProgressBar() {
        const totalSteps = answers.inputType === 'Image' ? 3 : questions.length;
        let currentStep = answers.inputType === 'Image' ? 1 : currentQuestionIndex + 1;
        if (answers.inputType === 'Image') {
            if (uploadedImage) currentStep = 2;
            if (elements.translationResult.textContent) currentStep = 3;
        }
        elements.progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;
    }

    function updateQuestion() {
        const question = questions[currentQuestionIndex];
        elements.questionTitle.innerHTML = answers.inputType === 'Image' 
            ? 'Select an image to translate' 
            : `Step ${currentQuestionIndex + 1}<br>${question.title}`;
        
        elements.answerArea.innerHTML = '';
        updateSelectionSummary();

        if (question.type === 'text' && answers.inputType === 'Image') {
            displayImageUpload();
        } else if (['inputType', 'category', 'language'].includes(question.type)) {
            question.options.forEach(option => {
                const button = document.createElement('button');
                button.textContent = option;
                button.addEventListener('click', () => selectOption(option));
                elements.answerArea.appendChild(button);
            });
        } else if (question.type === 'text' && answers.inputType === 'Text') {
            const textarea = document.createElement('textarea');
            textarea.id = 'translationInput';
            textarea.className = 'full-width';
            elements.answerArea.appendChild(textarea);

            const translateButton = document.createElement('button');
            translateButton.textContent = 'Translate';
            translateButton.addEventListener('click', () => {
                answers.text = textarea.value;
                showResult();
            });
            elements.answerArea.appendChild(translateButton);
        }

        updateProgressBar();
        updateNavigationButtons();
    }

    function selectOption(option) {
        answers[questions[currentQuestionIndex].type] = option;
        
        if (questions[currentQuestionIndex].type === 'inputType') {
            if (option === 'Image') {
                currentQuestionIndex = questions.length - 1;
                answers.category = 'Modern Languages';
                answers.language = 'English';
                updateLanguageOptions('Modern Languages');
            } else {
                currentQuestionIndex++;
            }
        } else if (questions[currentQuestionIndex].type === 'category') {
            updateLanguageOptions(option);
            currentQuestionIndex++;
        } else {
            currentQuestionIndex++;
        }
        
        updateQuestion();
    }

    function updateLanguageOptions(category) {
        const languageSets = {
            'Modern Languages': languageInfo,
            'Historic Languages': historicLanguageInfo,
            'Alien Languages': alienLanguageInfo,
            'Fun Languages': funLanguageInfo
        };
        questions[2].options = Object.keys(languageSets[category] || {});
    }

    function updateNavigationButtons() {
        elements.navigationButtons.innerHTML = '';
        if (currentQuestionIndex > 0 || (answers.inputType === 'Image' && uploadedImage)) {
            const prevButton = document.createElement('button');
            prevButton.classList.add('nav-button');
            prevButton.textContent = 'Previous';
            prevButton.addEventListener('click', prevQuestion);
            elements.navigationButtons.appendChild(prevButton);
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

        elements.answerArea.appendChild(uploadButton);
        elements.answerArea.appendChild(fileInput);
    }

    function displayUploadedImage(fileName) {
        elements.answerArea.innerHTML = '';
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
        elements.answerArea.appendChild(container);
        updateProgressBar();
    }

    function resizeImage(img, maxWidth = 800, maxHeight = 600) {
        let { width, height } = img;
        if (width > height) {
            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }
        } else if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        return canvas.toDataURL('image/jpeg', 0.7);
    }

    async function translateImage() {
        const translateButton = elements.answerArea.querySelector('button');
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageData, mimeType: mimeType }),
            });

            if (!response.ok) {
                throw new Error(`Image description failed: ${await response.text()}`);
            }

            const data = await response.json();
            answers.text = data.englishDescription;

            if (answers.language.toLowerCase() !== 'english') {
                const translateResponse = await fetch('/api/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: answers.text, targetLanguage: answers.language }),
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
            alert('An error occurred while processing the image. Please try again later.');
        } finally {
            translateButton.disabled = false;
            translateButton.classList.remove('button-processing');
            translateButton.textContent = 'Translate Image';
        }
    }

    function updateSelectionSummary() {
        elements.selectionSummary.innerHTML = '';
        if (answers.inputType === 'Image') {
            elements.selectionSummary.innerHTML = `
                <div>Input Type: Image</div>
                <div>Target Language: ${answers.language || 'English'}</div>
            `;
        } else {
            for (let i = 0; i < currentQuestionIndex; i++) {
                const div = document.createElement('div');
                div.textContent = `${questions[i].title}: ${answers[questions[i].type]}`;
                elements.selectionSummary.appendChild(div);
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
                currentQuestionIndex = 0;
                answers = {};
                resetImageSelection();
            } else {
                currentQuestionIndex--;
            }
            updateQuestion();
        }
    }

    async function showResult() {
        const translateButton = elements.answerArea.querySelector('button');
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
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: answers.text, targetLanguage: answers.language }),
                });
    
                if (!response.ok) {
                    throw new Error('Translation failed');
                }
    
                const data = await response.json();
                result = data.result;
            }
    
            elements.translationResult.textContent = result;
            updateProgressBar();
            elements.resultArea.style.display = 'block';
            document.getElementById('questionContent').style.display = 'none';
            elements.navigationButtons.style.display = 'none';
    
            if (uploadedImage && answers.inputType === 'Image') {
                const imageContainer = document.createElement('div');
                imageContainer.innerHTML = `<img src="${uploadedImage}" alt="Uploaded Image" style="max-width: 100%; max-height: 300px;">`;
                elements.resultArea.insertBefore(imageContainer, elements.resultArea.firstChild);
            }
    
            const completedMessage = document.createElement('p');
            completedMessage.textContent = 'Translation completed!';
            completedMessage.style.color = '#4CAF50';
            completedMessage.style.fontWeight = 'bold';
            elements.selectionSummary.appendChild(completedMessage);
    
        } catch (error) {
            elements.translationResult.textContent = 'An error occurred during translation.';
        } finally {
            if (translateButton) {
                translateButton.disabled = false;
                translateButton.classList.remove('button-processing');
            }
        }
    }

    elements.copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(elements.translationResult.textContent)
            .then(() => {
                elements.copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    elements.copyButton.textContent = 'Copy';
                }, 2000);
            })
            .catch(err => console.error('Failed to copy: ', err));
    });

    elements.tweetButton.addEventListener('click', () => {
        const tweetText = encodeURIComponent(`Check out this translation: ${elements.translationResult.textContent}`);
        window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
    });

    const homeLink = document.createElement('a');
    homeLink.href = 'https://www.speakallai.com/';
    homeLink.textContent = 'Back to Home';
    homeLink.className = 'home-link';
    elements.resultArea.appendChild(homeLink);
 
    const refreshLink = document.createElement('a');
    refreshLink.href = 'questionMode.html';
    refreshLink.textContent = 'Refresh';
    refreshLink.className = 'refresh-link';
    elements.resultArea.appendChild(refreshLink);
    
    elements.prevButton.addEventListener('click', prevQuestion);

    // Initialize the question mode
    updateQuestion();
});